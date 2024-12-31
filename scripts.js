// Initialize accounts in localStorage
let accounts = JSON.parse(localStorage.getItem('accounts')) || {
    default: {
        recipes: [],
        weeklyRecipes: [],
        mealPlan: {
            monday: { breakfast: null, lunch: null, dinner: null },
            tuesday: { breakfast: null, lunch: null, dinner: null },
            wednesday: { breakfast: null, lunch: null, dinner: null },
            thursday: { breakfast: null, lunch: null, dinner: null },
            friday: { breakfast: null, lunch: null, dinner: null },
            saturday: { breakfast: null, lunch: null, dinner: null },
            sunday: { breakfast: null, lunch: null, dinner: null },
        },
        savedWeeks: [],
    },
};

// Current logged-in account (default for now)
let currentAccount = 'default';

// Global Variables
let recipes = accounts[currentAccount].recipes || [];
let weeklyRecipes = accounts[currentAccount].weeklyRecipes || [];
let recipeToEdit = null;
let mealPlan = accounts[currentAccount].mealPlan || {
    monday: { breakfast: null, lunch: null, dinner: null },
    tuesday: { breakfast: null, lunch: null, dinner: null },
    wednesday: { breakfast: null, lunch: null, dinner: null },
    thursday: { breakfast: null, lunch: null, dinner: null },
    friday: { breakfast: null, lunch: null, dinner: null },
    saturday: { breakfast: null, lunch: null, dinner: null },
    sunday: { breakfast: null, lunch: null, dinner: null },
};

// Ensure savedWeeks exists for the current account
if (!accounts[currentAccount].savedWeeks) {
    accounts[currentAccount].savedWeeks = [];
}

// Function to save data to the current account
function saveAccountData() {
    console.log('Saving accounts to localStorage:', accounts); // Debugging log
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// Function to switch accounts (future feature)
function switchAccount(accountName) {
    if (!accounts[accountName]) {
        // Create a new account if it doesn't exist
        accounts[accountName] = { recipes: [], weeklyRecipes: [] };
    }
    currentAccount = accountName;
    saveAccountData();
    loadAccountData(); // Load the account's data
}

// Function to load recipes and weekly recipes for the current account
function loadAccountData() {
    recipes = accounts[currentAccount].recipes || [];
    weeklyRecipes = accounts[currentAccount].weeklyRecipes || [];
    displayRecipes();
    displayWeeklyRecipes();
}

// Function to save recipes to the current account
function saveRecipes() {
    accounts[currentAccount].recipes = recipes;
    saveAccountData();
}

// Function to save weekly recipes to the current account
function saveWeeklyRecipes() {
    accounts[currentAccount].weeklyRecipes = weeklyRecipes;
    saveAccountData();
}

// On page load, load the default account's data
document.addEventListener('DOMContentLoaded', () => {
    loadAccountData();
});


function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Function to display search results
function displaySearchResults(matchingRecipes, isTextSearch) {
    const searchResults = document.getElementById('search-results');
    const resultsContainer = document.getElementById('search-results-container');

    if (matchingRecipes.length === 0) {
        searchResults.style.display = 'none'; // Hide results if none match
        return;
    }

    searchResults.style.display = 'block';
    resultsContainer.innerHTML = ''; // Clear previous results

    // Create recipe cards for each matching recipe
    matchingRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.setAttribute('draggable', 'true');
        recipeCard.setAttribute('data-recipe-index', recipes.indexOf(recipe));
        recipeCard.addEventListener('dragstart', handleDragStart);

        recipeCard.innerHTML = `
            <h4>${recipe.name}</h4>
            <p>${recipe.time}, ${recipe.glutenOption}</p>
            <p>${recipe.mainCategory}, ${recipe.subCategory}</p>
            <p class="stars">${'⭐'.repeat(recipe.rating)}</p>
        `;

        resultsContainer.appendChild(recipeCard);
    });

    console.log(
        isTextSearch
            ? "Results from text search:"
            : "Results from filters:",
        matchingRecipes
    );
}

// Function to handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim(); // Get the input value
    if (!searchTerm) {
        clearSearchResults(); // If input is empty, clear results
        return;
    }

    // Filter recipes based on the search term
    const matchingRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm) || // Match by recipe name
        recipe.mainCategory.toLowerCase().includes(searchTerm) || // Match by main category
        recipe.subCategory.toLowerCase().includes(searchTerm) // Match by subcategory
    );

    // Display the filtered results
    displaySearchResults(matchingRecipes, true); // 'true' indicates text-based search
}

// Add event listener to the search bar
document.getElementById('recipe-search').addEventListener('input', handleSearch);

// Function to clear search results
function clearSearchResults() {
    const searchResults = document.getElementById('search-results');
    const resultsContainer = document.getElementById('search-results-container');

    searchResults.style.display = 'none';
    resultsContainer.innerHTML = ''; // Clear the results
}

