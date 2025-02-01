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

    matchingRecipes.forEach(recipe => {
        const recipeIndex = recipes.indexOf(recipe);

        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.setAttribute('draggable', 'true');
        recipeCard.setAttribute('data-recipe-index', recipeIndex);
        recipeCard.addEventListener('dragstart', handleDragStart);

        recipeCard.innerHTML = `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-img">` : ""}
        <h4>${recipe.name}</h4>
        <p>${recipe.time}, ${recipe.glutenOption}</p>
        <p>${recipe.subCategory}</p>
        <p class="stars">${'⭐'.repeat(recipe.rating)}</p>
        ${recipe.tags && recipe.tags.length ? `<p class="tags">Tags: ${recipe.tags.join(', ')}</p>` : ""}
        <div class="button-group">
            <button onclick="openMealPlanModal(${recipes.indexOf(recipe)})" class="add">Add</button>
            <button onclick="editRecipe(${recipes.indexOf(recipe)}, event)" class="edit">Edit</button>
            <button onclick="deleteRecipe(${recipes.indexOf(recipe)})" class="delete">Delete</button>
            <button onclick="copyRecipe(${recipes.indexOf(recipe)})" class="copy">Copy</button>
        </div>
    `;

        resultsContainer.appendChild(recipeCard);
    });

    console.log(isTextSearch ? "Results from text search:" : "Results from filters:", matchingRecipes);
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

// Function to handle tag search dynamically
function handleTagSearch(event) {
    const searchTag = event.target.value.trim().toLowerCase(); // Get input value

    if (!searchTag) {
        clearSearchResults(); // If input is empty, clear results
        return;
    }

    const matchingRecipes = recipes.filter(recipe =>
        recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTag))
    );

    displaySearchResults(matchingRecipes, false); // Pass 'false' to indicate it's a tag filter
}

// Attach event listener to the tag search input
document.getElementById('tag-filter').addEventListener('input', handleTagSearch);





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

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired"); // Debugging log

    // Initialize essential functions
    initializeMealPlanner();
    loadMealPlan();
    displaySavedWeeks();
    displayShoppingList();

    // Attach filter button event listeners
    //document.getElementById("apply-filters").addEventListener("click", filterRecipes);
    //document.getElementById("reset-filters").addEventListener("click", resetFilters);

    // Initialize selected filters display
    //updateSelectedFiltersDisplay();

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
        document.querySelectorAll(".filter-dropdown").forEach(dd => (dd.style.display = "none"));
    });

    // Attach dropdown toggle event listeners
    document.querySelectorAll(".filter-dropdown input").forEach(input => {
        input.addEventListener("change", updateSelectedFiltersDisplay);
    });

    console.log("Filter event listeners attached");
});

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

    document.getElementById('selected-filters-container').innerHTML =
        allSelectedFilters.length > 0
            ? `<strong>Selected Filters:</strong> ${allSelectedFilters.join(", ")}`
            : "No filters selected.";
}


// Update the instruction list display
function updateInstructionList() {
    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = tempInstructions
        .map((instruction, index) => `<div>${index + 1}. ${instruction}</div>`)
        .join('');
}

function parseIngredientLine(line) {
    const trimmedLine = line.trim();
    if (!trimmedLine) return null;

    const match = trimmedLine.match(/^(\d+(?:\.\d+)?(?:\s\d+\/\d+)?)?\s*([\w\-]*)\s+(.+)$/i);

    if (match) {
        let [_, rawQuantity, unit, name] = match;
        let quantity = rawQuantity ? rawQuantity.trim() : "";

        // Handle mixed fractions (e.g., "1 1/2")
        if (quantity.includes(" ")) {
            const parts = quantity.split(" ");
            const wholeNumber = parseFloat(parts[0]);
            const fractionParts = parts[1].split("/");
            quantity = wholeNumber + (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]));
        } else if (quantity.includes("/")) {
            const fractionParts = quantity.split("/");
            quantity = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
        } else if (quantity.startsWith(".")) {
            quantity = `0${quantity}`; // Convert ".5" to "0.5"
        }

        quantity = quantity ? parseFloat(quantity) : 1; // Default to 1 if empty

        // Standardize units
        const unitMap = {
            tbsp: "tablespoon",
            tbspn: "tablespoon",
            tsps: "teaspoon",
            tsp: "teaspoon",
            cups: "cup",
            oz: "ounce",
            g: "gram",
            kg: "kilogram",
            ml: "milliliter",
            l: "liter",
            inch: "inch",
            can: "can",
            clove: "clove",
            sprig: "sprig",
            stick: "stick",
            bunch: "bunch",
            null: "", // Ensure missing units are empty, not "null"
        };

        unit = unit ? unit.toLowerCase().trim() : "";
        unit = unitMap[unit] || unit; // Standardize unit names

        return {
            quantity: quantity,
            unit: unit,
            name: name.replace(/\s+/g, " ").trim(), // 🔥 Fix extra spaces in name
        };
    }

    return {
        quantity: 1,
        unit: "",
        name: trimmedLine.replace(/\s+/g, " ").trim(), // 🔥 Trim here too
    };
}



function updateIngredientList() {
    const ingredientsList = document.getElementById('ingredients-list');
    if (!ingredientsList) {
        console.error("Element with ID 'ingredients-list' not found.");
        return;
    }

    ingredientsList.innerHTML = tempIngredients
        .map(ingredient => `
            <div>
                ${ingredient.quantity ? ingredient.quantity + ' ' : ''}
                ${ingredient.unit ? ingredient.unit + ' ' : ''}
                ${ingredient.name}
            </div>
        `)
        .join('');
}


function updateInstructionList() {
    const instructionsList = document.getElementById('instructions-list');
    if (!instructionsList) {
        console.error("Element with ID 'instructions-list' not found.");
        return;
    }

    instructionsList.innerHTML = tempInstructions
        .map((instruction, index) => `<div>${index + 1}. ${instruction}</div>`)
        .join('');
}



document.getElementById('parse-ingredients-button').addEventListener('click', function () {
    const bulkInput = document.getElementById('bulk-ingredients').value.trim();
    const lines = bulkInput.split('\n');

    tempIngredients = lines
        .map(parseIngredientLine) // Use our function
        .filter(Boolean); // Remove null values

    updateIngredientList();
    document.getElementById('bulk-ingredients').value = ''; // Clear input
});

document.getElementById('parse-instructions-button').addEventListener('click', function () { 
    const bulkInput = document.getElementById('bulk-instructions').value.trim();
    const lines = bulkInput.split('\n');

    // Store parsed instructions
    tempInstructions = lines
        .map(line => line.trim())
        .filter(line => line.length > 0); // Remove empty lines

    updateInstructionList(); // Update UI
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

        // **Remove the recipe from any existing slot** to prevent duplicates
        Object.keys(accounts[currentAccount].mealPlan).forEach(existingDay => {
            Object.keys(accounts[currentAccount].mealPlan[existingDay]).forEach(existingMeal => {
                if (accounts[currentAccount].mealPlan[existingDay][existingMeal]?.name === recipe.name) {
                    accounts[currentAccount].mealPlan[existingDay][existingMeal] = null;

                    // **Clear the previous UI slot**
                    const oldSlot = document.querySelector(`.meal-slot[data-day="${existingDay}"][data-meal="${existingMeal}"]`);
                    if (oldSlot) {
                        oldSlot.innerHTML = `<span class="meal-label">${existingMeal.charAt(0).toUpperCase() + existingMeal.slice(1)}</span>`;
                    }
                }
            });
        });

        // **Save the recipe to the new slot**
        accounts[currentAccount].mealPlan[day][meal] = recipe;
        saveAccountData();

        // **Update the UI for the new slot**
        const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
        if (slot) {
            slot.innerHTML = `
                <div class="meal-item" draggable="true" data-recipe-index="${recipeIndex}" ondragstart="handleDragStart(event)">
                    <h4 class="recipe-title">${recipe.name}</h4>
                    <button class="show-recipe-button" onclick="showRecipeDetails(${recipeIndex})">Show Recipe</button>
                    <button class="remove-recipe-button" onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
                </div>
            `;
        }

        displayShoppingList(); // **Ensure shopping list updates**
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
    const mealItem = event.target.closest(".meal-item, .recipe-card"); 
    if (!mealItem) {
        console.error("Drag start initiated on an invalid element:", event.target);
        return;
    }

    const recipeIndex = mealItem.dataset.recipeIndex;
    if (!recipeIndex) {
        console.error("Recipe index is missing in drag event target:", mealItem);
        return;
    }

    const data = JSON.stringify({ recipeIndex });
    event.dataTransfer.setData("application/json", data);
    event.target.style.opacity = "0.5";
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

    // Remove recipe from any existing slot to prevent duplicates
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

    // **Ensure the UI Updates Instantly**
    updateMealSlot(day, meal, recipe);
}

// **🛠 Function to Update Meal Slots Dynamically**
function updateMealSlot(day, meal, recipe) {
    const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);
    if (slot) {
        slot.innerHTML = `
            <div class="meal-item" draggable="true" data-recipe-index="${recipes.indexOf(recipe)}" ondragstart="handleDragStart(event)">
                <h4 class="recipe-title">${recipe.name}</h4>
                <button class="show-recipe-button" onclick="showRecipeDetails(${recipes.indexOf(recipe)})">Show Recipe</button>
                <button class="remove-recipe-button" onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
            </div>
        `;
    }
    displayShoppingList(); // Ensure shopping list updates
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

    // Reset all slots to just their category labels
    allSlots.forEach(slot => {
        const mealType = slot.dataset.meal;
        slot.innerHTML = `<span class="meal-label">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>`;
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

    // Loop through each day's meal slots and re-add the recipe card with buttons
    Object.keys(mealPlan).forEach(day => {
        Object.keys(mealPlan[day]).forEach(meal => {
            const recipe = mealPlan[day][meal];
            const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"]`);

            if (recipe && slot) {
                const recipeIndex = recipes.findIndex(r => r.name === recipe.name);
                if (recipeIndex === -1) return; // Skip if the recipe isn't found

                slot.innerHTML = `
                    <div class="meal-item" draggable="true" data-recipe-index="${recipeIndex}" ondragstart="handleDragStart(event)">
                        <h4 class="recipe-title">${recipe.name}</h4>
                        <button class="show-recipe-button" onclick="showRecipeDetails(${recipeIndex})">Show Recipe</button>
                        <button class="remove-recipe-button" onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
                    </div>
                `;
            }
        });
    });

    console.log("Meal plan loaded successfully.");
}


