const pokedexList = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const shinyToggle = document.createElement("button");
shinyToggle.textContent = "Toggle Shiny";
shinyToggle.addEventListener("click", toggleShinyMode);
document.body.insertBefore(shinyToggle, pokedexList);
let shinyMode = false;

// Create a dropdown for selecting different Pokédexes
const pokedexSelect = document.createElement("select");
const pokedexOptions = [
    { name: "National Pokédex", url: "https://pokeapi.co/api/v2/pokedex/national/" },
    // Pokedex associated with Sword and Shield 
    { name: "Galar Pokédex (Sword and Shield)", url: "https://pokeapi.co/api/v2/pokedex/galar/" },
    { name: "Isle of Armor Pokédex (Sword and Shield)", url: "https://pokeapi.co/api/v2/pokedex/isle-of-armor/" },
    { name: "Crown Tundra Pokédex (Sword and Shield)", url: "https://pokeapi.co/api/v2/pokedex/crown-tundra/" },
    // Pokedex associated with Sun/Moon & Ultra Sun/Ultra Moon
    { name: "Alola Pokédex", url: "https://pokeapi.co/api/v2/pokedex/21/" },
    // Pokedex associated with Diamond/Pearl & Brilliant Diamond/Shining Pearl 
    { name: "Sinnoh Pokédex (BDSP)", url: "https://pokeapi.co/api/v2/pokedex/5/" }, 
    // Pokedex associated with the Paldea region 
    { name: "Paldea Pokédex (Scarlet and Violet)", url: "https://pokeapi.co/api/v2/pokedex/paldea/" },
    { name: "Kitakami Pokédex (Scarlet and Violet)", url: "https://pokeapi.co/api/v2/pokedex/kitakami/" },
    { name: "Blueberry Pokédex (Scarlet and Violet)", url: "https://pokeapi.co/api/v2/pokedex/blueberry/" },
    { name: "Hisui Pokedex (Legends Arceus)", url: "https://pokeapi.co/api/v2/pokedex/hisui/"}
];

// Populate dropdown with Pokédex options
pokedexOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.url;
    optionElement.textContent = option.name;
    pokedexSelect.appendChild(optionElement);
});

// Insert dropdown into the page
document.body.insertBefore(pokedexSelect, pokedexList);

// Fetch Pokémon data based on the selected Pokédex
async function fetchPokemon() {
    const selectedPokedexUrl = pokedexSelect.value;

    try {
        const response = await fetch(selectedPokedexUrl);
        const data = await response.json();

        // Extract IDs from the Pokémon species URLs
        const pokemonIds = data.pokemon_entries.map(entry => {
            const urlParts = entry.pokemon_species.url.split("/");
            return urlParts[urlParts.length - 2]; // Extract ID
        });

        // Fetch Pokémon details in parallel using Promise.all
        const pokemonDetailsPromises = pokemonIds.map(id => 
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`).then(res => res.json())
        );
        const allPokemon = await Promise.all(pokemonDetailsPromises);

        displayPokemon(allPokemon);
        updateCaughtStatus();
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    }
}

async function showPokemonLocation(pokemonId, pokemonName) {
    const modal = document.getElementById("pokemon-modal");
    const modalContent = document.getElementById("modal-content");

    modal.style.display = "block";
    modalContent.innerHTML = `<h2>${pokemonName.toUpperCase()}</h2><p>Loading locations...</p>`;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        const locations = await response.json();

        if (locations.length === 0) {
            modalContent.innerHTML = `<h2>${pokemonName.toUpperCase()}</h2><p>No encounter data available.</p>`;
            return;
        }

        // Format encounter locations
        const locationList = locations
            .map(loc => `- ${loc.location_area.name.replace(/-/g, " ")}`)
            .join("<br>");

        modalContent.innerHTML = `<h2>${pokemonName.toUpperCase()}</h2><p>Found in:</p><p>${locationList}</p>`;

    } catch (error) {
        modalContent.innerHTML = `<h2>${pokemonName.toUpperCase()}</h2><p>Error fetching data.</p>`;
    }
}


// Display Pokémon on the page
function displayPokemon(pokemonArray) {
    pokedexList.innerHTML = "";
    pokemonArray.forEach(pokemon => {
        const li = document.createElement("li");

        // Create image element
        const img = document.createElement("img");
        img.src = shinyMode ? pokemon.sprites.front_shiny : pokemon.sprites.front_default;
        img.alt = pokemon.name;
        img.classList.add("pokemon-sprite");

        // Add click event for opening modal
        img.addEventListener("click", () => showPokemonLocation(pokemon.id, pokemon.name));

        li.appendChild(img);

        // Add name
        const nameSpan = document.createElement("span");
        nameSpan.textContent = pokemon.name.toUpperCase();
        li.appendChild(nameSpan);

        li.appendChild(document.createElement("br"));

        // Add caught button
        const caughtButton = document.createElement("button");
        caughtButton.textContent = "Caught";
        caughtButton.onclick = () => toggleCaught(pokemon.name);
        li.appendChild(caughtButton);

        pokedexList.appendChild(li);
    });

    updateCaughtStatus();
}

// Toggle caught Pokémon (store in local storage and update UI)
function toggleCaught(name) {
    let caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || [];
    
    if (caughtPokemon.includes(name)) {
        caughtPokemon = caughtPokemon.filter(p => p !== name);
    } else {
        caughtPokemon.push(name);
    }

    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon));
    updateCaughtStatus(); // Update UI immediately
}

// Update caught status in UI
function updateCaughtStatus() {
    let caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || [];
    document.querySelectorAll("#pokedex li").forEach(item => {
        const pokemonName = item.querySelector("span").textContent.toLowerCase();
        if (caughtPokemon.includes(pokemonName.toLowerCase())) {
            item.classList.add("caught");
        } else {
            item.classList.remove("caught");
        }
    });
}

// Call this function after loading Pokémon
fetchPokemon().then(() => updateCaughtStatus());



// Toggle Shiny Mode
function toggleShinyMode() {
    shinyMode = !shinyMode;
    fetchPokemon();
}

// Search Pokémon
searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const pokemonItems = document.querySelectorAll("#pokedex li");

    pokemonItems.forEach(item => {
        const pokemonName = item.textContent.toLowerCase();
        item.style.display = pokemonName.includes(searchText) ? "block" : "none";
    });
});

// Update Pokémon when Pokédex is changed
pokedexSelect.addEventListener("change", fetchPokemon);

// Fetch Pokémon when page loads
fetchPokemon();

// This is going to be used in order to allow a toggle for dark mode
const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
  
    // Save preference in localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };
  
  // Apply saved theme on page load
  window.onload = () => {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  };
  
  // Example button to toggle
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  