const apiToken = '740f1e62429441349216ecf0d4706bc8';
let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
async function getRecipes(searchTerm = '') {
  const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${searchTerm}&apiKey=${apiToken}`);
  const data = await response.json();
  return data.results;
}

async function getRecipeDetails(id) {
  const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiToken}`);
  const data = await response.json();
  return data;
}

const inputlab = document.getElementById('recipe-search');
const autocomp = document.getElementById('autocomplete-box');

inputlab.addEventListener('input', async () => {
  const searchTerm = inputlab.value.toLowerCase();
  autocomp.innerHTML = '';
  if (searchTerm) {
    const suggestions = await getRecipes(searchTerm);
    suggestions.forEach(item => {
      const suggestion = document.createElement('div');
      suggestion.textContent = item.title;
      suggestion.addEventListener('click', async () => {
        inputlab.value = item.title;
        hideAllSections();
        const detailedRecipe = await getRecipeDetails(item.id);
        displayRecipeDetails(detailedRecipe);
      });
      autocomp.appendChild(suggestion);
    });
    autocomp.classList.remove('hidden');
  } else {
    autocomp.classList.add('hidden');
    const allRecipes = await getRecipes();
    displayRecipes(allRecipes);
  }
});


const rcContainer = document.getElementById('recipe-cards-container');
function hideAllSections() {
  rcContainer.classList.add('hidden');
  autocomp.classList.add('hidden');
    recipeInfoModal.classList.add('hidden');
  savedr.classList.add('hidden');
}


async function displayRecipes(recipes) {
  hideAllSections();
  rcContainer.classList.remove('hidden');
  rcContainer.innerHTML = '';
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
     `;
    card.addEventListener('click', async () => {
      hideAllSections();
      const details = await getRecipeDetails(recipe.id);
      displayRecipeDetails(details);
    });
    rcContainer.appendChild(card);
  });
}

(async () => {
  const initialRecipes = await getRecipes();
  displayRecipes(initialRecipes);
})();

const recipeInfoModal = document.getElementById('recipe-info-modal');
const recipeDetailsContent = document.getElementById('recipe-details-content');
const closeRecipeInfoButton = document.getElementById('close-recipe-info');

async function displayRecipeDetails(details) {

  
  const nutrients = extractNutritionalInfo(details.summary);
  recipeDetailsContent.innerHTML = `
    <h2>${details.title}</h2>
    <img src="${details.image}" alt="${details.title}">
    <p><strong>Ready in:</strong> ${details.readyInMinutes || 'N/A'} minutes</p>
    <h3>Ingredients:</h3>
    <ul>
      ${details.extendedIngredients.map(item => `<li>${item.original}</li>`).join('')}
    </ul>
    <h3>Instructions:</h3>
    <ol>
      ${details.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || '<li>No instructions available</li>'}
    </ol>
    <h3>Nutrients:</h3>
    <p>Calories: ${nutrients.calories}</p>
    <p>Protein: ${nutrients.protein}</p>
    <p>Fat: ${nutrients.fat}</p>
    <button id="save-recipe">Save Recipe</button>
  `;
  document.getElementById('save-recipe').addEventListener('click', () => {
    saveRecipe(details);
  });
  hideAllSections();
  recipeInfoModal.classList.remove('hidden');
}

closeRecipeInfoButton.addEventListener('click', () => {
  hideAllSections();
  recipeInfoModal.classList.add('hidden');
});

function extractNutritionalInfo(summary) {
  const calMatch = summary.match(/<b>(\d+)\s*calories<\/b>/);
  const protMatch = summary.match(/<b>(\d+g)\s*of protein<\/b>/);
  const fatMatch = summary.match(/<b>(\d+g)\s*of fat<\/b>/);

  return {
    calories: calMatch ? calMatch[1] : 'N/A',
    protein: protMatch ? protMatch[1] : 'N/A',
    fat: fatMatch ? fatMatch[1] : 'N/A',
  };
}

const favoritesToggle = document.getElementById('favorites-toggle');
const savedr = document.getElementById('saved-recipes-modal');
const savedRecipesList = document.getElementById('saved-recipes-list');
const closeSavedRecipesButton = document.getElementById('close-saved-recipes');

favoritesToggle.addEventListener('click', () => {
  hideAllSections();
  displaySavedRecipes();
  
  savedr.classList.remove('hidden');
});

closeSavedRecipesButton.addEventListener('click', () => {
  
  savedr.classList.add('hidden');
  rcContainer.classList.remove('hidden');
});

function saveRecipe(recipe) {
  if (!savedRecipes.find(r => r.id === recipe.id)) {
    savedRecipes.push(recipe);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    alert(`${recipe.title} saved!`);
  } else {
    alert(`${recipe.title} is already saved!`);
  }
}

function displaySavedRecipes() {
  savedRecipesList.innerHTML = '';
  if (savedRecipes.length) {
    savedRecipes.forEach(recipe => {
      const item = document.createElement('div');
      item.classList.add('recipe-card');
      item.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
      `;
      item.addEventListener('click', async () => {
        const details = await getRecipeDetails(recipe.id);
        displayRecipeDetails(details);
        savedr.classList.add('hidden');
      });
      savedRecipesList.appendChild(item);
    });
  } else {
    savedRecipesList.innerHTML = '<p>No recipes saved.</p>';
  }
}