document.addEventListener("DOMContentLoaded", () => {
    const filterButton = document.getElementById("apply-filters");
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Filters";
    resetButton.style.margin = "1rem 0";
    resetButton.id = "reset-filters";
    filterButton.parentElement.insertBefore(resetButton, filterButton.nextSibling);

    const selectedFiltersContainer = document.createElement("div");
    selectedFiltersContainer.id = "selected-filters-container";
    selectedFiltersContainer.style.margin = "1rem 0";
    filterButton.parentElement.insertBefore(selectedFiltersContainer, filterButton);

    function updateSelectedFiltersDisplay() {
        const selectedTime = Array.from(document.querySelectorAll('#time-filter input:checked')).map(opt => opt.value);
        const selectedGluten = Array.from(document.querySelectorAll('#gluten-filter input:checked')).map(opt => opt.value);
        const selectedCategory = Array.from(document.querySelectorAll('#main-category-filter input:checked')).map(opt => opt.value);
        const selectedSubcategory = Array.from(document.querySelectorAll('#subcategory-filter input:checked')).map(opt => opt.value);
        const selectedRating = document.querySelector('#rating-filter input:checked')?.value || null;

        const allSelectedFilters = [
            ...selectedTime.map(value => `Time: ${value}`),
            ...selectedGluten.map(value => `Gluten: ${value}`),
            ...selectedCategory.map(value => `Category: ${value}`),
            ...selectedSubcategory.map(value => `Subcategory: ${value}`),
            selectedRating ? `Rating: ${selectedRating} Star${selectedRating > 1 ? "s" : ""}` : null,
        ].filter(Boolean);

        selectedFiltersContainer.innerHTML = allSelectedFilters.length > 0
            ? `<strong>Selected Filters:</strong> ${allSelectedFilters.join(", ")}`
            : "No filters selected.";
    }

    function filterRecipes() {
        const selectedTime = Array.from(document.querySelectorAll('#time-filter input:checked')).map(opt => opt.value);
        const selectedGluten = Array.from(document.querySelectorAll('#gluten-filter input:checked')).map(opt => opt.value);
        const selectedCategory = Array.from(document.querySelectorAll('#main-category-filter input:checked')).map(opt => opt.value);
        const selectedSubcategory = Array.from(document.querySelectorAll('#subcategory-filter input:checked')).map(opt => opt.value);
        const selectedRating = parseInt(document.querySelector('#rating-filter input:checked')?.value || '0', 10);

        const matchingRecipes = recipes.filter(recipe => {
            const matchesTime = selectedTime.length === 0 || selectedTime.some(time => recipe.time.includes(time));
            const matchesGluten = selectedGluten.length === 0 || selectedGluten.includes(recipe.glutenOption);
            const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(recipe.mainCategory);
            const matchesSubcategory = selectedSubcategory.length === 0 || selectedSubcategory.includes(recipe.subCategory);
            const matchesRating = recipe.rating >= selectedRating;

            return matchesTime && matchesGluten && matchesCategory && matchesSubcategory && matchesRating;
        });

        displaySearchResults(matchingRecipes, false); // 'false' indicates filter-based search
    }

    // Attach the filter button functionality
    filterButton.addEventListener("click", filterRecipes);

    // Handle reset filters button
    resetButton.addEventListener("click", () => {
        // Clear all filter selections
        document.querySelectorAll('.filter-dropdown input:checked').forEach(input => (input.checked = false));
        updateSelectedFiltersDisplay();
        clearSearchResults(); // Clear recipe cards from view
    });

    // Dropdown functionality
    document.querySelectorAll(".filter-dropdown").forEach(dropdown => {
        const button = dropdown.previousElementSibling;
        button.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent document click listener from firing
            const isVisible = dropdown.style.display === "block";
            document.querySelectorAll(".filter-dropdown").forEach(dd => (dd.style.display = "none")); // Close other dropdowns
            dropdown.style.display = isVisible ? "none" : "block"; // Toggle this dropdown
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
        document.querySelectorAll(".filter-dropdown").forEach(dd => (dd.style.display = "none"));
    });

    // Update filters on selection
    document.querySelectorAll(".filter-dropdown input").forEach(input => {
        input.addEventListener("change", () => {
            updateSelectedFiltersDisplay();
        });
    });

    // Initialize the selected filters display
    updateSelectedFiltersDisplay();
});


function saveRecipes() {
    accounts[currentAccount].recipes = recipes;
    saveAccountData();
}

// Temporary storage for ingredients, instructions, and image
let tempIngredients = [];
let tempInstructions = [];
let uploadedImage = null;

// Parse fractions for ingredient quantities
function parseFraction(input) {
    const parts = input.split(' ');
    let total = 0;

    parts.forEach(part => {
        if (part.includes('/')) {
            const [numerator, denominator] = part.split('/').map(Number);
            total += numerator / denominator;
        } else if (!isNaN(part)) {
            total += parseFloat(part);
        }
    });

    return total;
}

// Update the ingredient list display
function updateIngredientList() {
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = tempIngredients
        .map(ingredient => `
            <div>
                ${ingredient.quantity} 
                ${ingredient.unit ? ingredient.unit + ' ' : ''} 
                ${ingredient.name}
            </div>
        `)
        .join('');
}

// Update the instruction list display
function updateInstructionList() {
    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = tempInstructions
        .map((instruction, index) => `<div>${index + 1}. ${instruction}</div>`)
        .join('');
}