// Add new recipe
document.getElementById('recipe-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('recipe-name').value.trim();
    const time = document.getElementById('recipe-time').value.trim();
    const glutenOption = document.getElementById('gluten-option').value;
    const mainCategory = document.getElementById('main-category').value;
    const subCategory = document.getElementById('sub-category').value;
    
    // ✅ Get selected tags
    const selectedTags = [...document.querySelectorAll('#add-tags-container .tag.selected')].map(tag => tag.dataset.tag);

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
        tags: selectedTags // ✅ Save selected tags
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

// ✅ Ensure tag selection works in the "Add Recipe" form
function setupAddRecipeTagSelection() {
    document.querySelectorAll('#add-tags-container .tag').forEach(tag => {
        tag.addEventListener('click', function () {
            this.classList.toggle('selected'); // ✅ Toggle selection
            updateAddRecipeSelectedTagsDisplay();
        });
    });
}

// ✅ Function to update selected tags visually in "Add Recipe"
function updateAddRecipeSelectedTagsDisplay() {
    const selectedTagsContainer = document.getElementById('selected-tags');
    selectedTagsContainer.innerHTML = ''; // Clear previous selection

    document.querySelectorAll('#add-tags-container .tag.selected').forEach(tag => {
        const selectedTag = document.createElement('span');
        selectedTag.className = 'selected-tag';
        selectedTag.textContent = tag.dataset.tag;
        selectedTag.dataset.tag = tag.dataset.tag;

        // ✅ Allow deselection by clicking the selected tag
        selectedTag.addEventListener('click', function () {
            selectedTag.remove(); // Remove from UI
            document.querySelector(`#add-tags-container .tag[data-tag="${tag.dataset.tag}"]`).classList.remove('selected'); // ✅ Unselect tag
        });

        selectedTagsContainer.appendChild(selectedTag);
    });
}

// ✅ Call the function when the page loads
setupAddRecipeTagSelection();


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
            ${recipe.tags && recipe.tags.length ? `<p class="tags">Tags: ${recipe.tags.join(', ')}</p>` : ""}
            
            <div class="button-group">
                <button onclick="openMealPlanModal(${recipes.indexOf(recipe)})" class="add">Add</button>
                <button onclick="editRecipe(${recipes.indexOf(recipe)}, event)" class="edit">Edit</button>
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


function showRecipeDetails(index) {
    const recipe = recipes[index];

    if (!recipe) {
        console.error("Recipe not found for index:", index);
        return;
    }

    const detailsContainer = document.getElementById("recipe-details-content");
    const detailsSection = document.getElementById("recipe-details");

    // Ensure the details container exists
    if (!detailsContainer) {
        console.error("Required element is missing: Ensure #recipe-details-content exists in your HTML.");
        return;
    }

    // Populate the details content
    detailsContainer.innerHTML = `
        <h3>${recipe.name}</h3>
        <p><strong>Cooking Time:</strong> ${recipe.time}</p>
        <p><strong>Category:</strong> ${recipe.mainCategory} (${recipe.subCategory})</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
            ${recipe.ingredients.map(ing => `<li>${ing.quantity || ""} ${ing.unit || ""} ${ing.name}</li>`).join("")}
        </ul>
        <p><strong>Instructions:</strong></p>
        <ol>
            ${recipe.instructions.map((step, idx) => `<li>${step}</li>`).join("")}
        </ol>
    `;

    // Show the section
    detailsSection.style.display = "block";
}

// Close the details section when clicking "Close"
function closeRecipeDetails() {
    document.getElementById("recipe-details").style.display = "none";
}


// Close the modal on button click
document.getElementById('close-weekly-details').addEventListener('click', () => {
    document.getElementById('weekly-details').style.display = 'none';
});



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
    const mealPlan = accounts[currentAccount].mealPlan || {};
    const totals = {};
    const processedRecipes = new Set();

    // Categorization of ingredients
    const categories = {
        "Fresh Produce": ["pepper", "onion", "garlic", "carrot", "aubergine", "chilli", "lemon", "baby spinach", "cloves"],
        "Herbs & Spices": ["basil", "coriander", "cinnamon", "turmeric", "garam masala", "cumin", "ginger", "oregano", "rosemary", "thyme", "cilantro", "indian red chili powder", "curry powder"],
        "Dry Goods": ["pasta", "lasagne sheets", "rice", "lentils", "flour", "linguine"],
        "Dairy": ["butter", "milk", "mozzarella", "cream"],
        "Oils & Condiments": ["olive oil", "coconut oil", "vegetable broth", "tomato purée", "white wine", "almond butter"],
        "Meat & Fish": ["chicken", "beef", "salmon", "pork", "salmon fillets", "fillets"],
        "Tins & Jars": ["canned tomatoes", "crushed tomatoes", "chopped tomatoes", "capers"]
    };

    Object.keys(mealPlan).forEach(day => {
        Object.keys(mealPlan[day]).forEach(meal => {
            const recipe = mealPlan[day][meal];
            if (!recipe || processedRecipes.has(recipe.name)) return;
            processedRecipes.add(recipe.name);

            recipe.ingredients.forEach(({ name, quantity, unit }) => {
                const key = `${name}-${unit || ''}`;
                if (!totals[key]) {
                    totals[key] = { name, quantity: 0, unit: unit || '' };
                }
                totals[key].quantity += quantity;
            });
        });
    });

    // Function to categorize ingredients correctly
    function categorizeIngredient(name) {
        name = name.toLowerCase();
        
        // Fix for garlic cloves
        if (name.includes("garlic") || name.includes("cloves")) return "Fresh Produce";
        
        // Fix for salmon fillets
        if (name.includes("salmon") || name.includes("fillets")) return "Meat & Fish";

        for (const [category, items] of Object.entries(categories)) {
            if (items.some(item => name.includes(item))) {
                return category;
            }
        }
        return "Other";
    }

    // Group ingredients into categories
    const categorizedItems = {};
    Object.values(totals).forEach(({ name, quantity, unit }) => {
        let category = categorizeIngredient(name);
        if (!categorizedItems[category]) categorizedItems[category] = [];
        categorizedItems[category].push({
            fullText: `${quantity} ${unit} ${name}`.trim(),  // UI display with units
            copyText: cleanIngredientName(`${quantity} ${unit} ${name}`.trim()),  // Stripped for clipboard
            id: `ingredient-${name.replace(/\s+/g, "-").toLowerCase()}`
        });
    });

    // Generate shopping list with checkboxes
    const shoppingListContainer = document.getElementById("shopping-list-items");
    shoppingListContainer.innerHTML = Object.entries(categorizedItems)
        .map(([category, items]) => `
            <h4 class="shopping-category">${category}</h4>
            <ul class="shopping-list">
                ${items.map(item => `
                    <li class="shopping-item">
                        <input type="checkbox" class="ingredient-checkbox" id="${item.id}" checked data-copy-text="${item.copyText}">
                        <label for="${item.id}">${item.fullText}</label>
                    </li>
                `).join('')}
            </ul>
        `).join('');

    // Ensure buttons are added only once
    let buttonContainer = document.getElementById("shopping-list-buttons");
    if (!buttonContainer) {
        buttonContainer = document.createElement("div");
        buttonContainer.id = "shopping-list-buttons";
        buttonContainer.innerHTML = `
            <button id="select-all">Select All</button>
            <button id="clear-all">Clear All</button>
        `;
        shoppingListContainer.parentElement.appendChild(buttonContainer);
    }

    // Event Listeners for buttons
    document.getElementById("select-all").addEventListener("click", () => {
        document.querySelectorAll(".ingredient-checkbox").forEach(cb => cb.checked = true);
    });

    document.getElementById("clear-all").addEventListener("click", () => {
        document.querySelectorAll(".ingredient-checkbox").forEach(cb => cb.checked = false);
    });

    document.getElementById("copy-shopping-list").addEventListener("click", () => {
        const selectedItems = Array.from(document.querySelectorAll(".ingredient-checkbox:checked"))
            .map(cb => cb.getAttribute("data-copy-text"))
            .join("\n");

        navigator.clipboard.writeText(selectedItems)
            .then(() => alert("Shopping list copied to clipboard!"))
            .catch(err => console.error("Failed to copy shopping list: ", err));
    });
}



