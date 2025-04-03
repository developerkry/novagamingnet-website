const topicsData = {
  "general-discussion": [
    { title: "General Discussion", description: "Introduce yourself and share your thoughts!" },
    { title: "Development Discussion", description: "Developers discuss your projects!" },
  ],
  updates: [
    { title: "New Features", description: "Check out the latest features added to the platform." },
    { title: "Upcoming Events", description: "Stay informed about upcoming events and activities." },
  ],
  support: [
    { title: "Account Issues", description: "Need help with your account? Post here." },
    { title: "Technical Support", description: "Facing technical issues? Get assistance here." },
  ],
};

function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category");
}

function displayTopics() {
  const category = getCategoryFromURL();
  const categoryTitle = document.getElementById("category-title");
  const topicsContainer = document.getElementById("topics-container");

  if (!category || !topicsData[category]) {
    categoryTitle.textContent = "Invalid Category";
    topicsContainer.innerHTML = "<p>No category selected or invalid category.</p>";
    return;
  }

  categoryTitle.textContent = category.replace("-", " ").toUpperCase();
  const topics = topicsData[category];

  topicsContainer.innerHTML = topics
    .map(
      (topic) => `
      <div class="topic-item">
        <h3>${topic.title}</h3>
        <p>${topic.description}</p>
        <button class="cta-button" onclick="window.location.href='discussions.html?topic=${encodeURIComponent(
          topic.title
        )}'">View Discussion</button>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", displayTopics);
