const API_URL = "https://jsonplaceholder.typicode.com/posts";
const loadButton = document.querySelector("#load-btn");
const statusElement = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");

let notes = [];

function setStatus(message, type = "info") {
  statusElement.textContent = message;
  statusElement.className = `status status-${type}`;
}

function setBusy(button, busy, busyLabel, normalLabel) {
  button.disabled = busy;
  button.textContent = busy ? busyLabel : normalLabel;
}

// Reusable request helper: all network operations use this function.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText || "HTTP error"}).`);
  }
  // DELETE may return an empty response body.
  if (response.status === 204) return { data: null, status: response.status };
  const data = await response.json();
  return { data, status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes to show. Load notes or create one to get started.";
    notesList.append(emptyItem);
    return;
  }

  for (const note of notes) {
    const item = document.createElement("li");
    item.className = "note-card";

    const content = document.createElement("div");
    content.className = "note-content";
    const title = document.createElement("h3");
    title.textContent = note.title ?? "Untitled";
    const body = document.createElement("p");
    body.textContent = note.body ?? "";
    const meta = document.createElement("small");
    meta.textContent = `Note ID: ${note.id}`;
    content.append(title, body, meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

    item.append(content, deleteButton);
    notesList.append(item);
  }
}

async function loadNotes() {
  setBusy(loadButton, true, "Loading...", "Load notes");
  setStatus("Loading notes...", "loading");
  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = Array.isArray(result.data) ? result.data : [];
    renderNotes();
    if (notes.length === 0) {
      setStatus("The server returned no notes.", "info");
    } else {
      setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    setStatus(`Could not load notes. ${error.message}`, "error");
  } finally {
    setBusy(loadButton, false, "Loading...", "Load notes");
  }
}

async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  setBusy(submitButton, true, "Creating...", "Create note");
  setStatus("Creating note...", "loading");
  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    // JSONPlaceholder simulates POST but does not persist the new note.
    // Keep the returned note in this browser's in-memory list for this session.
    notes.unshift(result.data);
    renderNotes();
    noteForm.reset();
    setStatus(`Note created (status ${result.status}, id ${result.data.id}).`, "success");
  } catch (error) {
    setStatus(`Could not create note. ${error.message}`, "error");
  } finally {
    setBusy(submitButton, false, "Creating...", "Create note");
  }
}

async function deleteNote(id, button) {
  setBusy(button, true, "Deleting...", "Delete");
  setStatus(`Deleting note ${id}...`, "loading");
  try {
    const result = await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    notes = notes.filter(note => String(note.id) !== String(id));
    renderNotes();
    setStatus(`Note ${id} deleted (status ${result.status}).`, "success");
  } catch (error) {
    setStatus(`Could not delete note ${id}. ${error.message}`, "error");
  } finally {
    // Re-rendering may replace this button; setting its state is still safe.
    setBusy(button, false, "Deleting...", "Delete");
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
renderNotes();