document.getElementById("copy-shopping-list").addEventListener("click", function () {
    const shoppingListContainer = document.getElementById("shopping-list-items");

    // Extract only ingredient names
    const itemsText = [...shoppingListContainer.querySelectorAll("ul li")]
        .map(item => cleanIngredientName(item.textContent)) // Process each item
        .join("\n"); // Join without category titles

    // Copy to clipboard
    navigator.clipboard.writeText(itemsText)
        .then(() => alert("Shopping list copied to clipboard!"))
        .catch(err => console.error("Failed to copy shopping list: ", err));
});

    // Fix category assignment
    function categorizeIngredient(name) {
        let category = "Other"; // Default category
    
        for (const [cat, items] of Object.entries(categories)) {
            if (items.some(item => name.toLowerCase().includes(item))) {
                category = cat;
                break;
            }
        }
    
        return category;
    }

function copyShoppingList() {
    const checkedItems = Array.from(document.querySelectorAll(".ingredient-checkbox:checked"))
        .map(cb => cb.dataset.copyText)
        .join("\n");

    navigator.clipboard.writeText(checkedItems)
        .then(() => alert("Shopping list copied to clipboard!"))
        .catch(err => console.error("Failed to copy shopping list: ", err));
}


function cleanIngredientName(itemText) {
    // Patterns for removing numbers, measurements, and units
    const measurementPatterns = [
        /\b\d+\s?\/\s?\d+\b/,    // Fractions (e.g., "1/2", "1 ½")
        /\b\d+\.\d+\b/,          // Decimal numbers (e.g., "1.5")
        /\b\d+\b/,               // Standalone numbers (e.g., "3", "400g")
        /\bml\b|\blitre\b|\bg\b|\bkg\b|\bcan\b|\bpacket\b|\btablespoon\b|\btsp\b|\btbsp\b|\bcup\b|\bclove\b|\bslice\b|\bfillet\b|\bstick\b|\bpinch\b|\bsprig\b|\bbunch\b|\bx\b|\btablespoons\b|\bteaspoon\b|\bquart\b|\bpound\b|\boz\b/gi
    ];

    let cleanedText = itemText;

    // Remove measurement words and numbers
    measurementPatterns.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, "").trim();
    });

    // Fix leftover dots, stray spaces, or unnecessary words
    cleanedText = cleanedText
        .replace(/\s{2,}/g, " ")   // Remove extra spaces
        .replace(/^\.\s?/g, "")    // Remove leading dots
        .replace(/,\s?$/, "")      // Remove trailing commas
        .replace(/\bof\b/g, "")    // Remove 'of' (e.g., 'bunch of basil' -> 'basil')
        .trim();

    return cleanedText;
}

