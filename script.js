// Departments by Category
const DEPARTMENTS = {
  "Water Supply": { name: "Water Department", email: "waterdept@gov.in" },
  "Health & Sanitation": { name: "Municipal Department", email: "municipal@gov.in" },
  "Education": { name: "Education Dept", email: "education@gov.in" },
  "Agriculture": { name: "Agriculture Dept", email: "agriculture@gov.in" },
  "Employment": { name: "Employment Office", email: "employment@gov.in" },
  "Infrastructure": { name: "PWD Department", email: "pwd@gov.in" },
  "Environment": { name: "Environmental Dept", email: "environment@gov.in" },
  "Digital Access": { name: "IT & Digital Dept", email: "digital@gov.in" },
  "Social Welfare": { name: "Social Welfare Dept", email: "social@gov.in" },
};

let issues = JSON.parse(localStorage.getItem("issues") || "[]");

// Add issue
document.getElementById("issueForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const issue = {
    title: title.value,
    category: category.value,
    severity: severity.value,
    description: description.value,
    location: location.value,
    photo: document.getElementById("photoPreview").src || "",
    id: Date.now(),
  };
  issues.push(issue);
  localStorage.setItem("issues", JSON.stringify(issues));
  renderTable();
  e.target.reset();
  photoPreview.style.display = "none";
});

// Photo upload
document.getElementById("photoFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    photoPreview.src = ev.target.result;
    photoPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Capture location
document.getElementById("locBtn").addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocation not supported!");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const link = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
      document.getElementById("location").value = link;
    },
    (err) => alert("Error getting location: " + err.message)
  );
});

// Render issues table
function renderTable() {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  issues.forEach((it, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${it.title}</td>
      <td>${it.category}</td>
      <td>${it.severity}</td>
      <td><a href="${it.location}" target="_blank">View</a></td>
      <td>${it.photo ? `<a href="${it.photo}" target="_blank">Photo</a>` : "—"}</td>
      <td>
        <button class="send" onclick="sendToDept(${i})">Send</button>
        <button class="delete" onclick="delIssue(${i})">Delete</button>
      </td>`;
    body.appendChild(tr);
  });
  updateCharts();
}

// Send to department
function sendToDept(i) {
  const it = issues[i];
  const dept = DEPARTMENTS[it.category];
  if (!dept) return alert("No department mapped!");
  if (!confirm(`Send "${it.title}" to ${dept.name}?`)) return;
  const subject = encodeURIComponent("Issue Report: " + it.title);
  const body = encodeURIComponent(
    `Category: ${it.category}\nSeverity: ${it.severity}\nDescription: ${it.description}\nLocation: ${it.location}\nPhoto: ${it.photo}`
  );
  window.open(`mailto:${dept.email}?subject=${subject}&body=${body}`);
}

// Delete issue
function delIssue(i) {
  if (!confirm("Delete this issue?")) return;
  issues.splice(i, 1);
  localStorage.setItem("issues", JSON.stringify(issues));
  renderTable();
}

// Charts
function updateCharts() {
  const ctx1 = document.getElementById("catChart").getContext("2d");
  const ctx2 = document.getElementById("sevChart").getContext("2d");
  const cats = {};
  const sev = {};
  issues.forEach((it) => {
    cats[it.category] = (cats[it.category] || 0) + 1;
    sev[it.severity] = (sev[it.severity] || 0) + 1;
  });
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: Object.keys(cats),
      datasets: [
        { label: "Issues by Category", data: Object.values(cats), backgroundColor: "#0ea5e9" },
      ],
    },
  });
  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: Object.keys(sev),
      datasets: [{ data: Object.values(sev), backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"] }],
    },
  });
}

// Init
renderTable();
