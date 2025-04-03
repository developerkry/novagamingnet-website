document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");
  const closeButtons = document.querySelectorAll(".close-button");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");

  // Utility function for non-invasive alerts
  const showAlert = (message, type) => {
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.remove();
    }, 3000);
  };

  // Check if the user is logged in
  const username = localStorage.getItem("username");
  if (!username) {
    loginModal.style.display = "flex"; // Show the login modal if not logged in
  }

  // Close modals
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loginModal.style.display = "none";
      registerModal.style.display = "none";
    });
  });

  // Handle login form submission
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("/.netlify/functions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        loginModal.style.display = "none";
        showAlert("Login successful!", "success");
      } else {
        showAlert(data.error || "Login failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      showAlert("An error occurred. Please try again later.", "error");
    }
  });

  // Handle register form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    try {
      const response = await fetch("/.netlify/functions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("Registration successful! Please log in.", "success");
        registerModal.style.display = "none";
        loginModal.style.display = "flex";
      } else {
        showAlert(data.error || "Registration failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error registering:", error);
      showAlert("An error occurred. Please try again later.", "error");
    }
  });

  // Switch to register modal
  registerLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "flex"; // Set to "flex" to retain centering
  });

  // Switch to login modal
  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    registerModal.style.display = "none";
    loginModal.style.display = "flex"; // Set to "flex" to retain centering
  });
});