// Edit recipe
function editRecipe(index) {
    event.stopPropagation(); // Prevents event bubbling issues

    // 🔄 Ensure meal plan selection index is cleared before editing
    selectedRecipeIndex = null; 
    console.log("🔄 Reset selectedRecipeIndex before editing recipe");

    recipeToEdit = index;
    const recipe = recipes[index];

    // ✅ Populate fields with existing recipe data
    document.getElementById('edit-recipe-name').value = recipe.name;
    document.getElementById('edit-recipe-time').value = recipe.time;
    document.getElementById('edit-gluten-option').value = recipe.glutenOption;
    document.getElementById('edit-main-category').value = recipe.mainCategory;
    document.getElementById('edit-sub-category').value = recipe.subCategory;

    // ✅ Reset selected tags visually & clear previous selection
    const allTags = document.querySelectorAll('#edit-tags-container .tag');
    const selectedTagsContainer = document.getElementById('edit-selected-tags');
    selectedTagsContainer.innerHTML = ''; // Clear existing selected tags

    allTags.forEach(tag => {
        tag.classList.remove('selected'); // Reset all tags
        if (recipe.tags && recipe.tags.includes(tag.dataset.tag)) {
            tag.classList.add('selected'); // Highlight selected tags
        }
    });

    // ✅ Ensure tag selection is interactive & responsive
    setupEditTagSelection();

    // ✅ Format ingredients & instructions for bulk textareas
    document.getElementById('edit-bulk-ingredients').value = recipe.ingredients
        .map(ing => `${ing.quantity ? `${ing.quantity} ` : ''}${ing.unit !== '(no unit)' ? `${ing.unit} ` : ''}${ing.name}`.trim())
        .join('\n');

    document.getElementById('edit-bulk-instructions').value = recipe.instructions.join('\n');

    // ✅ Handle image preview
    if (recipe.image) {
        document.getElementById('edit-image-preview').src = recipe.image;
        document.getElementById('edit-image-preview').style.display = 'block';
    } else {
        document.getElementById('edit-image-preview').style.display = 'none';
    }

    // ✅ Show the modal & ensure scrolling works on mobile
    const modal = document.getElementById('edit-recipe-modal');
    modal.style.display = 'block';

    setTimeout(() => {
        modal.scrollTop = 0; // Scroll to top after opening
    }, 10);
}

