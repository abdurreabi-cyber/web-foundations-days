# SnapShare: Photo-Sharing App Scaling Plan

## 1. Assumptions

- Registered users: 10,000,000.
- Daily active users (DAU): 10% of registered users.
- Each daily active user uploads 1 photo per day.
- Each daily active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Each photo has one thumbnail of 50 KB.
- For estimates, use 30 days per month and 365 days per year.
- Average requests are spread across 24 hours. Peak feed traffic is estimated at 5 times the average.
- These estimates count feed-page views as requests and do not include extra API calls, retries, video, or multiple sizes of thumbnails.

## 2. Capacity estimates

### Daily active users

DAU = 10,000,000 × 10% = **1,000,000 active users per day**.

### Uploads per second

Daily uploads = 1,000,000 users × 1 photo = **1,000,000 photos/day**.

Average uploads per second = 1,000,000 ÷ 86,400 = **about 11.6 uploads/second**.

### Feed views per second

Daily feed-page views = 1,000,000 users × 50 pages = **50,000,000 feed views/day**.

Average feed views per second = 50,000,000 ÷ 86,400 = **about 579 views/second**.

Peak feed views per second = 579 × 5 = **about 2,895 views/second**.

### Photo storage per year

Original-photo storage per day = 1,000,000 × 2 MB = **2,000,000 MB/day**, or about **2 TB/day** using decimal units.

Original-photo storage per year = 2 TB × 365 = **about 730 TB/year**.

Thumbnail storage per day = 1,000,000 × 50 KB = **50,000,000 KB/day**, or about **50 GB/day**.

Thumbnail storage per year = 50 GB × 365 = **about 18.25 TB/year**.

Total new photo and thumbnail storage per year = 730 TB + 18.25 TB = **about 748.25 TB/year** (roughly 0.75 PB/year), before replication, backups, metadata, and storage overhead.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy** by request count: it receives about 50 million feed-page views per day compared with 1 million photo uploads per day, or about 50 feed views for every upload. The design should scale feed reads with a CDN, cache, load balancer, app-server fleet, and database read replica, while processing thumbnail creation asynchronously so uploads do not need to wait for image processing.

## 4. Where photo files should be stored

Photo files should be stored in **object storage**, while the database stores metadata such as photo ID, owner, object-storage key, upload time, and access permissions. Large binary files are better suited to object storage because it can scale for large files independently of database queries, while the database remains focused on searchable and consistent metadata.

## 5. Text architecture diagram

```text
                         +----------------------+
                         |        Users         |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |          CDN         |
                         | cached photos/thumbs |
                         +----------+-----------+
                                    |
                      feed/API requests and misses
                                    |
                                    v
                         +----------------------+
                         |    Load Balancer     |
                         +----------+-----------+
                                    |
                    +---------------+---------------+
                    |               |               |
                    v               v               v
              +-----------+   +-----------+   +-----------+
              | App Server|   | App Server|   | App Server|
              +-----+-----+   +-----+-----+   +-----+-----+
                    |               |               |
                    +---------------+---------------+
                                    |
                   +----------------+----------------+
                   |                                 |
                   v                                 v
            +-------------+                    +-------------+
            |    Cache    |                    |  Database   |
            | feed/session|                    |  (primary)  |
            +-------------+                    +------+------+
                                                     |
                                                     v
                                               +-------------+
                                               | Read Replica|
                                               +-------------+

Photo upload from app server:
        |
        +-----------------------> +------------------+
                                  |  Object Storage  |
                                  | original photos  |
                                  +--------+---------+
                                           |
                                           v
                                  +------------------+
                                  |      Queue       |
                                  +--------+---------+
                                           |
                                           v
                                  +------------------+
                                  | Thumbnail Worker |
                                  +--------+---------+
                                           |
                                           v
                                  +------------------+
                                  |  Object Storage  |
                                  | thumbnails       |
                                  +------------------+
```

## 6. What each component solves

- **CDN:** Serves frequently requested photos and thumbnails from locations closer to users, reducing latency and origin traffic.
- **Load balancer:** Distributes incoming API requests across healthy app servers so one server does not become a bottleneck.
- **App servers:** Handle authentication, upload requests, feed generation, permissions, and application logic.
- **Cache:** Keeps frequently accessed feed data or session data in fast memory to reduce repeated database work.
- **Primary database:** Stores and updates photo metadata, user relationships, and other structured records.
- **Database read replica:** Serves suitable read queries to increase read capacity and reduce pressure on the primary database.
- **Object storage:** Stores original photos and generated thumbnails as files without placing large image binaries in database rows.
- **Queue:** Holds thumbnail-generation jobs so upload requests can finish without waiting for image processing.
- **Thumbnail worker:** Pulls jobs from the queue, creates smaller thumbnail images, and saves them to object storage.

## 7. Photo upload flow

1. The user selects a photo and sends an upload request to SnapShare.
2. The load balancer routes the request to a healthy app server.
3. The app server authenticates the user and checks the file type, size, and upload permissions.
4. The app server stores the original photo in object storage, using a unique object key.
5. The app server writes the photo's metadata and object key to the primary database.
6. The app server adds a thumbnail-generation job to the queue.
7. The app server returns an upload-success response without waiting for the thumbnail to be created.
8. A thumbnail worker takes the queued job, reads the original photo from object storage, and generates a 50 KB thumbnail.
9. The worker stores the thumbnail in object storage and updates thumbnail status or metadata in the database if needed.
10. When users view feeds, app servers retrieve feed metadata from cache or the database, and the CDN serves the photo or thumbnail files when available.

If the original-photo upload succeeds but saving metadata or queueing the job fails, the system needs retries and cleanup or reconciliation so it does not leave orphaned files or photos without thumbnails.

## 8. Trade-offs

1. **CDN caching vs. freshness and access control:** A CDN makes photo delivery faster and reduces origin traffic, but cached content may be stale and private photos require careful authorization and cache rules.
2. **Read replica vs. consistency:** A read replica increases read capacity, but replication lag can mean a newly uploaded photo or updated metadata is not immediately visible through replica-based reads.
3. **Asynchronous thumbnails vs. immediate completeness:** A queue keeps uploads responsive and smooths processing spikes, but a thumbnail may not be ready immediately after the upload succeeds.
4. **Cache speed vs. invalidation complexity:** Caching reduces database load, but updates, deleted content, and permission changes require reliable expiration or invalidation.
5. **Object storage vs. operational complexity:** Object storage scales well for image files, but the application must manage object keys, permissions, lifecycle policies, and recovery if a database write or queue operation fails.

## 9. Summary

- Daily active users: **1,000,000**.
- Average uploads: **about 11.6 per second**.
- Average feed views: **about 579 per second**.
- Peak feed views (5× average): **about 2,895 per second**.
- New original-photo storage: **about 730 TB/year**.
- New thumbnail storage: **about 18.25 TB/year**.
- Total new image storage: **about 748.25 TB/year**, before overhead.
- Traffic pattern: **read-heavy**.
