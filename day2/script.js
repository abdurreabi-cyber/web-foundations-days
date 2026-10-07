const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");

const STORAGE_KEY = "quicknotes";

let notes = loadNotes();
let searchTerm = "";

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load notes:", error);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.className = `note-card category-${note.category.toLowerCase()}`;

  const text = document.createElement("p");
  text.className = "note-text";
  text.textContent = note.text;

  const meta = document.createElement("div");
  meta.className = "note-meta";

  const category = document.createElement("span");
  category.className = "note-category";
  category.textContent = note.category;

  const date = document.createElement("span");
  date.className = "note-date";
  date.textContent = note.createdAt;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id));

  meta.append(category, date, deleteButton);
  li.append(text, meta);

  return li;
}

function render() {
  notesList.textContent = "";

  const filteredNotes = notes.filter((note) => {
    const matchesText = note.text.toLowerCase().includes(searchTerm);
    const matchesCategory = note.category.toLowerCase().includes(searchTerm);
    return matchesText || matchesCategory;
  });

  filteredNotes.forEach((note) => {
    notesList.appendChild(createNoteElement(note));
  });

  updateCount();
}

function addNote(event) {
  event.preventDefault();

  const text = noteInput.value.trim();
  const category = noteCategory.value;

  if (!text) {
    showError("Please type a note first.");
    return;
  }

  if (text.length > 200) {
    showError("Notes must be 200 characters or fewer.");
    return;
  }

  clearError();

  const note = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    category,
    createdAt: new Date().toLocaleString()
  };

  notes.push(note);
  saveNotes();
  render();

  noteInput.value = "";
  noteInput.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

noteForm.addEventListener("submit", addNote);

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

render();