// Parse bulk ingredients
document.getElementById('parse-ingredients-button').addEventListener('click', function () {
    const bulkInput = document.getElementById('bulk-ingredients').value.trim();
    const lines = bulkInput.split('\n');
    const ingredients = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') return;

        // Updated regex to handle cases like "1 1/2 onion", "400ml can tomatoes", "2 tbsp sugar"
        const match = trimmedLine.match(/^(\d+(?:\.\d+)?(?:\s\d+\/\d+)?|\d+\/\d+)?\s*([\w\-]+)?\s+(.*)$/i);

        if (match) {
            let [_, rawQuantity, unit, name] = match;
            let quantity = rawQuantity ? rawQuantity.toString() : null;

            // Handle mixed fractions (e.g., "1 1/2")
            if (quantity && quantity.includes(" ")) {
                const parts = quantity.split(" ");
                const wholeNumber = parseFloat(parts[0]);
                const fractionParts = parts[1].split("/");
                quantity = wholeNumber + (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]));
            }

            // Handle fractions only (e.g., "1/2")
            else if (quantity && quantity.includes("/")) {
                const fractionParts = quantity.split("/");
                quantity = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
            }

            // Convert quantity to a number for final storage
            quantity = quantity ? parseFloat(quantity) : 1;

            // Standardize units
            const standardUnitMap = {
                tbsp: "tablespoon",
                tsps: "teaspoon",
                tsp: "teaspoon",
                cups: "cup",
                oz: "ounce",
                g: "gram",
                kg: "kilogram",
                ml: "milliliter",
                l: "liter",
                null: null, // Handle missing unit
            };

            unit = unit ? standardUnitMap[unit.toLowerCase()] || unit : null;

            // Push parsed ingredient
            ingredients.push({
                quantity: quantity,
                unit: unit,
                name: name.trim(),
            });
        } else {
            console.warn(`Could not parse line: ${trimmedLine}`);
        }
    });

    tempIngredients = ingredients;
    updateIngredientList();
    document.getElementById('bulk-ingredients').value = ''; // Clear input
});


// Parse bulk instructions
document.getElementById('parse-instructions-button').addEventListener('click', function () {
    const bulkInput = document.getElementById('bulk-instructions').value.trim();
    const lines = bulkInput.split('\n');

    lines.forEach(line => {
        if (line.trim()) {
            tempInstructions.push(line.trim());
        }
    });

    updateInstructionList();
    document.getElementById('bulk-instructions').value = ''; // Clear input
});

// Handle image upload
document.getElementById('recipe-image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage = e.target.result;
            const preview = document.getElementById('image-preview');
            preview.src = uploadedImage;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function initializeMealPlanner() {
    console.log("Initializing meal planner..."); // Debugging
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];

    days.forEach(day => {
        meals.forEach(meal => {
            const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
            if (slot) {
                console.log(`Adding event listeners to slot: ${day} - ${meal}`); // Debugging
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('drop', event => handleDrop(event, day, meal));
            } else {
                console.warn(`Missing slot for ${day} ${meal}`);
            }
        });
    });
}


// Function to handle dropping recipes into meal planner slots
function handleDrop(event, day, meal) {
    console.log(`Dropped on: ${day} - ${meal}`); // Debugging
    event.preventDefault();
    try {
        const data = event.dataTransfer.getData("application/json");
        console.log("Dropped data:", data); // Debugging
        if (!data) {
            console.error("No data received in drop event");
            return;
        }

        const { recipeIndex } = JSON.parse(data);
        if (recipeIndex === undefined) {
            console.error("Invalid data dropped:", data);
            return;
        }

        const recipe = recipes[recipeIndex];
        if (!recipe) {
            console.error("Recipe not found for index:", recipeIndex);
            return;
        }

        // Find the current slot that holds this recipe (if any)
        const existingSlot = document.querySelector(`.meal-item[data-recipe-index="${recipeIndex}"]`);
        if (existingSlot) {
            existingSlot.parentElement.innerHTML = existingSlot.parentElement.dataset.meal.charAt(0).toUpperCase() +
                existingSlot.parentElement.dataset.meal.slice(1);
        }

        // Add the recipe to the new slot
        const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
        slot.innerHTML = `
            <div class="meal-item" draggable="true" data-recipe-index="${recipeIndex}" ondragstart="handleDragStart(event)">
                <h4 class="recipe-title" onclick="showRecipeDetails(${recipeIndex})">${recipe.name}</h4>
                <button onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
            </div>
        `;

        saveToMealPlan(day, meal, recipe);
        displayShoppingList();
    } catch (error) {
        console.error("Error handling drop:", error);
    }
}



// Function to handle dragging over a meal slot
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function handleDragStart(event) {
    console.log("Drag started:", event.target); // Debugging
    const mealItem = event.target.closest(".meal-item, .recipe-card"); // Ensure this targets the correct element
    if (!mealItem) {
        console.error("Drag start initiated on an invalid element:", event.target);
        return;
    }

    const recipeIndex = mealItem.dataset.recipeIndex; // Ensure this attribute exists
    if (!recipeIndex) {
        console.error("Recipe index is missing in drag event target:", mealItem);
        return;
    }

    const data = JSON.stringify({ recipeIndex }); // Serialize the recipe index for transfer
    event.dataTransfer.setData("application/json", data);
    console.log("Drag start data set:", data);
    mealItem.style.opacity = "0.5"; // Visual feedback
}


