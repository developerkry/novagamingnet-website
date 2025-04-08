document.addEventListener("DOMContentLoaded", async () => {
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");
  const closeButtons = document.querySelectorAll(".close-button");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");
  const forumsContainer = document.querySelector(".forums-container");
  const categoryDropdown = document.getElementById("category-dropdown");
  const categoryContainer = document.getElementById("category-container");

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
        localStorage.setItem("userId", data.userId); // Save userId to localStorage
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

  // Utility function to fetch data from the backend
  async function fetchData(endpoint) {
    try {
      const response = await fetch(`/.netlify/functions/${endpoint}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      forumsContainer.innerHTML = "<p>Failed to load content. Please try again later.</p>";
    }
  }

  // Load threads for a topic
  async function loadThreads() {
    forumsContainer.innerHTML = "<p>Loading threads...</p>";
    const threads = await fetchData(`threads`);

    if (threads && threads.length > 0) {
      forumsContainer.innerHTML = threads
        .map(
          (thread) => `
          <div class="thread-item">
            <h3>${thread.title}</h3>
            <p>${thread.content}</p>
            <button onclick="loadComments('${thread.id}')">View Comments</button>
          </div>`
        )
        .join("");
    } else {
      forumsContainer.innerHTML = "<p>No threads available.</p>";
    }
  }

  // Load comments for a thread
  async function loadComments(threadId) {
    forumsContainer.innerHTML = "<p>Loading comments...</p>";
    const comments = await fetchData(`comments?threadId=${threadId}`);

    if (comments && comments.length > 0) {
      forumsContainer.innerHTML = comments
        .map(
          (comment) => `
          <div class="comment-item">
            <p><strong>${comment.author}:</strong> ${comment.content}</p>
            <span>${new Date(comment.date).toLocaleString()}</span>
          </div>`
        )
        .join("");
    } else {
      forumsContainer.innerHTML = "<p>No comments available.</p>";
    }
  }

  // Expose functions globally for dynamic navigation
  window.loadThreads = loadThreads;
  window.loadComments = loadComments;
});

document.addEventListener("DOMContentLoaded", () => {
  const forumsContainer = document.getElementById("forums-container");

  // Function to fetch and display threads with filtering
  async function fetchThreads(filter = {}) {
    forumsContainer.innerHTML = "<p>Loading threads...</p>";

    try {
      const response = await fetch("/.netlify/functions/threads", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch threads");
      const threads = await response.json();

      if (threads.length === 0) {
        forumsContainer.innerHTML = "<p>No threads available. Be the first to create one!</p>";
      } else {
        forumsContainer.innerHTML = threads
          .map(
            (thread) => `
            <div class="thread-item">
              <h3>${thread.title}</h3>
              <p>${thread.content}</p>
              <span>Category: ${thread.category}${
                thread.category === "Game Discussion" ? ` - ${thread.game}` : ""
              }</span>
              <span>Posted by ${thread.authorUsername} on ${new Date(
                thread.createdAt
              ).toLocaleDateString()}</span>
            </div>`
          )
          .join("");
      }

      // Add the 'Create Thread' button if the user is logged in
      const userId = localStorage.getItem("userId");
      if (userId) {
        forumsContainer.insertAdjacentHTML(
          "beforeend",
          `<button id="create-thread-button" class="cta-button">Create Thread</button>`
        );
        document
          .getElementById("create-thread-button")
          .addEventListener("click", openCreateThreadModal);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      // forumsContainer.innerHTML = "<p>Failed to load threads. Please try again later.</p>";
      forumsContainer.innerHTML = "<p>NOVA Forums is currently in development. Please check back later.</p>";
    }
  }

  // Function to open the create thread modal
  function openCreateThreadModal() {
    const gamesList = ["Game 1", "Game 2", "Game 3"];
    const modalHTML = `
      <div id="create-thread-modal" class="modal" style="display: flex; justify-content: center; align-items: center;">
        <div class="modal-content">
          <button class="close-button" onclick="document.getElementById('create-thread-modal').remove()">&times;</button>
          <h2>Create a New Thread</h2>
          <form id="create-thread-form">
            <input type="text" id="thread-title" placeholder="Thread Title" required />
            <textarea id="thread-content" placeholder="Write your content here..." required></textarea>
            <select id="thread-category" required>
              <option value="">Select Category</option>
              <option value="General Discussion">General Discussion</option>
              <option value="Development Discussion">Development Discussion</option>
              <option value="Support Discussion">Support Discussion</option>
              <option value="Game Discussion">Game Discussion</option>
            </select>
            <select id="thread-game" required>
              <option value="">Select Game</option>
              ${gamesList.map((game) => `<option value="${game}">${game}</option>`).join("")}
            </select>
            <button type="submit" class="cta-button">Post Thread</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const categoryDropdown = document.getElementById("thread-category");
    const gameDropdown = document.getElementById("thread-game");

    categoryDropdown.addEventListener("change", () => {
      if (categoryDropdown.value === "Game Discussion") {
        gameDropdown.setAttribute("required", "required");
      } else {
        gameDropdown.removeAttribute("required");
      }
    });

    document.getElementById("create-thread-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Create Thread form submitted"); // Debugging log

      const title = document.getElementById("thread-title").value.trim();
      const content = document.getElementById("thread-content").value.trim();
      const category = categoryDropdown.value;
      const game = gameDropdown.value;
      const userId = localStorage.getItem("userId");

      if (!title || !content || !category || (category === "Game Discussion" && !game)) {
        alert("All fields are required, and you must select a valid category and game if applicable.");
        return;
      }

      try {
        console.log("Sending request to create thread..."); // Debugging log
        const response = await fetch("/.netlify/functions/create-thread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, userId, category, game }),
        });

        if (response.ok) {
          console.log("Thread created successfully"); // Debugging log
          alert("Thread created successfully!");
          document.getElementById("create-thread-modal").remove();
          fetchThreads(); // Refresh the thread list
        } else {
          const error = await response.json();
          console.error("Error response from server:", error); // Debugging log
          alert(error.error || "Failed to create thread. Please try again.");
        }
      } catch (error) {
        console.error("Error creating thread:", error); // Debugging log
        alert("An error occurred. Please try again later.");
      }
    });
  }

  // Attach event listener to the 'Create Thread' button
  document.body.addEventListener("click", (event) => {
    if (event.target && event.target.id === "create-thread-button") {
      openCreateThreadModal();
    }
  });

  // Add filter functionality
  // Ensure the filter container is inserted before the correct child node
  function addFilterOptions() {
    const filterContainer = document.createElement("div");
    filterContainer.id = "filter-container";
    filterContainer.innerHTML = `
      <select id="filter-category">
        <option value="">All Categories</option>
        <option value="General Discussion">General Discussion</option>
        <option value="Development Discussion">Development Discussion</option>
        <option value="Support Discussion">Support Discussion</option>
        <option value="Game Discussion">Game Discussion</option>
      </select>
      <select id="filter-game">
        <option value="">All Games</option>
        <option value="Game 1">Game 1</option>
        <option value="Game 2">Game 2</option>
        <option value="Game 3">Game 3</option>
      </select>
      <button id="apply-filter" class="cta-button">Apply Filter</button>
    `;

    const forumsContainer = document.getElementById("forums-container");
    if (forumsContainer && forumsContainer.parentNode) {
        forumsContainer.parentNode.insertBefore(filterContainer, forumsContainer);
    } else {
        console.error("forums-container or its parent node is missing.");
    }
  }

  // Initialize filters and fetch threads on page load
  addFilterOptions();
  fetchThreads();
});

