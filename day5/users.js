// URL for the users API
const API_URL = "https://jsonplaceholder.typicode.com/users";

// Grab DOM elements
const loadBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusEl = document.getElementById("status");
const usersList = document.getElementById("users-list");

// Store the loaded users here so we can filter without re-fetching
let allUsers = [];

/**
 * Update the #status element with a message and a style class.
 * @param {string} message
 * @param {"loading"|"success"|"error"|""} type
 */
function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

/**
 * Create a single <li> element for a user using createElement + textContent.
 * @param {{name:string, email:string, address:{city:string}, company:{name:string}}} user
 * @returns {HTMLLIElement}
 */
function createUserItem(user) {
  const li = document.createElement("li");

  const name = document.createElement("h3");
  name.textContent = user.name;
  li.appendChild(name);

  const email = document.createElement("p");
  email.textContent = `Email: ${user.email}`;
  li.appendChild(email);

  const city = document.createElement("p");
  city.textContent = `City: ${user.address.city}`;
  li.appendChild(city);

  const company = document.createElement("p");
  company.textContent = `Company: ${user.company.name}`;
  li.appendChild(company);

  return li;
}

/**
 * Render any array of users into the #users-list.
 * @param {Array} list
 */
function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    usersList.appendChild(li);
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach((user) => fragment.appendChild(createUserItem(user)));
  usersList.appendChild(fragment);
}

/**
 * Fetch users from the API and render them.
 * Uses async/await with try/catch/finally.
 */
async function loadUsers() {
  loadBtn.disabled = true;
  setStatus("Loading users...", "loading");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const users = await response.json();
    allUsers = users;

    renderUsers(allUsers);
    setStatus(`Loaded ${users.length} users.`, "success");
  } catch (error) {
    allUsers = [];
    usersList.innerHTML = "";
    setStatus(`Error: ${error.message}`, "error");
  } finally {
    loadBtn.disabled = false;
  }
}

/**
 * Filter the stored users by name (case-insensitive) and re-render.
 */
function handleFilter() {
  const term = filterInput.value.trim().toLowerCase();

  if (term === "") {
    renderUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(term)
  );

  renderUsers(filtered);
}

// Wire up events
loadBtn.addEventListener("click", loadUsers);
filterInput.addEventListener("input", handleFilter);