# QuickNotes Data Model

## Entities and relationships

- **users**: one user can own many notes (one-to-many).
- **notes**: each note belongs to exactly one user.
- **tags**: tags are owned by a user so each user can manage their own tag vocabulary.
- **note_tags**: bridge table that allows a note to have many tags and a tag to be attached to many notes (many-to-many).

## SQL schema (PostgreSQL)

```sql
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);
```

## Example queries

List the newest notes for one user:
```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 17
ORDER BY created_at DESC
LIMIT 20;
```

Find notes with a given tag (JOIN example):
```sql
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 17 AND t.name = 'planning'
ORDER BY n.created_at DESC;
```

Count notes per user:
```sql
SELECT u.id, u.email, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

## Index choice
`idx_notes_user_created (user_id, created_at DESC)` helps the common query that retrieves a user's newest notes. The leading `user_id` narrows the rows and the timestamp ordering supports recent-first pagination. The `note_tags(tag_id)` index helps reverse lookups from a tag to associated notes.

## SQL vs NoSQL
A relational SQL database such as PostgreSQL is the recommended starting point because users, notes, tags, and note-tag relationships have clear foreign-key constraints and transactional requirements. SQL protects referential integrity and supports joins and reporting. At very large scale, read replicas, caching, partitioning, and careful indexing can extend capacity before considering a different storage model.