// ✅ Function to enable selecting & deselecting tags in Edit Recipe
function setupEditTagSelection() {
    document.querySelectorAll('#edit-tags-container .tag').forEach(tag => {
        tag.removeEventListener('click', toggleEditTag); // Prevent duplicate event listeners
        tag.addEventListener('click', toggleEditTag);
    });

    // ✅ Update selected tags display immediately when opening the modal
    updateEditSelectedTags();
}

// ✅ Function to toggle tag selection
function toggleEditTag() {
    this.classList.toggle('selected'); // Toggle selection
    updateEditSelectedTags(); // Update UI instantly
}

// ✅ Function to update the selected tags display in real-time
function updateEditSelectedTags() {
    const selectedTagsContainer = document.getElementById('edit-selected-tags');
    selectedTagsContainer.innerHTML = ''; // Clear previous selection

    document.querySelectorAll('#edit-tags-container .tag.selected').forEach(tag => {
        addSelectedTag(tag.dataset.tag, selectedTagsContainer);
    });
}

// ✅ Function to add a selected tag to the UI (used for both initial load & real-time updates)
function addSelectedTag(tagText, container) {
    const selectedTag = document.createElement('span');
    selectedTag.className = 'selected-tag';
    selectedTag.textContent = tagText;
    selectedTag.dataset.tag = tagText;

    // ✅ Allow deselection by clicking the selected tag (removes it from UI & selection)
    selectedTag.addEventListener('click', function () {
        this.remove(); // Remove from UI
        document.querySelector(`#edit-tags-container .tag[data-tag="${tagText}"]`).classList.remove('selected');
    });

    container.appendChild(selectedTag);
}

