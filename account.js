document.addEventListener("DOMContentLoaded", async () => {
  const avatarPreview = document.getElementById("avatar-preview");
  const usernameDisplay = document.getElementById("username-display");
  const emailDisplay = document.getElementById("email-display");
  const logoutButton = document.getElementById("logout-button");
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");
  const accountManagement = document.getElementById("account-management");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");
  const closeButtons = document.querySelectorAll(".close-button");

  const username = localStorage.getItem("username");
  if (!username) {
    console.error("Username is missing in localStorage.");
    window.location.href = "/forums.html"; // Ensure correct redirection to forums page
    return;
  } else {
    try {
      console.log(`Validating username: ${username}`);
      const response = await fetch("/.netlify/functions/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (response.ok) {
        // Populate user data
        usernameDisplay.textContent = data.username;
        emailDisplay.textContent = data.email || "Not Set";
        avatarPreview.src = data.avatar || "https://i.imgur.com/WFSYLmd.jpg";

        // Hide login modal and show account management section
        loginModal.style.display = "none";
        accountManagement.style.display = "block";
      } else {
        console.error(`Validation failed for username: ${username}`);
        localStorage.removeItem("username");
        window.location.href = "/forums.html"; // Ensure correct redirection to forums page
        return;
      }
    } catch (error) {
      console.error("Error validating username:", error);
      localStorage.removeItem("username");
      window.location.href = "/forums.html"; // Ensure correct redirection to forums page
      return;
    }
  }

  // Handle logout
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/forums.html"; // Redirect to the forum page
  });

  // Handle avatar change button click
  document
    .getElementById("change-avatar-button")
    .addEventListener("click", () => {
      showAlert(
        "The avatar changing feature is currently in development.",
        "neutral"
      );
    });

  // Handle avatar change
  document
    .getElementById("change-avatar-button")
    .addEventListener("click", () => {
      const avatarUpload = document.getElementById("avatar-upload");
      avatarUpload.click();
    });

  document
    .getElementById("avatar-upload")
    .addEventListener("change", async () => {
      const avatarUpload = document.getElementById("avatar-upload");
      const avatarFile = avatarUpload.files[0];
      if (!avatarFile) return;

      const formData = new FormData();
      formData.append("avatar", avatarFile);
      formData.append("username", localStorage.getItem("username")); // Ensure username is included

      console.log(
        "Uploading avatar with username:",
        localStorage.getItem("username")
      ); // Debugging log

      try {
        const response = await fetch("/.netlify/functions/update-account", {
          method: "POST",
          body: formData, // Do not set Content-Type; the browser will handle it
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Avatar updated successfully:", data.avatar); // Debugging log
          avatarPreview.src = data.avatar; // Update the avatar preview
          showAlert("Avatar updated successfully!", "success");
        } else {
          console.error("Failed to update avatar:", data.error);
          showAlert(data.error || "Failed to update avatar.", "error");
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
        showAlert("An error occurred. Please try again later.", "error");
      }
    });

  // Show a custom input modal
  function showInputModal(title, placeholder, callback) {
    const inputModal = document.getElementById("input-modal");
    const inputField = document.getElementById("input-modal-field");
    const inputTitle = document.getElementById("input-modal-title");
    const inputForm = document.getElementById("input-modal-form");

    inputTitle.textContent = title;
    inputField.placeholder = placeholder;
    inputField.value = ""; // Clear previous input
    inputModal.style.display = "flex";

    inputForm.onsubmit = (event) => {
      event.preventDefault();
      const value = inputField.value.trim();
      inputModal.style.display = "none";
      callback(value);
    };
  }

  // Handle username change
  document
    .getElementById("change-username-button")
    .addEventListener("click", () => {
      promptForPassword((password) => {
        showInputModal(
          "Enter your new username",
          "New Username",
          async (newUsername) => {
            if (!newUsername) {
              showAlert("Username cannot be empty.", "error");
              return;
            }

            try {
              const response = await fetch(
                "/.netlify/functions/update-account",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    password,
                    newUsername,
                    username: localStorage.getItem("username"),
                  }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                localStorage.setItem("username", newUsername);
                document.getElementById("username-display").textContent =
                  newUsername;
                showAlert("Username updated successfully!", "success");
              } else {
                showAlert(data.error || "Failed to update username.", "error");
              }
            } catch (error) {
              console.error("Error updating username:", error);
              showAlert("An error occurred. Please try again later.", "error");
            }
          }
        );
      });
    });

  // Handle email change
  document
    .getElementById("change-email-button")
    .addEventListener("click", () => {
      promptForPassword((password) => {
        showInputModal(
          "Enter your new email",
          "New Email",
          async (newEmail) => {
            if (!newEmail) {
              showAlert("Email cannot be empty.", "error");
              return;
            }

            try {
              const response = await fetch(
                "/.netlify/functions/update-account",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    password,
                    newEmail,
                    username: localStorage.getItem("username"),
                  }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                document.getElementById("email-display").textContent = newEmail;
                showAlert("Email updated successfully!", "success");
              } else {
                showAlert(data.error || "Failed to update email.", "error");
              }
            } catch (error) {
              console.error("Error updating email:", error);
              showAlert("An error occurred. Please try again later.", "error");
            }
          }
        );
      });
    });

  // Handle password change
  document
    .getElementById("change-password-button")
    .addEventListener("click", () => {
      promptForPassword((password) => {
        showInputModal(
          "Enter your new password",
          "New Password",
          async (newPassword) => {
            if (!newPassword) {
              showAlert("Password cannot be empty.", "error");
              return;
            }

            try {
              const response = await fetch(
                "/.netlify/functions/update-account",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    password,
                    newPassword,
                    username: localStorage.getItem("username"),
                  }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                showAlert("Password updated successfully!", "success");
              } else {
                showAlert(data.error || "Failed to update password.", "error");
              }
            } catch (error) {
              console.error("Error updating password:", error);
              showAlert("An error occurred. Please try again later.", "error");
            }
          }
        );
      });
    });

  // Prompt for password
  function promptForPassword(callback) {
    const authModal = document.getElementById("auth-modal");
    authModal.style.display = "flex";
    document.getElementById("auth-form").onsubmit = (event) => {
      event.preventDefault();
      const authPassword = document
        .getElementById("auth-password")
        .value.trim();
      authModal.style.display = "none";
      callback(authPassword);
    };
  }

  // Close modals
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loginModal.style.display = "none";
      registerModal.style.display = "none";
    });
  });

  async function fetchUserActivity() {
    const activityContainer = document.getElementById("activity-container");

    try {
      const response = await fetch("/.netlify/functions/user-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: localStorage.getItem("username") }),
      });

      if (!response.ok) throw new Error("Failed to fetch user activity");
      const activity = await response.json();

      activityContainer.innerHTML = activity.length
        ? activity
            .map(
              (item) => `
              <div class="activity-item">
                <p><strong>${item.type}:</strong> ${item.content}</p>
                <span>${new Date(item.date).toLocaleString()}</span>
              </div>`
            )
            .join("")
        : "<p>No activity found.</p>";
    } catch (error) {
      console.error("Error fetching user activity:", error);
      activityContainer.innerHTML = "<p>Failed to load activity. Please try again later.</p>";
    }
  }

  fetchUserActivity();
});
