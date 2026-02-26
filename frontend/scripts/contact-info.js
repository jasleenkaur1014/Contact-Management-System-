const params = new URLSearchParams(window.location.search);
const contactId = params.get("id");

const nameContact = document.getElementById("contact-name");
const badge = document.getElementById("contact-category");
const phone = document.getElementById("contact-phone");
const email = document.getElementById("contact-email");
const address = document.getElementById("contact-address");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const dashboardBtn = document.getElementById("dashboard-btn");
const created = document.getElementById("contact-creation");
const avatar = document.getElementById("first-letter");

if (!getToken()) {
  alert("Please login to view contact!");
  window.location.href = "login-signup.html";
}

if (!contactId) {
  alert("Something went wrong");
  window.location.href = "dashboard.html";
}
async function loadContactDetails() {
  try {
    const response = await fetch(
      `${CONFIG.API_BASE}/api/contact/${contactId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    // console.log(data);
    nameContact.textContent = data.name;
    badge.textContent = data.category;
    phone.textContent = data.phoneNumber;
    email.textContent = data.email;
    address.textContent = data.address;
    const date = new Date(data.createdAt);

    created.textContent = `Created On: ${date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;

    deleteBtn.dataset.name = data.name;

    const firstLetter = data.name.charAt(0).toUpperCase();
    avatar.textContent = firstLetter;
  } catch (err) {
    console.log(err);
    alert("Failed to Load Contact!");
    window.location.href = "dashboard.html";
  }
}

deleteBtn.addEventListener("click", async () => {
  const name = deleteBtn.dataset.name;
  const confirmed = confirm(`Are you sure you wanna delete ${name}?`);
  if (!confirmed) return;

  const response = await fetch(`${CONFIG.API_BASE}/api/contact/${contactId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (response.status === 401 || response.status === 403) {
    handleLogout();
    return;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    alert(err.message || "Failed to delete contact");
    return;
  }

  alert("Contact deleted successfully!");
  window.location.href = "dashboard.html";
});

dashboardBtn.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

editBtn.addEventListener("click", () => {
  window.location.href = `addContactForm.html?id=${contactId}`;
});
loadContactDetails();
function getToken() {
  return localStorage.getItem("token");
}

function handleLogout() {
  localStorage.removeItem("token");
  window.location.href = "login-signup.html";
}
