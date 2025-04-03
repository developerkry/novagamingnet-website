document.addEventListener("DOMContentLoaded", () => {
  const threadsContainer = document.getElementById("threads-container");
  const newThreadForm = document.getElementById("new-thread-form");
  const discussionTitle = document.getElementById("discussion-title");

  // Fetch threads for the selected topic
  async function fetchThreads() {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");

    if (!topic) {
      threadsContainer.innerHTML = "<p>Invalid topic selected.</p>";
      return;
    }

    discussionTitle.textContent = topic.replace("-", " ").toUpperCase();

    try {
      const response = await fetch(`/.netlify/functions/threads?topic=${topic}`);
      if (!response.ok) throw new Error("Failed to fetch threads");
      const threads = await response.json();

      if (threads.length === 0) {
        threadsContainer.innerHTML = "<p>No threads available. Be the first to post!</p>";
      } else {
        threadsContainer.innerHTML = threads
          .map(
            (thread) => `
            <div class="thread-item">
              <h3>${thread.title}</h3>
              <p>${thread.content}</p>
              <span>Posted by ${thread.author} on ${new Date(thread.date).toLocaleDateString()}</span>
              ${
                thread.isOwner
                  ? `<button class="cta-button delete-thread" data-thread-id="${thread.id}">Delete Thread</button>`
                  : ""
              }
              <button class="cta-button view-comments" data-thread-id="${thread.id}" data-thread-title="${thread.title}">View Comments</button>
            </div>
          `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      threadsContainer.innerHTML = "<p>Failed to load threads. Please try again later.</p>";
    }
  }

  // Handle new thread submission
  newThreadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const threadTitle = document.getElementById("thread-title").value.trim();
    const threadContent = document.getElementById("thread-content").value.trim();
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");

    if (!threadTitle || !threadContent || !topic) {
      showAlert("All fields are required.", "neutral");
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/create-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title: threadTitle, content: threadContent }),
      });

      if (response.ok) {
        showAlert("Thread posted successfully!", "success");
        fetchThreads(); // Refresh threads
        newThreadForm.reset();
      } else {
        const error = await response.json();
        showAlert("Failed to post thread.", "error");
      }
    } catch (error) {
      console.error("Error posting thread:", error);
      showAlert("An error occurred. Please try again later.", "error");
    }
  });

  // Handle click events for "View Comments" and "Delete Thread" buttons
  threadsContainer.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("view-comments")) {
      showAlert("This feature is currently in development.", "neutral");
    }

    if (target.classList.contains("delete-thread")) {
      const threadId = target.getAttribute("data-thread-id");
      deleteThread(threadId);
    }
  });

  async function deleteThread(threadId) {
    if (!confirm("Are you sure you want to delete this thread?")) return;

    try {
      const response = await fetch(`/.netlify/functions/delete-thread`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });

      if (response.ok) {
        showAlert("Thread Deleted!", "success");
        fetchThreads(); // Refresh threads
      } else {
        const error = await response.json();
        showAlert("Failed to Delete.", "error");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      showAlert("An Error Occurred", "error");
    }
  }

  function openCommentsModal(threadId, threadTitle) {
    const modal = document.getElementById("comments-modal");
    const modalTitle = document.getElementById("modal-thread-title");
    const commentsContainer = document.getElementById("modal-comments-container");
    const newCommentForm = document.getElementById("modal-new-comment-form");
    const closeButton = document.getElementById("modal-close-button");

    // Ensure modal elements are properly set
    modalTitle.textContent = threadTitle;
    modal.style.display = "flex"; // Make the modal visible

    // Fetch and display comments
    async function fetchComments() {
      try {
        const response = await fetch(`/.netlify/functions/comments?threadId=${threadId}`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const comments = await response.json();

        commentsContainer.innerHTML = comments.length
          ? comments
              .map(
                (comment) => `
                <div class="comment-item">
                  <p><strong>${comment.author || "Anonymous"}:</strong> ${comment.content}</p>
                  <span>${new Date(comment.date).toLocaleString()}</span>
                </div>
              `
              )
              .join("")
          : "<p>No comments yet. Be the first to comment!</p>";
      } catch (error) {
        console.error("Error fetching comments:", error);
        commentsContainer.innerHTML = "<p>Failed to load comments. Please try again later.</p>";
      }
    }

    fetchComments();

    // Handle new comment submission
    newCommentForm.onsubmit = async (event) => {
      event.preventDefault();

      const commentContent = document.getElementById("modal-comment-content").value.trim();

      if (!commentContent) {
        showAlert("Comment cannot be empty.", "error");
        return;
      }

      try {
        const response = await fetch("/.netlify/functions/create-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, content: commentContent, author: localStorage.getItem("username") || "Anonymous" }),
        });

        if (response.ok) {
          showAlert("Comment posted successfully!", "success");
          fetchComments(); // Refresh comments
          newCommentForm.reset();
        } else {
          const error = await response.json();
          showAlert("Failed to post comment.", "error");
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        showAlert("An error occurred. Please try again later.", "error");
      }
    };

    // Handle modal close button
    closeButton.onclick = () => {
      modal.style.display = "none"; // Hide the modal
    };
  }

  function closeCommentsModal() {
    const modal = document.getElementById("comments-modal");
    modal.style.display = "none"; // Hide the modal
  }

  // Ensure the function is correctly triggered
  fetchThreads();
});
