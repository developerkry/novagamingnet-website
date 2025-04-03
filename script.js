const servers = [
    { name: "Server 1", game: "FiveM", img: "./img/NOVA Gaming Network.png", bias: 3 },
    { name: "Server 2", game: "FiveM", img: "./img/NOVA Gaming Network.png", bias: 3 },
    { name: "Server 3", game: "FiveM", img: "./img/NOVA Gaming Network.png", bias: 3 },
    { name: "Server 1", game: "Garry's Mod", img: "./img/NOVA.png", bias: 2 },
    { name: "Server 2", game: "Garry's Mod", img: "./img/NOVA.png", bias: 2 },
    { name: "Server 3", game: "Garry's Mod", img: "./img/NOVA.png", bias: 2 },
    { name: "Server 1", game: "Beam.NG", img: "./img/Plus.png", bias: 1 },
    { name: "Server 2", game: "Beam.NG", img: "./img/Plus.png", bias: 1 },
    { name: "Server 3", game: "Beam.NG", img: "./img/Plus.png", bias: 1 },
    { name: "Server 1", game: "Minecraft: Java Edition", img: "./img/Basic.png", bias: 1 },
    { name: "Server 2", game: "Minecraft: Java Edition", img: "./img/Basic.png", bias: 1 },
    { name: "Server 3", game: "Minecraft: Java Edition", img: "./img/Basic.png", bias: 1 },
    { name: "Server 1", game: "Minecraft: Bedrock Edition", img: "./img/Premium.png", bias: 1 },
    { name: "Server 2", game: "Minecraft: Bedrock Edition", img: "./img/Premium.png", bias: 1 },
    { name: "Server 3", game: "Minecraft: Bedrock Edition", img: "./img/Premium.png", bias: 1 },
    { name: "Server 1", game: "RedM", img: "./img/Background.png", bias: 3 },
    { name: "Server 2", game: "RedM", img: "./img/Background.png", bias: 3 },
    { name: "Server 3", game: "RedM", img: "./img/Background.png", bias: 3 },
];

// Shop items
const shopItems = [
    { name: "Item 1", price: 5, game: "FiveM", img: "./img/NOVA Gaming Network.png" },
    { name: "Item 2", price: 25, game: "Garry's Mod", img: "./img/NOVA.png" },
    { name: "Item 3", price: 50, game: "Beam.NG", img: "./img/Plus.png" },
    { name: "Item 4", price: 100, game: "Minecraft: Java Edition", img: "./img/Basic.png" },
    { name: "Item 5", price: 0, game: "Minecraft: Bedrock Edition", img: "./img/Premium.png" },
];

// Selects featured servers with bias
function getFeaturedServers() {
    let weightedServers = [];
    servers.forEach(server => {
        for (let i = 0; i < server.bias; i++) {
            weightedServers.push(server);
        }
    });

    return weightedServers.sort(() => Math.random() - 0.5).slice(0, 3);
}

// Display Featured Servers
function displayFeatured() {
    const featuredContainer = document.getElementById("featuredList");
    featuredContainer.innerHTML = "";

    getFeaturedServers().forEach(server => {
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
function displayGames() {
    const gamesContainer = document.getElementById("games-container");
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
function displayShop() {
    const shopContainer = document.getElementById("shop-list");
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

    // Reset shop items
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

// Sponsors data
const sponsors = [
    { name: "Sponsor 1", img: "./img/basic.png", link: "https://example.com" },
    { name: "Sponsor 2", img: "./img/premium.png", link: "https://example.com" },
    { name: "Sponsor 3", img: "./img/plus.png", link: "https://example.com" },
];

// Display Sponsors
function displaySponsors() {
    const sponsorsContainer = document.getElementById("sponsors-container");
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
