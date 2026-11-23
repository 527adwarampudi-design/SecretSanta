// =============================================================
// 3.06 Secret Santa Generator: organizer page
// =============================================================

const API = "PASTE YOUR /exec WEB ADDRESS HERE";

let names = [];

// DOM Elements
const nameInput = document.getElementById("name-input");
const addButton = document.getElementById("add-button");
const nameList = document.getElementById("name-list");
const santaForm = document.getElementById("santa-form");
const message = document.getElementById("message");
const matchesContainer = document.getElementById("matches");
const printButton = document.getElementById("print-button");

// 1. Collect the names (No blanks, no duplicates)
addButton.addEventListener("click", addName);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addName();
  }
});

function addName() {
  const name = nameInput.value.trim();
  
  if (name === "") {
    message.textContent = "Name cannot be blank.";
    message.className = "mt-3 text-center text-danger fw-semibold";
    return;
  }

  // Check for duplicates (case-insensitive)
  const isDuplicate = names.some(n => n.toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    message.textContent = `"${name}" is already on the list!`;
    message.className = "mt-3 text-center text-danger fw-semibold";
    return;
  }

  names.push(name);
  nameInput.value = "";
  message.textContent = "";
  renderNames();
}

function renderNames() {
  nameList.innerHTML = "";
  names.forEach((name, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${name}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeName(${index})">Remove</button>
    `;
    nameList.appendChild(li);
  });
}

window.removeName = function(index) {
  names.splice(index, 1);
  renderNames();
};

// 2. Generate matches on form submit
santaForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from reloading

  const budget = document.getElementById("budget").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value.trim();

  // Validation: Need at least 3 names and all 4 rules filled in
  if (names.length < 3) {
    message.textContent = "You need at least 3 participants!";
    message.className = "mt-3 text-center text-danger fw-semibold";
    return;
  }

  if (!budget || !date || !time || !location) {
    message.textContent = "Please fill out all 4 gift rules (budget, date, time, location)!";
    message.className = "mt-3 text-center text-danger fw-semibold";
    return;
  }

  message.textContent = "Generating matches...";
  message.className = "mt-3 text-center text-info fw-semibold";

  // Shuffle names using Fisher-Yates shuffle
  let shuffled = names.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Create pairs: nobody gets themselves, everyone gives once & receives once
  let pairs = [];
  for (let i = 0; i < shuffled.length; i++) {
    let giver = shuffled[i];
    let receiver = shuffled[(i + 1) % shuffled.length]; // Loops back to index 0 for the last person
    pairs.push({ giver: giver, receiver: receiver });
  }

  // Package data for Apps Script
  const payload = {
    pairs: pairs,
    rules: {
      budget: budget,
      date: date,
      time: time,
      location: location
    }
  };

  try {
    // 3. Send to Google Sheet with fetch() POST (No Content-Type header!)
    const response = await fetch(API, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const resultData = await response.json();

    // 4. Check the reply
    if (resultData.result === "success") {
      message.textContent = "Matches successfully saved!";
      message.className = "mt-3 text-center text-success fw-semibold";

      // Build neat HTML for the modal popup
      let html = `
        <div class="mb-3">
          <p class="mb-1"><strong>Budget:</strong> ${budget}</p>
          <p class="mb-1"><strong>Date:</strong> ${date} at ${time}</p>
          <p class="mb-0"><strong>Location:</strong> ${location}</p>
        </div>
        <hr>
        <ul class="list-group">
      `;

      pairs.forEach(p => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
          <span>🎁 <strong>${p.giver}</strong></span>
          <span class="text-muted">buys for</span>
          <span class="badge bg-success rounded-pill">${p.receiver}</span>
        </li>`;
      });
      html += `</ul>`;

      matchesContainer.innerHTML = html;

      // Open Bootstrap Modal popup
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("matches-modal"));
      modal.show();
    } else {
      throw new Error("Server returned failure");
    }

  } catch (error) {
    console.error(error);
    message.textContent = "Error saving matches. Check your API URL and console.";
    message.className = "mt-3 text-center text-danger fw-semibold";
  }
});

// 5. Print button functionality
printButton.addEventListener("click", () => {
  window.print();
});