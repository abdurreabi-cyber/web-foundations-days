# QuickNotes REST API Design

## Overview
The production QuickNotes API is a JSON REST API. All endpoints use HTTPS and return `application/json`. Authenticated routes require a bearer access token. IDs are server-generated.

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | `/v1/notes` | List the authenticated user's notes; supports `limit`, `cursor`, and `tag` query parameters | `200 OK` |
| POST | `/v1/notes` | Create a note owned by the authenticated user | `201 Created` |
| GET | `/v1/notes/{noteId}` | Retrieve one note the user is allowed to access | `200 OK` |
| PATCH | `/v1/notes/{noteId}` | Update supplied note fields | `200 OK` |
| DELETE | `/v1/notes/{noteId}` | Delete a note | `204 No Content` |
| GET | `/v1/tags` | List the user's tags | `200 OK` |
| POST | `/v1/notes/{noteId}/tags` | Attach an existing tag to a note | `200 OK` |

## Create a note

Request `POST /v1/notes`:
```json
{
  "title": "Project ideas",
  "body": "Plan the first milestone.",
  "tagIds": [2, 5]
}
```

Response `201 Created`:
```json
{
  "data": {
    "id": 1042,
    "userId": 17,
    "title": "Project ideas",
    "body": "Plan the first milestone.",
    "tags": [{"id": 2, "name": "work"}, {"id": 5, "name": "planning"}],
    "createdAt": "2026-10-12T12:00:00Z",
    "updatedAt": "2026-10-12T12:00:00Z"
  }
}
```

## List notes

Request `GET /v1/notes?limit=2`:
```http
GET /v1/notes?limit=2
Authorization: Bearer <access-token>
```

Response `200 OK`:
```json
{
  "data": [
    {"id": 1042, "title": "Project ideas", "body": "Plan the first milestone.", "createdAt": "2026-10-12T12:00:00Z"},
    {"id": 1041, "title": "Shopping list", "body": "Milk and bread.", "createdAt": "2026-10-11T08:30:00Z"}
  ],
  "page": {"limit": 2, "nextCursor": "eyJpZCI6MTA0MX0"}
}
```

## Error responses

| Status | Meaning | Typical situation |
|---|---|---|
| `400 Bad Request` | Invalid input | Missing title, malformed JSON, or invalid query parameter |
| `401 Unauthorized` | Authentication required/invalid | Missing, expired, or invalid token |
| `403 Forbidden` | Not allowed | User tries to access a resource they do not own |
| `404 Not Found` | Resource not found | Note or tag ID does not exist or is not visible to caller |
| `409 Conflict` | Conflict | Duplicate tag name or conflicting update |
| `422 Unprocessable Entity` | Validation failed | Field violates business validation rules |
| `429 Too Many Requests` | Rate limit exceeded | Client has sent too many requests |
| `500 Internal Server Error` | Unexpected server failure | Unhandled error |

Example error body:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title field is required.",
    "details": [{"field": "title", "issue": "required"}],
    "requestId": "req_8fd12a"
  }
}
```

## Conventions
- Use `Authorization: Bearer ...` for authenticated routes.
- Validate all user input on the server, even if the client validates it too.
- Return `201 Created` when a resource is created and `204 No Content` for a successful delete.
- Use cursor pagination so large note collections do not require expensive offset scans.
- Never expose another user's notes; authorization must be enforced on every resource request.
