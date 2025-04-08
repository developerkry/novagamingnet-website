const categorySelect = document.getElementById('thread-category');
const gameSelect = document.getElementById('thread-game');
const createButton = document.getElementById('create-thread-button');

const games = [
  { id: 1, name: 'Game A' },
  { id: 2, name: 'Game B' },
  { id: 3, name: 'Game C' }
];

function populateGameDropdown() {
  gameSelect.innerHTML = '<option value="">Select a game</option>';
  games.forEach(game => {
    const option = document.createElement('option');
    option.value = game.id;
    option.textContent = game.name;
    gameSelect.appendChild(option);
  });
}

populateGameDropdown();

createButton.addEventListener('click', () => {
  const selectedCategory = categorySelect.value;
  const selectedGame = gameSelect.value;

  if (selectedCategory === 'Game Discussion' && !selectedGame) {
    alert('You must select a game for the Game Discussion category.');
    return;
  }

  if (!selectedGame) {
    alert('Please select a game before creating a thread.');
    return;
  }

  // Proceed with thread creation
  // ...existing code...
});