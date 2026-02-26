const logoutBtn = document.getElementById("logout");
const loginBtn = document.getElementById("login");
const token = localStorage.getItem("token");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageInfo = document.getElementById("page-info");
const table = document.getElementById("table-body");
const categorySelect = document.getElementById("categories");
const searchInput = document.getElementById("search");
const filterBtn = document.getElementById("filter-contact-btn");
const addContactBtn = document.getElementById("add-new-btn");
const recentList = document.getElementById("recent-list");
const categoryList = document.getElementById("category-list");
const totalContacts = document.getElementById("total-contacts");

let currentPage = 1;
let totalPages = 1;
const limit = 10;

// initial UI state
if (!getToken()) {
  logoutBtn.style.display = "none";
  loginBtn.classList.remove("d-none");
  document.getElementById("kindly-login-msg").classList.remove("d-none");
} else {
  loginBtn.classList.add("d-none");
  document.getElementById("kindly-login-msg").classList.add("d-none");
}

// login click
loginBtn.addEventListener("click", () => {
  window.location.href = "login-signup.html";
});

// logout click
logoutBtn.addEventListener("click", handleLogout);

async function getContacts() {
  if (!getToken()) return;

  const errorBox = document.getElementById("error-dashboard");
  const emptyMsg = document.getElementById("empty-message");

  const category = categorySelect.value;
  const search = searchInput.value.trim();

  let url = `${CONFIG.API_BASE}/api/contact?page=${currentPage}&limit=${limit}`;

  if (category) {
    url += `&category=${category}`;
  }

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  emptyMsg.classList.add("d-none");
  if (errorBox) errorBox.innerText = "";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }

    const data = await response.json();

    table.innerHTML = "";

    if (!response.ok) {
      errorBox.innerText =
        data.message ||
        "An error occured during loading your contacts! Please try after some time!";
      return;
    }
    errorBox.innerText = "";

    totalPages = data.totalPages;

    if (data.contacts.length === 0) {
      document.getElementById("empty-message").classList.remove("d-none");
      table.innerHTML = `
    <tr>
      <td colspan="4" class="text-center text-muted">
        No contacts found
      </td>
    </tr>
  `;
    } else {
      document.getElementById("empty-message").classList.add("d-none");

      // console.log(data)
      data.contacts.forEach((contact) => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        const nameLink = document.createElement("a");
        nameLink.textContent = contact.name;
        nameLink.href = `contactInfo.html?id=${contact._id}`;
        nameLink.classList.add(
          "fw-semibold",
          "text-decoration-none",
          "text-dark",
        );
        nameTd.appendChild(nameLink);

        const phoneTd = document.createElement("td");
        phoneTd.textContent = contact.phoneNumber;
        phoneTd.classList.add("text-muted");

        const categoryTd = document.createElement("td");
        categoryTd.textContent =
          contact.category.charAt(0).toUpperCase() + contact.category.slice(1);
        categoryTd.classList.add("text-muted");

        const actionTd = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-warning";
        editBtn.textContent = "Edit";
        editBtn.dataset.id = contact._id;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.id = contact._id;
        deleteBtn.dataset.name = contact.name;

        deleteBtn.addEventListener("click", () => {
          deleteBtn.disabled = true;
        });

        editBtn.setAttribute("aria-label", `Edit contact ${contact.name}`);
        deleteBtn.setAttribute("aria-label", `Delete contact ${contact.name}`);

        actionTd.append(editBtn, deleteBtn);

        tr.append(nameTd, phoneTd, categoryTd, actionTd);

        table.appendChild(tr);
      });

      if (totalPages <= 1) {
        document.getElementById("pagination").classList.add("d-none");
      } else {
        document.getElementById("pagination").classList.remove("d-none");
      }
    }

    pageInfo.textContent = `${currentPage}/${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    getContacts();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    getContacts();
  }
});

let searchTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage = 1;
    getContacts();
  }, 300);
});

filterBtn.addEventListener("click", () => {
  currentPage = 1;
  getContacts();
});

categorySelect.addEventListener("change", () => {
  currentPage = 1;
  getContacts();
});
// getContacts();

table.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-danger")) {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;

    const confirmed = confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmed) {
      return;
    }
    const response = await fetch(`${CONFIG.API_BASE}/api/contact/${id}`, {
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

    refreshDashboard();
  } else if (e.target.classList.contains("btn-warning")) {
    const id = e.target.dataset.id;
    window.location.href = `addContactForm.html?id=${id}`;
  }
});

function handleLogout() {
  localStorage.removeItem("token");
  window.location.href = "login-signup.html";
}

addContactBtn.addEventListener("click", () => {
  if (!getToken()) {
    handleLogout();
    return;
  }
  window.location.href = "addContactForm.html";
});

async function getRecentContacts() {
  if (!getToken()) return;
  try {
    const response = await fetch(
      `${CONFIG.API_BASE}/api/contact/recentContacts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }

    const data = await response.json();
    // console.log(response);
    if (!response.ok) {
      document.getElementById("recent-err").innerText =
        data.message || "An error occured! Please try after some time!";
      return;
    }
    document.getElementById("recent-err").innerText = "";

    if (!data.recentlyAdded || data.recentlyAdded.length === 0) {
      recentList.innerHTML = "<li class='text-muted'>No recent contacts</li>";
      return;
    }

    recentList.innerHTML = "";

    // console.log(data);
    data.recentlyAdded.forEach((c) => {
      const li = document.createElement("li");
      const contactInfo = document.createElement("a");
      contactInfo.classList.add("recent-list-element");
      contactInfo.textContent = c.name;
      contactInfo.href = `contactInfo.html?id=${c._id}`;
      contactInfo.title = "Click to see more about this contact.";

      li.classList.add("list-group-item");

      li.append(contactInfo);

      recentList.append(li);
    });
  } catch (err) {
    console.log(err);
    alert("Server Error!");
  }
}

