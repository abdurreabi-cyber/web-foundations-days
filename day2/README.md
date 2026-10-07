# QuickNotes

QuickNotes is a small note-taking web app built with vanilla HTML, CSS, and JavaScript. It lets users add notes with a category, search through them, delete notes, and keep everything saved in the browser with localStorage so notes remain after a page refresh.

## Features

- Add notes with Personal, Work, or Study categories.
- Validate empty notes and notes over 200 characters.
- Display notes as cards with category colors and readable dates.
- Delete individual notes.
- Search notes by text or category.
- Count message for zero, one, or many notes.
- Persist notes in localStorage.

## How to run locally

1. Download or clone this repository.
2. Open the `quicknotes-app` folder.
3. Open `index.html` in any modern web browser.
4. No build tools or server are required.

## What I learned

- How to structure a page with semantic HTML and connect form labels to inputs.
- How to use Flexbox and media queries to make a layout responsive.
- How to manage application state with an array of objects and render it with `createElement` and `textContent`.
- How to save and load data in the browser using `localStorage`, `JSON.stringify`, and `JSON.parse`.