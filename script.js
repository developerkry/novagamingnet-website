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
    { name: "Item 1", price: 10, game: "FiveM", img: "./img/NOVA Gaming Network.png" },
    { name: "Item 2", price: 20, game: "Garry's Mod", img: "./img/NOVA.png" },
    { name: "Item 3", price: 30, game: "Beam.NG", img: "./img/Plus.png" },
    { name: "Item 4", price: 40, game: "Minecraft: Java Edition", img: "./img/Basic.png" },
    { name: "Item 5", price: 50, game: "Minecraft: Bedrock Edition", img: "./img/Premium.png" },
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
                <p>${server.game}</p>
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
            <p>${item.game}</p>
            <p2>$${item.price}</p2>
        </div>
    `).join("");
}

// Apply Shop Filters
document.getElementById("filter-game").addEventListener("change", applyFilters);
document.getElementById("filter-price").addEventListener("change", applyFilters);

function applyFilters() {
    const gameFilter = document.getElementById("filter-game").value;
    const priceFilter = document.getElementById("filter-price").value;
    const shopItems = document.querySelectorAll(".shop-item");

    shopItems.forEach(item => {
        const gameMatch = gameFilter === "" || item.dataset.game === gameFilter;
        const priceMatch =
            priceFilter === "" ||
            (priceFilter === "free" && item.dataset.price == 0) ||
            (priceFilter === "low" && item.dataset.price < 10) ||
            (priceFilter === "mid" && item.dataset.price >= 10 && item.dataset.price <= 50) ||
            (priceFilter === "high" && item.dataset.price > 50);

        item.style.display = gameMatch && priceMatch ? "block" : "none";
    });
}

// Initialize
displayFeatured();
displayGames();
displayShop();