// Function to save the recipe to the meal plan
function saveToMealPlan(day, meal, recipe) {
    if (!accounts[currentAccount].mealPlan) {
        accounts[currentAccount].mealPlan = {
            monday: { breakfast: null, lunch: null, dinner: null },
            tuesday: { breakfast: null, lunch: null, dinner: null },
            wednesday: { breakfast: null, lunch: null, dinner: null },
            thursday: { breakfast: null, lunch: null, dinner: null },
            friday: { breakfast: null, lunch: null, dinner: null },
            saturday: { breakfast: null, lunch: null, dinner: null },
            sunday: { breakfast: null, lunch: null, dinner: null },
        };
    }

    // Clear the recipe from all other slots
    Object.keys(accounts[currentAccount].mealPlan).forEach(existingDay => {
        Object.keys(accounts[currentAccount].mealPlan[existingDay]).forEach(existingMeal => {
            if (accounts[currentAccount].mealPlan[existingDay][existingMeal]?.name === recipe.name) {
                accounts[currentAccount].mealPlan[existingDay][existingMeal] = null;
            }
        });
    });

    // Assign the recipe to the new slot
    accounts[currentAccount].mealPlan[day][meal] = recipe;
    saveAccountData();
}

// Function to remove a recipe from the meal plan
function removeFromMealPlan(day, meal) {
    if (!accounts[currentAccount].mealPlan) return;

    accounts[currentAccount].mealPlan[day][meal] = null;
    saveAccountData();

    const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
    slot.innerHTML = meal.charAt(0).toUpperCase() + meal.slice(1);
    displayShoppingList();
}


function loadMealPlan() {
    const allSlots = document.querySelectorAll('.meal-slot');
    allSlots.forEach(slot => {
        const mealType = slot.dataset.meal;
        slot.innerHTML = `<span class="meal-label">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>`; // Reset slot
    });

    const mealPlan = accounts[currentAccount].mealPlan || {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null },
    };

    Object.keys(mealPlan).forEach(day => {
        Object.keys(mealPlan[day]).forEach(meal => {
            const recipe = mealPlan[day][meal];
            const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
            if (recipe && slot) {
                slot.innerHTML = `
                    <div class="meal-item" draggable="true" data-recipe-index="${recipes.findIndex(r => r.name === recipe.name)}" ondragstart="handleDragStart(event)">
                        <h4 class="recipe-title" onclick="showRecipeDetails(${recipes.findIndex(r => r.name === recipe.name)})">${recipe.name}</h4>
                        <button onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
                    </div>
                `;
            }
        });
    });
}


// Call loadMealPlan on page load
document.addEventListener("DOMContentLoaded", () => {
    loadMealPlan();
});


function showRecipeDetails(index) {
    const recipe = recipes[index];
    const content = document.getElementById('weekly-details-content');
    const modal = document.getElementById('weekly-details');

    // Populate the content container with recipe details
    content.innerHTML = `
        <h3>${recipe.name}</h3>
        <p><strong>Cooking Time:</strong> ${recipe.time}</p>
        <p><strong>Category:</strong> ${recipe.mainCategory} (${recipe.subCategory})</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
            ${recipe.ingredients
                .map(ing => `<li>${ing.quantity} ${ing.unit || ''} ${ing.name}</li>`)
                .join('')}
        </ul>
        <p><strong>Instructions:</strong></p>
        <ol>
            ${recipe.instructions
                .map((step, idx) => `<li>${step}</li>`)
                .join('')}
        </ol>
    `;

    // Show the weekly details box
    modal.style.display = 'block';
}

// Event listener for the close button
document.getElementById('close-weekly-details').addEventListener('click', () => {
    const modal = document.getElementById('weekly-details');
    modal.style.display = 'none';
});


// Add new recipe
document.getElementById('recipe-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('recipe-name').value.trim();
    const time = document.getElementById('recipe-time').value.trim();
    const glutenOption = document.getElementById('gluten-option').value;
    const mainCategory = document.getElementById('main-category').value;
    const subCategory = document.getElementById('sub-category').value;

    const recipe = {
        name,
        time,
        glutenOption,
        mainCategory,
        subCategory,
        ingredients: [...tempIngredients],
        instructions: [...tempInstructions],
        image: uploadedImage,
        rating: 0, // Initial star rating
    };

    recipes.push(recipe);
    saveRecipes();
    displayRecipes();

        // Reset modal and close it

    this.reset();
    tempIngredients = [];
    tempInstructions = [];
    uploadedImage = null;
    document.getElementById('image-preview').style.display = 'none';
    updateIngredientList();
    updateInstructionList();
    closeModal('add-recipe-modal'); // Close modal after saving
});

