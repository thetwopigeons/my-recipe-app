// Array to store recipes
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
let weeklyRecipes = JSON.parse(localStorage.getItem('weeklyRecipes')) || []; // Load weekly recipes from localStorage
let recipeToEdit = null; // Store the recipe being edited

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
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
    let currentIngredient = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') return;

        // Updated regex to handle cases like "1/2 onion" or "1 onion"
        const match = trimmedLine.match(/^(\d+(?:\/\d+)?(?:\s\d+\/\d+)?)?\s*(tsp|tbsp|g|kg|ml|l|pieces|sticks|cloves|sprigs|cans|cups|teaspoons|tablespoons|stick|whole|half|quarter)?\s*(.+)?$/i);

        if (match) {
            const [, quantity, unit, name] = match;

            // Handle cases where no unit is specified
            let correctedUnit = unit || "whole";
            let correctedName = name || "";

            if (["whole", "half", "quarter"].includes(correctedUnit.toLowerCase())) {
                correctedName = name || correctedUnit;
                correctedUnit = ""; // Remove the unit for items like "1 onion"
            }

            const parsedQuantity = quantity ? parseFraction(quantity) : 1;

            currentIngredient = {
                quantity: parsedQuantity,
                unit: correctedUnit,
                name: correctedName.trim(),
            };

            ingredients.push(currentIngredient);
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

    this.reset();
    tempIngredients = [];
    tempInstructions = [];
    uploadedImage = null;
    document.getElementById('image-preview').style.display = 'none';
    updateIngredientList();
    updateInstructionList();
});

// Display recipes grouped by categories
function displayRecipes() {
    const accordion = document.getElementById("accordion");
    accordion.innerHTML = ""; // Clear existing content

    const groupedRecipes = recipes.reduce((groups, recipe) => {
        const groupKey = recipe.mainCategory || "Uncategorized";
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(recipe);
        return groups;
    }, {});

    Object.keys(groupedRecipes).forEach((category) => {
        const groupRecipes = groupedRecipes[category];

        // Create the accordion button
        const button = document.createElement("button");
        button.className = "accordion-button";
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
            const recipeIndex = recipes.indexOf(recipe); // Ensure correct indexing
            const card = document.createElement("div");
            card.className = "recipe-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("data-recipe-index", recipeIndex);
            card.addEventListener("dragstart", handleDragStart);
            card.addEventListener("dragend", handleDragEnd);

            // Generate star rating dynamically
            const rating = recipe.rating || 0; // Default to 0 if undefined
            const filledStars = "⭐".repeat(rating);
            const emptyStars = "⭐".repeat(5 - rating).replace(/⭐/g, "☆");

            // Recipe card content
            card.innerHTML = `
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-img">` : ""}
                <h4>${recipe.name}</h4>
                <p>${recipe.time}, ${recipe.glutenOption}</p>
                <p>${recipe.subCategory}</p>
                <p class="stars">${filledStars}${emptyStars}</p>
                <div class="button-group">
                    <button onclick="addToWeeklyList(${recipeIndex})" class="add">Add</button>
                    <button onclick="editRecipe(${recipeIndex})" class="edit">Edit</button>
                    <button onclick="deleteRecipe(${recipeIndex})" class="delete">Delete</button>
                    <button onclick="copyRecipe(${recipeIndex})" class="copy">Copy</button>
                </div>
            `;

            content.appendChild(card);
        });

        // Append button and content to the accordion
        accordion.appendChild(button);
        accordion.appendChild(content);
    });
}


function handleDragStart(event) {
    const index = event.target.dataset.recipeIndex;
    event.dataTransfer.setData("text/plain", index);
    event.target.style.opacity = "0.5"; // Visual feedback
}

function handleDragEnd(event) {
    event.target.style.opacity = ""; // Reset opacity after dragging
}

const dropZone = document.getElementById("weekly-dropzone");

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = "#f0f0f0"; // Visual feedback
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.backgroundColor = ""; // Reset background color
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = ""; // Reset background color

    const index = event.dataTransfer.getData("text/plain");
    addToWeeklyList(index);
});


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
    const weeklyTabs = document.getElementById('weekly-tabs');
    const weeklyDetails = document.getElementById('weekly-details');

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
        tab.style.cursor = 'pointer';
        tab.style.border = '1px solid #ccc';
        tab.style.backgroundColor = '#f9f9f9';
        tab.onclick = () => showWeeklyRecipeDetails(index);
        tabContainer.appendChild(tab);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.style.padding = '5px 10px';
        removeButton.style.backgroundColor = 'red';
        removeButton.style.color = 'white';
        removeButton.style.border = 'none';
        removeButton.style.cursor = 'pointer';
        removeButton.onclick = () => removeFromWeeklyList(index);
        tabContainer.appendChild(removeButton);

        weeklyTabs.appendChild(tabContainer);
    });

    // Display the first recipe's details by default
    if (weeklyRecipes.length > 0) {
        showWeeklyRecipeDetails(0);
    }
}

function removeFromWeeklyList(index) {
    if (confirm(`Are you sure you want to remove "${weeklyRecipes[index].name}" from the weekly list?`)) {
        weeklyRecipes.splice(index, 1); // Remove the recipe
        saveWeeklyRecipes(); // Save the updated list to localStorage
        displayWeeklyRecipes();
        displayShoppingList(); // Update the shopping list
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
    const totals = {};

    weeklyRecipes.forEach(recipe => {
        recipe.ingredients.forEach(({ name, quantity, unit }) => {
            const key = `${name}-${unit}`;
            if (!totals[key]) {
                totals[key] = { name, quantity: 0, unit };
            }
            totals[key].quantity += quantity;
        });
    });

    const shoppingList = document.getElementById('shopping-list');
    shoppingList.innerHTML = `
        <h3>Shopping List</h3>
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

// Toggle Add New Recipe section
document.getElementById('toggle-add-recipe').addEventListener('click', function () {
    const addRecipeSection = document.getElementById('add-recipe');
    if (addRecipeSection.style.display === 'none') {
        addRecipeSection.style.display = 'block';
        this.textContent = 'Hide Add Recipe';
    } else {
        addRecipeSection.style.display = 'none';
        this.textContent = 'Add New Recipe';
    }
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

// Function to save the weekly list to localStorage
function saveWeeklyRecipes() {
    localStorage.setItem('weeklyRecipes', JSON.stringify(weeklyRecipes));
}

// Load weekly list on page load
document.addEventListener('DOMContentLoaded', function () {
    displayWeeklyRecipes(); // Load and display the weekly list
    displayShoppingList(); // Display the shopping list
});

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

document.getElementById('randomize-button').addEventListener('click', randomizeWeeklyRecipes);

// Display recipes on page load
displayRecipes();
