// Fetch data from the backend
async function fetchData(endpoint) {
    const response = await fetch(`/.netlify/functions/${endpoint}`);
    return response.json();
}

// Display Featured Servers
async function displayFeatured() {
    const featuredContainer = document.getElementById("featuredList");
    featuredContainer.innerHTML = "";

    const servers = await fetchData("featured-servers");
    servers.forEach(server => {
        featuredContainer.innerHTML += `
            <div class="server-item">
                <img src="${server.img}" alt="${server.name}">
                <h3>${server.name}</h3>
                <button class="item-button" onclick="alert('Connecting to ${server.name}')">Join</button>
            </div>
        `;
    });
}

// Display Games
async function displayGames() {
    const gamesContainer = document.getElementById("games-container");
    const servers = await fetchData("servers");
    const games = {};

    servers.forEach(server => {
        if (!games[server.game]) games[server.game] = [];
        games[server.game].push(server);
    });

    gamesContainer.innerHTML = Object.keys(games).map(game => `
        <div class="game-category">
            <h3>${game.toUpperCase()}</h3>
            <div class="game-list">
                ${games[game].map(server => `
                    <div class="game-item">
                        <img src="${server.img}" alt="${server.name}">
                        <h4>${server.name}</h4>
                        <button class="item-button" onclick="alert('Connecting to ${server.name}')">Join</button>
                    </div>
                `).join("")}
            </div>
        </div>
    `).join("");
}

// Display Shop Items
async function displayShop() {
    const shopContainer = document.getElementById("shop-list");
    const shopItems = await fetchData("shop-items");

    shopContainer.innerHTML = shopItems.map(item => `
        <div class="shop-item" data-game="${item.game}" data-price="${item.price}">
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>
                <span>${item.game}</span>
                <span>$${item.price}</span>
            </p>
            <button class="item-button" onclick="alert('Added ${item.name} to cart')">Add</button>
        </div>
    `).join("");
}

// Apply Shop Filters
document.getElementById("filter-game").addEventListener("change", applyFilters);
document.getElementById("filter-price").addEventListener("change", applyFilters);

function applyFilters() {
    const gameFilter = document.getElementById("filter-game").value;
    const priceFilter = document.getElementById("filter-price").value;
    const shopContainer = document.getElementById("shop-list");

    const shopItemsElements = document.querySelectorAll(".shop-item");
    let hasVisibleItems = false;

    shopItemsElements.forEach(item => {
        const gameMatch = gameFilter === "" || item.dataset.game === gameFilter;
        const priceMatch =
            priceFilter === "" ||
            (priceFilter === "free" && item.dataset.price == 0) ||
            (priceFilter === "low" && item.dataset.price < 10) ||
            (priceFilter === "mid" && item.dataset.price >= 10 && item.dataset.price <= 50) ||
            (priceFilter === "high" && item.dataset.price > 50);

        const isVisible = gameMatch && priceMatch;
        item.style.display = isVisible ? "block" : "none";

        if (isVisible) {
            hasVisibleItems = true;
        }
    });

    // Display a message if no items match the filters
    if (!hasVisibleItems) {
        shopContainer.innerHTML = `<p class="no-items-message">No items match the selected filters.</p>`;
    }
}

// Display Sponsors
async function displaySponsors() {
    const sponsorsContainer = document.getElementById("sponsors-container");
    const sponsors = await fetchData("sponsors");

    sponsorsContainer.innerHTML = sponsors.map(sponsor => `
        <div class="sponsor-item">
            <img src="${sponsor.img}" alt="${sponsor.name}" />
            <h4>${sponsor.name}</h4>
            <button class="item-button" onclick="window.open('${sponsor.link}', '_blank')">Visit</button>
        </div>
    `).join("");
}

// Navbar hide/show on scroll for mobile
let lastScrollY = window.scrollY;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {
    if (window.innerWidth <= 768) { // Apply only on mobile
        if (window.scrollY > lastScrollY) {
            navbar.style.transform = "translateY(-100%)"; // Hide navbar
        } else {
            navbar.style.transform = "translateY(0)"; // Show navbar
        }
        lastScrollY = window.scrollY;
    }
});

// Initialize
displayFeatured();
displayGames();
displayShop();
displaySponsors();
