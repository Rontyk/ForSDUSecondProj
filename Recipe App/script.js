const apiKey = '740f1e62429441349216ecf0d4706bc8';
const searchButton = document.getElementById('search-button');
const searchBar = document.getElementById('search-bar');
const recipeGrid = document.getElementById('recipe-grid');
const modal = document.getElementById('recipe-modal');
const recipeDetails = document.getElementById('recipe-details');
const closeButton = document.querySelector('.close-button');
const suggestionsContainer = document.getElementById('suggestions');

// Fetch recipes based on search term
async function fetchRecipes(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.results);
}

// Display recipes in grid layout
function displayRecipes(recipes) {
    recipeGrid.innerHTML = ''; // Clear previous results
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button onclick="viewRecipe(${recipe.id})">View More</button>
        `;
        recipeGrid.appendChild(recipeCard);
    });
}

// Fetch and display detailed recipe information in modal
async function viewRecipe(id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
    const recipe = await response.json();
    recipeDetails.innerHTML = `
        <h2>${recipe.title}</h2>
        <p>${recipe.summary}</p>
        <h3>Ingredients:</h3>
        <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
        <h3>Instructions:</h3>
        <p>${recipe.instructions}</p>
    `;
    modal.style.display = 'flex';
}

// Fetch suggestions based on input
async function fetchSuggestions(query) {
    if (!query) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?number=5&query=${query}&apiKey=${apiKey}`);
    const suggestions = await response.json();
    displaySuggestions(suggestions);
}

// Display suggestions with images
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');

        // Create image element
        const suggestionImage = document.createElement('img');
        suggestionImage.src = `https://spoonacular.com/recipeImages/${suggestion.id}-90x90.jpg`; // URL pattern for Spoonacular images
        suggestionImage.alt = suggestion.title;

        // Add title text
        const suggestionText = document.createElement('span');
        suggestionText.textContent = suggestion.title;

        // Append image and text to the suggestion item
        suggestionItem.appendChild(suggestionImage);
        suggestionItem.appendChild(suggestionText);

        suggestionItem.addEventListener('click', () => {
            searchBar.value = suggestion.title;
            suggestionsContainer.innerHTML = ''; // Clear suggestions after selection
            fetchRecipes(suggestion.title); // Fetch recipes for the selected suggestion
        });

        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Event Listeners
searchButton.addEventListener('click', () => fetchRecipes(searchBar.value));
searchBar.addEventListener('input', () => fetchSuggestions(searchBar.value));
closeButton.addEventListener('click', () => modal.style.display = 'none');

// Clear suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!suggestionsContainer.contains(e.target) && e.target !== searchBar) {
        suggestionsContainer.innerHTML = '';
    }
});

// Close modal when clicking outside the content
window.addEventListener('click', (e) => {
    if (e.target == modal) modal.style.display = 'none';
});