async function fetchThreads() {
  try {
    const response = await fetch("/.netlify/functions/threads");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const threads = await response.json();
    return threads;
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error; // Re-throw the error to handle it upstream
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const createThreadForm = document.getElementById("create-thread-form");

  if (createThreadForm) {
    console.log("Submit event listener attached"); // Debugging log

    createThreadForm.addEventListener("submit", async (event) => {
      return
      event.preventDefault();
      console.log("Create Thread form submitted"); // Debugging log

      const title = document.getElementById("thread-title").value.trim();
      const content = document.getElementById("thread-content").value.trim();
      const category = document.getElementById("thread-category").value;
      const game = document.getElementById("thread-game").value;
      const userId = localStorage.getItem("userId");

      if (!title || !content || !category || (category === "Game Discussion" && !game)) {
        alert("All fields are required, and you must select a valid category and game if applicable.");
        return;
      }

      try {
        console.log("Sending request to create thread..."); // Debugging log
        const response = await fetch("/.netlify/functions/create-thread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, userId, category, game }),
        });

        if (response.ok) {
          console.log("Thread created successfully"); // Debugging log
          alert("Thread created successfully!");
          document.getElementById("create-thread-modal").remove();
          fetchThreads(); // Refresh the thread list
        } else {
          const error = await response.json();
          console.error("Error response from server:", error); // Debugging log
          alert(error.error || "Failed to create thread. Please try again.");
        }
      } catch (error) {
        console.error("Error creating thread:", error); // Debugging log
        alert("An error occurred. Please try again later.");
      }
    });
  } else {
    console.error("Create Thread form not found"); // Debugging log
  }
});