// ✅ Save edited recipe
document.getElementById('edit-recipe-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const updatedIngredients = document.getElementById('edit-bulk-ingredients').value
        .trim()
        .split('\n')
        .map(parseIngredientLine)
        .filter(Boolean);

    const updatedInstructions = document.getElementById('edit-bulk-instructions').value
        .trim()
        .split('\n')
        .map(line => line.trim());

    const updatedRating = parseInt(document.getElementById('edit-recipe-rating').value, 10) || 0;

    // ✅ Get selected tags before saving
    const updatedTags = [...document.querySelectorAll('#edit-tags-container .tag.selected')].map(tag => tag.dataset.tag);

    const updatedRecipe = {
        ...recipes[recipeToEdit], // Retain existing properties
        name: document.getElementById('edit-recipe-name').value.trim(),
        time: document.getElementById('edit-recipe-time').value.trim(),
        glutenOption: document.getElementById('edit-gluten-option').value,
        mainCategory: document.getElementById('edit-main-category').value.trim(),
        subCategory: document.getElementById('edit-sub-category').value.trim(),
        tags: updatedTags, // ✅ Save updated tags
        ingredients: updatedIngredients,
        instructions: updatedInstructions,
        rating: isNaN(updatedRating) ? 0 : updatedRating,
        image: uploadedImage || recipes[recipeToEdit].image,
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

// ✅ Global function to handle tag selection in Edit Recipe modal
function setupTagSelection() {
    document.querySelectorAll('#edit-tags-container .tag').forEach(tag => {
        tag.addEventListener('click', function () {
            this.classList.toggle('selected'); // ✅ Toggle selection
            updateSelectedTagsDisplay();
        });
    });
}

// ✅ Function to update the displayed selected tags in real-time
function updateSelectedTagsDisplay() {
    const selectedTagsContainer = document.getElementById('edit-selected-tags');
    selectedTagsContainer.innerHTML = ''; // Clear previous selection

    document.querySelectorAll('#edit-tags-container .tag.selected').forEach(tag => {
        const selectedTag = document.createElement('span');
        selectedTag.className = 'selected-tag';
        selectedTag.textContent = tag.dataset.tag;
        selectedTag.dataset.tag = tag.dataset.tag;

        // ✅ Add click event to allow deselecting from the "Selected Tags" UI
        selectedTag.addEventListener('click', function () {
            selectedTag.remove(); // Remove from UI
            document.querySelector(`#edit-tags-container .tag[data-tag="${tag.dataset.tag}"]`).classList.remove('selected'); // ✅ Unselect tag
        });

        selectedTagsContainer.appendChild(selectedTag);
    });
}

// ✅ Ensure tag selection works in Edit Recipe modal
setupTagSelection();


// ✅ Ensure this runs when the page loads
document.addEventListener("DOMContentLoaded", setupTagSelection);


// ✅ Initialize tag selection inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    setupTagSelection('add-tags-container', 'selected-tags');
    setupTagSelection('edit-tags-container', 'edit-selected-tags');
});



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

