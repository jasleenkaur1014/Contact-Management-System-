const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const signupForm = document.querySelector("form.signup");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = () => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};
loginBtn.onclick = () => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};
signupLink.onclick = () => {
  signupBtn.click();
  return false;
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  // console.log(loginForm.email.value, loginForm.password.value);

  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/user/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    const errorBox = document.getElementById("login-error");
    const successBox = document.getElementById("login-success");

    if (!response.ok) {
      successBox.innerText = "";
      errorBox.innerText = data.message || "Login Failed";
      return;
    }

    errorBox.innerText = "";
    localStorage.setItem("token", data.token);

    successBox.textContent =
      "Login Successful! Redirecting to Dashboard Page...";

    loginForm.querySelector('input[type="submit"]').disabled = true;

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupForm.name.value;
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    const errorBox = document.getElementById("signup-error");
    const successBox = document.getElementById("signup-success");

    if (!response.ok) {
      successBox.innerText = "";
      errorBox.innerText = data.errors?.[0]?.message || "Signup failed";
      return;
    }

    errorBox.innerText = "";

    successBox.textContent =
      "Registration Successful! Redirecting to Login Page...";

    signupForm.querySelector('input[type="submit"]').disabled = true;

    setTimeout(() => {
      window.location.href = "login-signup.html";
    }, 2000);
  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
});
