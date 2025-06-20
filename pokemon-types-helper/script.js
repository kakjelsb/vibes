document.addEventListener('DOMContentLoaded', () => {
    const pokemonSearchInput = document.getElementById('pokemon-search');
    const searchButton = document.getElementById('search-button');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const pokemonDisplay = document.getElementById('pokemon-display');
    const pokemonNameElement = document.getElementById('pokemon-name');
    const pokemonImageElement = document.getElementById('pokemon-image');
    const pokemonTypesElement = document.getElementById('pokemon-types');
    const superEffectiveTypesList = document.getElementById('super-effective-types');
    const effectiveAgainstTypesList = document.getElementById('effective-against-types');
    const pokemonNamesDatalist = document.getElementById('pokemon-names');

    const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/';
    const POKEMON_COUNT = 1025; // As of Gen 9, there are 1025 Pokémon

    let allPokemonNames = [];

    // Fetch all Pokémon names for autocomplete on load
    fetchAllPokemonNames();

    searchButton.addEventListener('click', fetchPokemonData);
    pokemonSearchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchPokemonData();
        }
    });

    async function fetchAllPokemonNames() {
        try {
            const response = await fetch(`${POKEAPI_BASE_URL}pokemon?limit=${POKEMON_COUNT}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allPokemonNames = data.results.map(pokemon => pokemon.name);
            populateDatalist(allPokemonNames);
        } catch (error) {
            console.error('Error fetching all Pokémon names:', error);
            // Optionally, display a message to the user that autocomplete might not work
        }
    }

    function populateDatalist(names) {
        pokemonNamesDatalist.innerHTML = '';
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            pokemonNamesDatalist.appendChild(option);
        });
    }

    async function fetchPokemonData() {
        const pokemonName = pokemonSearchInput.value.toLowerCase().trim();
        if (!pokemonName) {
            displayError('Please enter a Pokémon name.');
            return;
        }

        resetDisplay();
        loadingMessage.classList.remove('hidden');

        try {
            // Fetch Pokémon details
            const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}pokemon/${pokemonName}`);
            if (!pokemonResponse.ok) {
                if (pokemonResponse.status === 404) {
                    throw new Error('Pokémon not found. Please check the spelling.');
                }
                throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
            }
            const pokemonData = await pokemonResponse.json();

            displayPokemonInfo(pokemonData);

            // Fetch type effectiveness
            const types = pokemonData.types.map(typeInfo => typeInfo.type.url);
            const typeNames = pokemonData.types.map(typeInfo => typeInfo.type.name);
            await fetchTypeEffectiveness(types, typeNames);

        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            displayError(error.message || 'Failed to fetch Pokémon data. Please try again.');
        } finally {
            loadingMessage.classList.add('hidden');
        }
    }

    function displayPokemonInfo(pokemonData) {
        pokemonNameElement.textContent = capitalizeFirstLetter(pokemonData.name);
        pokemonImageElement.src = pokemonData.sprites.front_default || '';
        pokemonImageElement.alt = `${pokemonData.name} image`;

        const typesHtml = pokemonData.types.map(typeInfo =>
            `<span class="pokemon-type type-${typeInfo.type.name}">${capitalizeFirstLetter(typeInfo.type.name)}</span>`
        ).join(', ');
        pokemonTypesElement.innerHTML = typesHtml;

        pokemonDisplay.classList.remove('hidden');
    }

    async function fetchTypeEffectiveness(typeUrls, pokemonTypeNames) {
        let doubleDamageFromTypes = new Set();
        let halfDamageFromTypes = new Set();
        let noDamageFromTypes = new Set();

        let doubleDamageToTypes = new Set();
        let halfDamageToTypes = new Set();
        let noDamageToTypes = new Set();

        for (const url of typeUrls) {
            const typeResponse = await fetch(url);
            if (!typeResponse.ok) {
                throw new Error(`HTTP error! status: ${typeResponse.status} for type URL: ${url}`);
            }
            const typeData = await typeResponse.json();

            typeData.damage_relations.double_damage_from.forEach(relation => doubleDamageFromTypes.add(relation.name));
            typeData.damage_relations.half_damage_from.forEach(relation => halfDamageFromTypes.add(relation.name));
            typeData.damage_relations.no_damage_from.forEach(relation => noDamageFromTypes.add(relation.name));

            typeData.damage_relations.double_damage_to.forEach(relation => doubleDamageToTypes.add(relation.name));
            typeData.damage_relations.half_damage_to.forEach(relation => halfDamageToTypes.add(relation.name));
            typeData.damage_relations.no_damage_to.forEach(relation => noDamageToTypes.add(relation.name));
        }

        // Calculate super-effective types against this Pokémon
        let superEffectiveAgainstPokemon = new Set();
        doubleDamageFromTypes.forEach(type => {
            if (!halfDamageFromTypes.has(type) && !noDamageFromTypes.has(type)) {
                superEffectiveAgainstPokemon.add(type);
            }
        });
        displaySuperEffectiveTypes(Array.from(superEffectiveAgainstPokemon), superEffectiveTypesList);

        // Calculate types this Pokémon is super-effective against
        let pokemonIsSuperEffectiveAgainst = new Set();
        doubleDamageToTypes.forEach(type => {
            // Ensure the type is not resisted or nullified by any of the Pokémon's own types
            // This logic is more complex for dual-type Pokémon attacking
            // For simplicity, we'll just check if it's not resisted/nullified by *any* of the pokemon's types
            let isResistedOrNullified = false;
            for (const pokemonType of pokemonTypeNames) {
                // This would require fetching damage relations for the *attacking* type against the *defending* type
                // For now, we'll assume if the attacking type (from doubleDamageToTypes) is not resisted by the *pokemon's own types*
                // This is a simplification and might not be perfectly accurate for dual-type interactions.
                // A more robust solution would involve a damage calculation matrix.
                // For the scope of this task, we'll just check if the target type is not in the 'no_damage_to' or 'half_damage_to' of the pokemon's types.
                // This is still not quite right, as it should be about the *target's* resistances to the *pokemon's* types.

                // Let's re-think: doubleDamageToTypes are types that *this pokemon's types* deal double damage *to*.
                // So, if a pokemon is Fire/Flying, and Fire deals double damage to Grass, and Flying deals double damage to Bug,
                // then Grass and Bug should be listed.
                // The complexity comes if Fire deals double damage to Grass, but Flying deals half damage to Grass.
                // For now, we'll just list all types that *any* of the pokemon's types deal double damage to,
                // and filter out if *any* of the pokemon's types deal half or no damage to that target type.

                // This is the correct logic for a dual-type Pokémon attacking:
                // A target type is super-effective if AT LEAST ONE of the Pokémon's types deals double damage to it,
                // AND NONE of the Pokémon's types deal half or no damage to it.
                if (halfDamageToTypes.has(type) || noDamageToTypes.has(type)) {
                    isResistedOrNullified = true;
                    break;
                }
            }
            if (!isResistedOrNullified) {
                pokemonIsSuperEffectiveAgainst.add(type);
            }
        });

        displaySuperEffectiveTypes(Array.from(pokemonIsSuperEffectiveAgainst), effectiveAgainstTypesList);
    }

    function displaySuperEffectiveTypes(types, targetListElement) {
        targetListElement.innerHTML = '';
        if (types.length === 0) {
            targetListElement.innerHTML = '<li>No specific super-effective types found or calculated.</li>';
            return;
        }
        types.forEach(type => {
            const listItem = document.createElement('li');
            listItem.textContent = capitalizeFirstLetter(type);
            listItem.classList.add(`type-${type}`); // Add class for potential type-specific styling
            targetListElement.appendChild(listItem);
        });
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        pokemonDisplay.classList.add('hidden');
    }

    function resetDisplay() {
        errorMessage.classList.add('hidden');
        pokemonDisplay.classList.add('hidden');
        loadingMessage.classList.add('hidden');
        pokemonSearchInput.value = '';
        pokemonNameElement.textContent = '';
        pokemonImageElement.src = '';
        pokemonImageElement.alt = '';
        pokemonTypesElement.innerHTML = '';
        superEffectiveTypesList.innerHTML = '';
        effectiveAgainstTypesList.innerHTML = ''; // Clear the new list as well
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});