document.addEventListener("DOMContentLoaded", () => {
    // ✅ Download Recipes Event
    document.getElementById("download-recipes").addEventListener("click", () => {
        const dataToDownload = {
            recipes: accounts[currentAccount]?.recipes || [],
            savedWeeks: accounts[currentAccount]?.savedWeeks || []
        };

        const dataJSON = JSON.stringify(dataToDownload, null, 2);
        const blob = new Blob([dataJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "recipes_and_weeks.json";
        link.click();

        URL.revokeObjectURL(url);
    });

    // ✅ Trigger Upload File Selection
    document.getElementById("upload-recipes-btn").addEventListener("click", () => {
        document.getElementById("upload-recipes").click();
    });

    // ✅ Handle File Upload
    document.getElementById("upload-recipes").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const uploadedData = JSON.parse(e.target.result);

                if (uploadedData.recipes && Array.isArray(uploadedData.recipes)) {
                    accounts[currentAccount].recipes = uploadedData.recipes;
                }
                if (uploadedData.savedWeeks && Array.isArray(uploadedData.savedWeeks)) {
                    accounts[currentAccount].savedWeeks = uploadedData.savedWeeks;
                }

                saveAccountData();
                displayRecipes();
                displaySavedWeeks();
                document.getElementById("upload-status").textContent = "Recipes and weeks uploaded successfully!";
            } catch (err) {
                console.error("Error parsing uploaded file:", err);
                document.getElementById("upload-status").textContent = "Invalid file format. Please upload a valid JSON file.";
            }
        };
        reader.readAsText(file);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const mealPlanGrid = document.getElementById("meal-plan-grid");
    const prevButton = document.getElementById("prev-day");
    const nextButton = document.getElementById("next-day");
    
    let currentIndex = 0;
    const days = document.querySelectorAll(".day-column");

    function updateButtons() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === days.length - 1;
    }

    function scrollMealPlan(direction) {
        currentIndex = Math.min(Math.max(currentIndex + direction, 0), days.length - 1);
        days[currentIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        updateButtons();
    }

    updateButtons();
    window.scrollMealPlan = scrollMealPlan;
});