// Display recipes grouped by categories
function displayRecipes() {
    const accordion = document.getElementById("accordion");
    accordion.innerHTML = ""; // Clear existing content

    // Group recipes by their main category
    const groupedRecipes = recipes.reduce((groups, recipe) => {
        const groupKey = recipe.mainCategory || "Uncategorized";
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(recipe);
        return groups;
    }, {});

    // Sort the categories alphabetically
    const sortedCategories = Object.keys(groupedRecipes).sort();

    // Render the sorted categories
    sortedCategories.forEach((category) => {
        const groupRecipes = groupedRecipes[category];

        // Create the accordion button
        const button = document.createElement("button");
        button.className = `accordion-button ${category.toLowerCase().replace(/\s+/g, '-')}`; // Add category-specific class
        button.textContent = `${category} (${groupRecipes.length} recipes)`;
        button.addEventListener("click", () => {
            const content = button.nextElementSibling;
            button.classList.toggle("active");
            content.classList.toggle("active");
        });

        // Create the accordion content
        const content = document.createElement("div");
        content.className = "accordion-content";

        // Add recipe cards to the content
        groupRecipes.forEach((recipe, index) => {
            const card = document.createElement("div");
            card.className = "recipe-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("data-recipe-index", recipes.indexOf(recipe)); // Use index from the main recipes array
            card.addEventListener("dragstart", handleDragStart);
            card.addEventListener("dragend", handleDragEnd);

            card.innerHTML = `
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-img">` : ""}
                <h4>${recipe.name}</h4>
                <p>${recipe.time}, ${recipe.glutenOption}</p>
                <p>${recipe.subCategory}</p>
                <p class="stars">${'⭐'.repeat(recipe.rating)}</p>
                <div class="button-group">
                    <button onclick="addToWeeklyList(${recipes.indexOf(recipe)})" class="add">Add</button>
                    <button onclick="editRecipe(${recipes.indexOf(recipe)})" class="edit">Edit</button>
                    <button onclick="deleteRecipe(${recipes.indexOf(recipe)})" class="delete">Delete</button>
                    <button onclick="copyRecipe(${recipes.indexOf(recipe)})" class="copy">Copy</button>
                </div>
            `;

            content.appendChild(card);
        });

        // Append button and content to the accordion
        accordion.appendChild(button);
        accordion.appendChild(content);
    });
}


function handleDragEnd(event) {
    event.target.style.opacity = ""; // Reset opacity after dragging
}


function deleteRecipe(index) {
    if (confirm(`Are you sure you want to delete "${recipes[index].name}"? This action cannot be undone.`)) {
        recipes.splice(index, 1); // Remove the recipe from the array
        saveRecipes(); // Save the updated recipes to localStorage
        displayRecipes(); // Refresh the displayed recipes
        alert('Recipe has been deleted.');
    }
}

// Function to copy a recipe
function copyRecipe(index) {
    const recipeToCopy = recipes[index];

    // Create a new recipe by copying the selected recipe
    const newRecipe = {
        ...recipeToCopy,
        name: `${recipeToCopy.name} (Copy)`, // Add "(Copy)" to distinguish the duplicate
    };

    recipes.push(newRecipe);
    saveRecipes(); // Save the updated list to localStorage
    displayRecipes(); // Refresh the display
    alert(`Recipe "${recipeToCopy.name}" copied successfully!`);
}



function addToWeeklyList(index) {
    if (weeklyRecipes.length >= 3) {
        alert('You can only add up to 3 recipes to your weekly list.');
        return;
    }

    const recipe = recipes[index];
    if (!weeklyRecipes.includes(recipe)) {
        weeklyRecipes.push(recipe);
        saveWeeklyRecipes(); // Save the updated list to localStorage
        displayWeeklyRecipes();
        displayShoppingList(); // Update the shopping list
    } else {
        alert('This recipe is already in your weekly list.');
    }
}

function displayWeeklyRecipes() {
    const weeklyRecipes = accounts[currentAccount]?.weeklyRecipes || [];

    const weeklyTabs = document.getElementById('weekly-tabs');
    const weeklyDetails = document.getElementById('weekly-details');

    // Check if the elements exist
    if (!weeklyTabs || !weeklyDetails) {
        console.warn('Elements "weekly-tabs" or "weekly-details" are not present in the DOM.');
        return;
    }

    // Clear existing content
    weeklyTabs.innerHTML = '';
    weeklyDetails.innerHTML = '';

    if (weeklyRecipes.length === 0) {
        weeklyDetails.innerHTML = '<p>No recipes selected for the week.</p>';
        return;
    }

    // Create tabs for each recipe
    weeklyRecipes.forEach((recipe, index) => {
        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.alignItems = 'center';
        tabContainer.style.gap = '10px';
        tabContainer.style.marginBottom = '10px';

        const tab = document.createElement('button');
        tab.textContent = recipe.name;
        tab.style.padding = '10px';

        // Add event listener for tab click
        tab.addEventListener('click', () => showWeeklyRecipeDetails(index));
        tabContainer.appendChild(tab);

        // Add remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.style.padding = '5px 10px';
        removeButton.style.backgroundColor = 'red';
        removeButton.style.color = 'white';
        removeButton.style.border = 'none';
        removeButton.style.cursor = 'pointer';
        removeButton.addEventListener('click', () => removeFromWeeklyList(index));
        tabContainer.appendChild(removeButton);

        weeklyTabs.appendChild(tabContainer);
    });

    // Display the first recipe's details by default
    if (weeklyRecipes.length > 0) {
        showWeeklyRecipeDetails(0);
    }
}


function removeFromWeeklyList(index) {
    const weeklyRecipes = accounts[currentAccount].weeklyRecipes;
    if (!weeklyRecipes || !weeklyRecipes[index]) {
        alert('Invalid recipe selected.');
        return;
    }

    if (confirm(`Are you sure you want to remove "${weeklyRecipes[index].name}" from the weekly list?`)) {
        weeklyRecipes.splice(index, 1); // Remove the recipe
        saveAccountData(); // Save updated data
        displayWeeklyRecipes(); // Refresh UI
    }
}

// Function to display the details of a selected weekly recipe
function showWeeklyRecipeDetails(index) {
    const recipe = weeklyRecipes[index];
    const weeklyDetails = document.getElementById('weekly-details');

    // Format rating stars
    const ratingStars = recipe.rating > 0 ? `${recipe.rating} Star${recipe.rating > 1 ? 's' : ''}` : 'Not Rated';

    // Render the recipe details
    weeklyDetails.innerHTML = `
        <h3>${recipe.name} (${recipe.time}, ${recipe.glutenOption}, ${recipe.mainCategory}, ${recipe.subCategory}, ${ratingStars})</h3>
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" style="max-width: 100%; height: auto; margin-bottom: 10px;">` : ''}
        <p><strong>Ingredients:</strong></p>
        <ul style="list-style-type: disc; padding-left: 20px;">
            ${recipe.ingredients
                .map(ing => `<li>${ing.quantity ? `${ing.quantity} ` : ''}${ing.unit ? `${ing.unit} ` : ''}${ing.name}</li>`)
                .join('')}
        </ul>
        <p><strong>Instructions:</strong></p>
        <ol style="padding-left: 20px;">
            ${recipe.instructions
                .map((step, index) => `<li>${step}</li>`)
                .join('')}
        </ol>
    `;
}


document.getElementById('clear-weekly-list').addEventListener('click', function () {
    if (confirm('Are you sure you want to clear the weekly list?')) {
        weeklyRecipes = [];
        saveWeeklyRecipes(); // Save the empty list to localStorage
        displayWeeklyRecipes();
        displayShoppingList(); // Update the shopping list
    }
});

// Display shopping list
function displayShoppingList() {
    // Use account-specific mealPlan
    const mealPlan = accounts[currentAccount].mealPlan || {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null },
    };

    const totals = {};

    // Use a Set to track recipe indices to avoid processing duplicates
    const processedRecipes = new Set();

    Object.keys(mealPlan).forEach(day => {
        Object.keys(mealPlan[day]).forEach(meal => {
            const recipe = mealPlan[day][meal];

            // Skip if recipe is null or already processed
            if (!recipe || processedRecipes.has(recipe.name)) return;

            // Mark this recipe as processed
            processedRecipes.add(recipe.name);

            // Aggregate ingredients
            recipe.ingredients.forEach(({ name, quantity, unit }) => {
                const key = `${name}-${unit}`;
                if (!totals[key]) {
                    totals[key] = { name, quantity: 0, unit };
                }
                totals[key].quantity += quantity;
            });
        });
    });

    // Update the shopping list display
    const shoppingList = document.getElementById('shopping-list-items');
    shoppingList.innerHTML = `
        <ul>
            ${Object.values(totals)
                .map(({ name, quantity, unit }) => `<li>${quantity} ${unit} ${name}</li>`)
                .join('')}
        </ul>
    `;
}




// Edit recipe
function editRecipe(index) {
    recipeToEdit = index;
    const recipe = recipes[index];

    // Populate fields with existing recipe data
    document.getElementById('edit-recipe-name').value = recipe.name;
    document.getElementById('edit-recipe-time').value = recipe.time;
    document.getElementById('edit-gluten-option').value = recipe.glutenOption;
    document.getElementById('edit-main-category').value = recipe.mainCategory;
    document.getElementById('edit-sub-category').value = recipe.subCategory;

    // Format ingredients for the bulk textarea
    document.getElementById('edit-bulk-ingredients').value = recipe.ingredients
        .map(ing => `${ing.quantity ? `${ing.quantity} ` : ''}${ing.unit !== '(no unit)' ? `${ing.unit} ` : ''}${ing.name}`)
        .join('\n');

    // Format instructions for the bulk textarea
    document.getElementById('edit-bulk-instructions').value = recipe.instructions.join('\n');

    if (recipe.image) {
        document.getElementById('edit-image-preview').src = recipe.image;
        document.getElementById('edit-image-preview').style.display = 'block';
    } else {
        document.getElementById('edit-image-preview').style.display = 'none';
    }

    document.getElementById('edit-recipe-modal').style.display = 'block';
}

// Save edited recipe
document.getElementById('edit-recipe-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Parse ingredients with the updated parsing logic
    const updatedIngredients = document.getElementById('edit-bulk-ingredients').value
        .trim()
        .split('\n')
        .map(line => {
            const match = line.match(/^(\d+(?:\/\d+)?(?:\s\d+\/\d+)?)?\s*(tsp|tbsp|g|kg|ml|l|pieces|stick|clove|cup|teaspoon|tablespoon|sprig|no unit)?\s*(.+)$/i);
            if (match) {
                const [, quantity, unit, name] = match;
                return {
                    name: name.trim(),
                    quantity: quantity ? parseFraction(quantity.trim()) : 0,
                    unit: unit ? unit.trim() : '(no unit)',
                };
            }
            return null;
        })
        .filter(Boolean);

    // Parse instructions as usual
    const updatedInstructions = document.getElementById('edit-bulk-instructions').value
        .trim()
        .split('\n')
        .map(line => line.trim());

        
        const updatedRating = parseInt(document.getElementById('edit-recipe-rating').value, 10) || 0;


    const updatedRecipe = {
        ...recipes[recipeToEdit], // Retain existing properties
        name: document.getElementById('edit-recipe-name').value.trim(),
        time: document.getElementById('edit-recipe-time').value.trim(),
        glutenOption: document.getElementById('edit-gluten-option').value,
        mainCategory: document.getElementById('edit-main-category').value.trim(),
        subCategory: document.getElementById('edit-sub-category').value.trim(),
        ingredients: updatedIngredients,
        instructions: updatedInstructions,
        rating: isNaN(updatedRating) ? 0 : updatedRating, // Update the rating
        image: uploadedImage || recipes[recipeToEdit].image, // Retain existing image if not updated
    };

    recipes[recipeToEdit] = updatedRecipe; // Update the recipe in the array
    saveRecipes(); // Save updated recipes to localStorage
    displayRecipes(); // Refresh the displayed recipes

    document.getElementById('edit-recipe-modal').style.display = 'none'; // Close modal
});


// Cancel edit
document.getElementById('cancel-edit').addEventListener('click', function () {
    document.getElementById('edit-recipe-modal').style.display = 'none';
});


// Clear all recipes
document.getElementById('clear-recipes-button').addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all recipes? This action cannot be undone.')) {
        // Clear recipes from localStorage and in-memory array
        localStorage.removeItem('recipes');
        recipes = [];
        displayRecipes(); // Refresh the displayed recipes
        alert('All recipes have been cleared.');
    }
});

function saveWeeklyRecipes() {
    accounts[currentAccount].weeklyRecipes = weeklyRecipes;
    saveAccountData();
}


// Toggle Upload Recipes Section
document.getElementById("toggle-upload-csv").addEventListener("click", function () {
    const uploadSection = document.getElementById("upload-csv-section");
    if (uploadSection.style.display === "none") {
        uploadSection.style.display = "block";
        this.textContent = "Hide Upload Recipes";
    } else {
        uploadSection.style.display = "none";
        this.textContent = "Upload Recipes";
    }
});

// Handle CSV Upload
document.getElementById("upload-csv-button").addEventListener("click", function () {
    const fileInput = document.getElementById("csv-upload");
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById("upload-status").textContent = "Please select a CSV file to upload.";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        parseCSV(csvData);
    };
    reader.readAsText(file);
});

function parseCSV(csvData) {
    const rows = csvData.split("\n").map(row => row.trim()).filter(row => row); // Split into rows
    const headers = rows[0].split(",").map(header => header.trim()); // Get column names
    const recipesData = rows.slice(1).map(row => {
        const values = row.split(",").map(value => value.trim());
        const recipe = {};
        headers.forEach((header, index) => {
            recipe[header] = values[index];
        });
        return recipe;
    });

    recipesData.forEach(recipe => {
        addRecipeFromCSV(recipe);
    });

    saveRecipes();
    displayRecipes();
    document.getElementById("upload-status").textContent = "Recipes successfully uploaded!";
}

function addRecipeFromCSV(data) {
    const ingredients = data.ingredients
        ? data.ingredients.split("|").map(ingredient => {
              const match = ingredient.match(/^(\d+(?:\/\d+)?(?:\s\d+\/\d+)?)?\s*(\w+)?\s*(.+)?$/);
              if (match) {
                  const [, quantity, unit, name] = match;
                  return { quantity: parseFloat(quantity) || 0, unit: unit || "(no unit)", name: name || "" };
              }
              return { quantity: 0, unit: "(no unit)", name: ingredient };
          })
        : [];

    const instructions = data.instructions ? data.instructions.split("|") : [];

    const newRecipe = {
        name: data.name || "Unnamed Recipe",
        time: data.time || "Unknown Time",
        glutenOption: data.glutenOption || "Contains Gluten",
        mainCategory: data.mainCategory || "Uncategorized",
        subCategory: data.subCategory || "Misc",
        ingredients: ingredients,
        instructions: instructions,
        image: data.image || null,
        rating: 0,
    };

    recipes.push(newRecipe);
}

// Function to save changes to the current week
function saveCurrentWeek() {
    if (!accounts[currentAccount].savedWeeks) {
        accounts[currentAccount].savedWeeks = [];
    }

    const weekName = document.getElementById('week-name').value.trim();
    if (!weekName) {
        alert('Please provide a name for the week.');
        return;
    }

    const mealPlan = accounts[currentAccount].mealPlan || {};
    const isMealPlanEmpty = Object.values(mealPlan).every(day =>
        Object.values(day).every(meal => meal === null)
    );

    if (isMealPlanEmpty) {
        alert('Cannot save an empty week. Add recipes to the planner.');
        return;
    }

    console.log('Saving current week:', weekName); // Debugging log
    console.log('Current meal plan before saving:', mealPlan); // Debugging log

    const week = {
        name: weekName,
        mealPlan: JSON.parse(JSON.stringify(mealPlan)), // Deep copy
    };

    accounts[currentAccount].savedWeeks.push(week);
    saveAccountData();

    console.log('Saved weeks after saving:', accounts[currentAccount].savedWeeks); // Debugging log

    displaySavedWeeks();
}

// Function to display saved weeks
function displaySavedWeeks() {
    const weeksList = document.getElementById('weeks-list');
    weeksList.innerHTML = '';

    (accounts[currentAccount].savedWeeks || []).forEach((week, index) => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'week-item';
        weekDiv.innerHTML = `
            <span>${week.name}</span>
            <button onclick="loadSavedWeek(${index})">Load Week</button>
            <button onclick="deleteSavedWeek(${index})" style="background-color: #e74c3c; color: white;">Delete Week</button>
        `;
        weeksList.appendChild(weekDiv);
    });
}

// Function to delete a saved week
function deleteSavedWeek(index) {
    const savedWeeks = accounts[currentAccount].savedWeeks;

    if (!savedWeeks || !savedWeeks[index]) {
        alert("Invalid week selected.");
        return;
    }

    if (confirm(`Are you sure you want to delete ${savedWeeks[index].name}?`)) {
        savedWeeks.splice(index, 1); // Remove the week from the array
        saveAccountData(); // Save the updated accounts to localStorage
        displaySavedWeeks(); // Refresh the list
        alert("Week deleted successfully!");
    }
}



let currentWeekIndex = null; // Keep track of the currently loaded week

// Function to load a saved week
function loadSavedWeek(index) {
    console.log(`loadSavedWeek called with index: ${index}`); // Debugging log

    const savedWeeks = accounts[currentAccount]?.savedWeeks || [];
    if (!savedWeeks[index]) {
        console.error('Invalid or missing week data:', savedWeeks[index]); // Debugging log
        alert('Invalid week selected.');
        return;
    }

    const selectedWeek = savedWeeks[index];
    console.log(`Selected week:`, selectedWeek); // Debugging log

    if (!selectedWeek.mealPlan) {
        console.error('Missing mealPlan for the selected week:', selectedWeek); // Debugging log
        alert('The selected week does not have a valid meal plan.');
        return;
    }

    accounts[currentAccount].mealPlan = JSON.parse(JSON.stringify(selectedWeek.mealPlan)); // Deep copy
    saveAccountData();
    loadMealPlan();

    const weekNameInput = document.getElementById("week-name");
    weekNameInput.value = selectedWeek.name;

    displayShoppingList();

    alert(`${selectedWeek.name} has been loaded!`);
}



// Display saved weeks on page load
document.addEventListener("DOMContentLoaded", displaySavedWeeks);


// Add event listener for the save button
document.getElementById("save-week").addEventListener("click", saveCurrentWeek);


function randomizeWeeklyRecipes() {
    if (recipes.length < 3) {
        alert('Not enough recipes to randomize. Add more recipes to the list.');
        return;
    }

    // Shuffle the recipes array and pick the first 3 recipes
    const shuffledRecipes = recipes.slice().sort(() => Math.random() - 0.5);
    weeklyRecipes = shuffledRecipes.slice(0, 3);

    saveWeeklyRecipes(); // Save the randomized list to localStorage
    displayWeeklyRecipes(); // Update the UI
    displayShoppingList(); // Update the shopping list
}

// Save button event listener
document.getElementById("save-week").addEventListener("click", saveCurrentWeek);

// Display saved weeks on page load
document.addEventListener("DOMContentLoaded", displaySavedWeeks);

//document.getElementById('randomize-button').addEventListener('click', randomizeWeeklyRecipes);

document.getElementById('clear-weekly-list').addEventListener('click', function () {
    if (confirm('Are you sure you want to clear the weekly list?')) {
        Object.keys(accounts[currentAccount].mealPlan).forEach(day => {
            Object.keys(accounts[currentAccount].mealPlan[day]).forEach(meal => {
                accounts[currentAccount].mealPlan[day][meal] = null; // Set all meals to null
            });
        });

        saveAccountData(); // Save the cleared mealPlan to localStorage
        loadMealPlan(); // Refresh the UI
        alert('The weekly list has been cleared!');
    }
});


const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    // Enable click-to-select functionality
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            // Highlight selected recipe
            document.querySelectorAll('.recipe-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Drop functionality
    document.querySelectorAll('.meal-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const selectedRecipe = document.querySelector('.recipe-card.selected');
            if (selectedRecipe) {
                slot.innerHTML = `
                    <div>
                        ${selectedRecipe.querySelector('h4').textContent}
                        <button onclick="removeFromMealPlan('${slot.dataset.day}', '${slot.dataset.meal}')">Remove</button>
                    </div>
                `;
            }
        });
    });
}

document.getElementById("download-recipes").addEventListener("click", function () {
    // Prepare the recipes as a JSON string
    const dataStr = JSON.stringify(recipes, null, 4);

    // Create a Blob and download the file
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipes.json";
    a.click();
    URL.revokeObjectURL(url);

    alert("Recipes have been downloaded as recipes.json!");
});

document.getElementById("upload-recipes-btn").addEventListener("click", function () {
    // Trigger file selection dialog
    document.getElementById("upload-recipes").click();
});

document.getElementById("upload-recipes").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    // Read the uploaded file
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const uploadedRecipes = JSON.parse(e.target.result);

            // Validate the uploaded data
            if (!Array.isArray(uploadedRecipes)) {
                throw new Error("Invalid format: expected an array of recipes.");
            }

            // Update the recipes and save them
            recipes = uploadedRecipes;
            saveRecipes();
            displayRecipes(); // Refresh the display

            alert("Recipes have been uploaded successfully!");
        } catch (error) {
            alert(`Error uploading recipes: ${error.message}`);
        }
    };
    reader.readAsText(file);
});



document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired"); // Debugging log
    initializeMealPlanner(); // Call your function here
});

// Display recipes on page load
displayRecipes();

