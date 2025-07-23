const pokedex = document.getElementById('pokedex');

const exampleData = [
  {
    name: "Charizard",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    types: ["Fire", "Flying"],
    bst: 534
  },
  {
    name: "Venusaur",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    types: ["Grass", "Poison"],
    bst: 525
  }
];

function renderPokemon(pokemon) {
  const typeBadges = pokemon.types.map(
    type => `<span class="type-badge type-${type.toLowerCase()}">${type}</span>`
  ).join('');

  return `
    <div class="pokemon-card">
      <img src="${pokemon.sprite}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
      <div class="pokemon-types">${typeBadges}</div>
      <p><strong>BST:</strong> ${pokemon.bst}</p>
    </div>
  `;
}

function loadPokedex(data) {
  pokedex.innerHTML = data.map(renderPokemon).join('');
}

loadPokedex(exampleData);
