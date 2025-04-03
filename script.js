// Fetch data from the backend
async function fetchData(endpoint) {
    const response = await fetch(`/.netlify/functions/${endpoint}`);
    return response.json();
}

// Display Featured Servers
async function displayFeatured() {
    const featuredContainer = document.getElementById("featuredList");
    featuredContainer.innerHTML = "<p>Loading featured servers...</p>"; // Add loading message

    try {
        const servers = await fetchData("featured-servers");
        if (servers.length === 0) {
            featuredContainer.innerHTML = "<p>No featured servers available.</p>";
        } else {
            featuredContainer.innerHTML = servers.map(server => `
                <div class="server-item">
                    <img src="${server.img}" alt="${server.name}">
                    <h3>${server.name}</h3>
                    <button class="item-button" onclick="alert('Connecting to ${server.name}')">Join</button>
                </div>
            `).join("");
        }
    } catch (error) {
        console.error("Error fetching featured servers:", error);
        featuredContainer.innerHTML = "<p>Failed to load featured servers. Please try again later.</p>";
    }
}

// Display Games
async function displayGames() {
    const gamesContainer = document.getElementById("games-container");
    gamesContainer.innerHTML = "<p>Loading games...</p>"; // Add loading message

    try {
        const servers = await fetchData("servers");
        const games = {};

        servers.forEach(server => {
            if (!games[server.game]) games[server.game] = [];
            games[server.game].push(server);
        });

        if (Object.keys(games).length === 0) {
            gamesContainer.innerHTML = "<p>No games available.</p>";
        } else {
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
    } catch (error) {
        console.error("Error fetching games:", error);
        gamesContainer.innerHTML = "<p>Failed to load games. Please try again later.</p>";
    }
}

// Display Shop Items
async function displayShop() {
    const shopContainer = document.getElementById("shop-list");
    shopContainer.innerHTML = "<p>Loading shop items...</p>"; // Add loading message

    try {
        const shopItems = await fetchData("shop-items");
        if (shopItems.length === 0) {
            shopContainer.innerHTML = "<p>No shop items available.</p>";
        } else {
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
    } catch (error) {
        console.error("Error fetching shop items:", error);
        shopContainer.innerHTML = "<p>Failed to load shop items. Please try again later.</p>";
    }
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
    sponsorsContainer.innerHTML = "<p>Loading sponsors...</p>"; // Add loading message

    try {
        const sponsors = await fetchData("sponsors");
        if (sponsors.length === 0) {
            sponsorsContainer.innerHTML = "<p>No sponsors available.</p>";
        } else {
            sponsorsContainer.innerHTML = sponsors.map(sponsor => `
                <div class="sponsor-item">
                    <img src="${sponsor.img}" alt="${sponsor.name}" />
                    <h4>${sponsor.name}</h4>
                    <button class="item-button" onclick="window.open('${sponsor.link}', '_blank')">Visit</button>
                </div>
            `).join("");
        }
    } catch (error) {
        console.error("Error fetching sponsors:", error);
        sponsorsContainer.innerHTML = "<p>Failed to load sponsors. Please try again later.</p>";
    }
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
