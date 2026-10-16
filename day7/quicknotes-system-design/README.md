# QuickNotes System Design

QuickNotes is a small front-end API client and a system-design exercise for a notes service expected to scale to one million users. The browser client uses the JSONPlaceholder practice API to demonstrate GET, POST, and DELETE. The documents describe a proposed production API, relational data model, and scalable architecture.

## Features
- Load up to 10 notes with `GET`.
- Create a note with `POST`, including title validation (required, maximum 100 characters).
- Delete a note with `DELETE`.
- Loading, success, error, and empty states.
- Buttons disabled while their requests run.
- User-provided content inserted with `textContent`.
- REST API, SQL data model, and architecture documentation.

## Run the API client
1. Clone or download this repository.
2. Open the folder in a terminal.
3. Start a local static server (recommended because browsers may restrict `file://` requests). If Python is installed, run:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser.
5. Select **Load notes**, create a note, and try deleting one.

The client calls `https://jsonplaceholder.typicode.com/posts`. JSONPlaceholder is a practice API: POST responses are simulated and do not persist on the server. The client therefore keeps newly created notes in browser memory for the current page session only. Reloading the page loses those locally retained demo notes.

## Design documents
- [REST API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [Architecture](docs/architecture.md)
- [PostgreSQL schema file](database/quicknotes.sql)

## What I learned
- How to use a reusable async `fetch` helper and handle HTTP errors with `try/catch/finally`.
- How GET, POST, and DELETE fit into a REST-style client, including validation and user feedback.
- How primary keys, foreign keys, indexes, and join tables model relational data.
- How caching, read replicas, queues, and horizontal scaling address different system bottlenecks.
- Why an architecture needs explicit traffic assumptions, trade-offs, and failure-recovery plans.

## Git submission
The assignment requires at least five meaningful commits. Suggested sequence:
1. `Add HTML structure and responsive styles`
2. `Add GET notes API client`
3. `Add create note POST validation`
4. `Add delete note API handling`
5. `Add REST API design document`
6. `Add SQL data model and queries`
7. `Add scalable architecture document`
8. `Add project README`

Create these as separate commits as you implement the work; do not create fake historical commits just to meet the requirement.
