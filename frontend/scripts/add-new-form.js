const form = document.getElementById("contact-form");
const submitBtn = document.getElementById("btn");
const error = document.getElementById("new-contact-error");
const success = document.getElementById("new-contact-success");

const params = new URLSearchParams(window.location.search);
const contactId = params.get("id");

const isEditMode = Boolean(contactId);

if (!getToken()) {
  alert("Please login to add new contact!");
  window.location.href = "login-signup.html";
}

const nameInput = form.name;
const emailInput = form.email;
const phoneInput = form.phoneNumber;
const addressInput = form.address;
const categoryInput = form.categories;

if (isEditMode) {
  submitBtn.textContent = "Update Contact";
  loadContactDetails();
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
      localStorage.removeItem("token");
      window.location.href = "login-signup.html";
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch");

    const contact = await response.json();
    // console.log(contact);

    nameInput.value = contact.name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phoneNumber;
    addressInput.value = contact.address;
    categoryInput.value = contact.category;
  } catch (err) {
    // console.log(err);
    alert("Failed to Load Contact!");
    window.location.href = "dashboard.html";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  error.textContent = "";
  success.textContent = "";

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phoneNumber: form.phoneNumber.value.trim(),
    category: form.categories.value,
    address: form.address.value.trim(),
  };

  if (!payload.name || !payload.phoneNumber || !payload.category) {
    error.textContent = "Please fill all required fields.";
    return;
  }

  if (payload.email && !payload.email.includes("@")) {
    error.textContent = "Invalid email address.";
    return;
  }

  try {
    const url = isEditMode
      ? `${CONFIG.API_BASE}/api/contact/${contactId}/update`
      : `${CONFIG.API_BASE}/api/contact`;

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "login-signup.html";
      return;
    }

    const data = await response.json();
    // console.log(data);

    if (!response.ok && data.errors) {
      error.textContent = data.errors.map((e) => e.message).join(", ");
      return;
    }

    if (!response.ok) {
      error.textContent = data.message || "Failed to add/update the contact";
      return;
    }

    success.textContent = isEditMode
      ? "Contact updated successfully! Redirecting to dashboard"
      : "Contact added successfully! Redirecting to dashboard";

    submitBtn.disabled = true;

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  } catch (err) {
    console.log(err);
    alert("Server Error!");
  }
});

function getToken() {
  return localStorage.getItem("token");
}