// getRecentContacts();

async function contactNumPerCategory() {
  if (!getToken()) return;
  try {
    const response = await fetch(
      `${CONFIG.API_BASE}/api/contact/contactPerCategory`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      document.getElementById("cat-err").innerText =
        data.message || "An error occured! Please try after some time!";
      return;
    }

    document.getElementById("cat-err").innerText = "";

    if (!data.sortedContactCount || data.sortedContactCount.length === 0) {
      categoryList.innerHTML =
        "<p class='text-muted'>No category data available</p>";
      return;
    }

    // console.log(data);
    categoryList.innerHTML = "";

    data.sortedContactCount.forEach((contact) => {
      const el = document.createElement("p");
      const category =
        contact.category.charAt(0).toUpperCase() + contact.category.slice(1);

      el.textContent = `${category} (${contact.count})`;

      el.classList.add("category-list-element");
      el.setAttribute(
        "aria-label",
        `${contact.category} category has ${contact.count} contacts`,
      );
      categoryList.append(el);
    });
  } catch (err) {
    console.log(err);
    alert("Server error!");
  }
}

// contactNumPerCategory();

async function getTotalContactsCount() {
  if (!getToken()) return;
  try {
    const response = await fetch(
      `${CONFIG.API_BASE}/api/contact/totalContacts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      totalContacts.innerText =
        data.message || "An error occured! Please try after some time!";
      return;
    }

    // console.log(data);
    totalContacts.innerText = data.totalContacts;
  } catch (err) {
    console.log(err);
    alert("Server Error!");
  }
}

// getTotalContactsCount();

function getToken() {
  return localStorage.getItem("token");
}

async function refreshDashboard() {
  await Promise.all([
    getContacts(),
    getTotalContactsCount(),
    contactNumPerCategory(),
    getRecentContacts(),
  ]);
}

refreshDashboard();