// Global variable to store selected recipe index
let selectedRecipeIndex = null;

// Function to open the meal plan selection modal
function openMealPlanModal(index) {
    console.log("➡️ Opening Meal Plan Modal for:", recipes[index]?.name);

    // 🔄 Ensure the editing index is reset
    recipeToEdit = null; 
    console.log("🔄 Reset recipeToEdit to prevent modal conflicts");

    // 🔄 Reset meal plan selection index before setting a new one
    selectedRecipeIndex = null;
    selectedRecipeIndex = index;

    document.getElementById('meal-plan-modal').style.display = 'block';
}


// Function to close the modal
function closeMealPlanModal() {
    console.log("❌ Closing Meal Plan Modal");
    document.getElementById('meal-plan-modal').style.display = 'none';

    // 🔄 Reset selectedRecipeIndex when modal closes
    selectedRecipeIndex = null;
    console.log("🔄 Reset selectedRecipeIndex to null on modal close");
}

// Function to confirm selection and save to meal plan
function confirmMealPlanSelection() {
    console.log("✅ Confirming Meal Plan Selection. selectedRecipeIndex:", selectedRecipeIndex);
    if (selectedRecipeIndex === null) return;

    const day = document.getElementById('select-day').value;
    const meal = document.getElementById('select-meal').value;
    const recipe = recipes[selectedRecipeIndex];

    if (day && meal && recipe) {
        saveToMealPlan(day, meal, recipe);
        console.log("🛠 Recipe added to meal plan:", recipe.name);
        closeMealPlanModal();
        updateMealPlannerUI();
        displayShoppingList();
    }

    // **🔴 Reset selectedRecipeIndex after successful selection**
    selectedRecipeIndex = null;
    console.log("🔄 Reset selectedRecipeIndex to null after adding meal");
}



function updateMealPlannerUI() {
    Object.keys(accounts[currentAccount].mealPlan).forEach(day => {
        Object.keys(accounts[currentAccount].mealPlan[day]).forEach(meal => {
            const slot = document.querySelector(`.meal-slot[data-day="${day}"][data-meal="${meal}"] .meal-content`);
            if (slot) {
                const recipe = accounts[currentAccount].mealPlan[day][meal];
                slot.innerHTML = recipe 
                    ? `<div class="meal-item">
                        <h4>${recipe.name}</h4>
                        <button onclick="removeFromMealPlan('${day}', '${meal}')">Remove</button>
                    </div>` 
                    : ''; // If no recipe, clear content
            }
        });
    });
}




// Display recipes on page load
displayRecipes();

