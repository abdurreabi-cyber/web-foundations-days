const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const DRAFT_KEY = "day4-note-draft";
const THEME_KEY = "day4-theme";

function updateCounts() {
    const text = noteText.value;
    const characterCount = text.length;
    const trimmedText = text.trim();
    const words = trimmedText === "" ? 0 : trimmedText.split(/\s+/).length;

    charCount.textContent = `${characterCount} / 200 characters`;
    wordCount.textContent = `${words} words`;

    charCount.classList.remove("warning", "over");

    if (characterCount > 200) {
        charCount.classList.add("over");
    } else if (characterCount > 180) {
        charCount.classList.add("warning");
    }
}

function saveDraft() {
    localStorage.setItem(DRAFT_KEY, noteText.value);
}

function clearNote() {
    noteText.value = "";
    localStorage.removeItem(DRAFT_KEY);
    updateCounts();
    noteText.focus();
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "Dark mode";
    }
}

noteText.addEventListener("input", () => {
    updateCounts();
    saveDraft();
});

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearNote();
    }
});

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

const savedDraft = localStorage.getItem(DRAFT_KEY);

if (savedDraft !== null) {
    noteText.value = savedDraft;
}

loadTheme();
updateCounts();
