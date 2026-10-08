# Library API — Books Resource

A REST API design for managing **books** in a library.

Base URL: `/api`

All request and response bodies use `application/json`.

## Book Object

```json
{
  "id": 1,
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "978-0261102217",
  "publishedYear": 1937,
  "available": true
}