import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.1/+esm';

// Set up Supabase connection
const supabaseUrl = 'https://qyicwvjokmrehsyzyogp.supabase.co'; // Replace with your actual Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aWN3dmpva21yZWhzeXp5b2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDg4MzAsImV4cCI6MjA1MzM4NDgzMH0.mGSCnp4GGa4ei-BsdFPzlxKdLRXPGzUzbeKsSokgblg';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addRecipeBtn = document.getElementById('addRecipeBtnRight');
const recipeLinkInput = document.getElementById('recipeLinkRight');
const recipeList = document.getElementById('recipeListRight');

// Function to get the current logged-in user
async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user || null; // Return user if logged in, otherwise return null
}

// Function to add a recipe to the database
async function addRecipeToDatabase(recipeLink) {
    const user = await getUser();
    if (!user) return; // Exit if no user is logged in

    const recipeImageUrl = await extractImageFromUrl(recipeLink);
    const { error } = await supabase.from('recipes_data_user').insert([{
        recipe_url: recipeLink,
        img_url: recipeImageUrl,
        user_id: user.id
    }]);

    if (error) {
        console.error('Error adding recipe:', error);
    } else {
        loadRecipes(); // Refresh the list after adding
    }
}

// Function to remove a recipe from the database
async function removeRecipeFromDatabase(recipeLink) {
    const user = await getUser();
    if (!user) return; // Exit if no user is logged in

    const { error } = await supabase.from('recipes_data_user')
        .delete()
        .eq('recipe_url', recipeLink)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error removing recipe:', error);
    } else {
        loadRecipes(); // Refresh the list after removal
    }
}

// Function to load user's recipes from Supabase
async function loadRecipes() {
    const user = await getUser();
    if (!user) {
        recipeList.innerHTML = ''; // Clear list if no user is logged in
        return;
    }

    const { data, error } = await supabase
        .from('recipes_data_user')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error loading recipes:', error);
        return;
    }

    // Clear existing list
    recipeList.innerHTML = '';

    // Display user's recipes
    data.forEach((recipe) => {
        const listItem = document.createElement('li');
        listItem.style.listStyleType = 'none';
        listItem.style.display = 'flex';
        listItem.style.flexDirection = 'column';
        listItem.style.alignItems = 'center';
        listItem.style.marginBottom = '20px';

        // Recipe Image
        const imgElement = document.createElement('img');
        imgElement.src = recipe.img_url || 'assets/logo.png';
        imgElement.alt = "Recipe Image";
        imgElement.style.width = '120px';
        imgElement.style.height = '120px';
        imgElement.style.borderRadius = '8px';
        imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        imgElement.onerror = () => { imgElement.src = 'assets/logo.png'; };
        listItem.appendChild(imgElement);

        // Recipe Link
        const recipeLinkElement = document.createElement('a');
        recipeLinkElement.href = recipe.recipe_url;
        recipeLinkElement.target = "_blank";
        recipeLinkElement.textContent = recipe.recipe_url;
        recipeLinkElement.style.color = '#4CAF50';
        recipeLinkElement.style.textDecoration = 'none';
        listItem.appendChild(recipeLinkElement);

        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.padding = '8px 16px';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.addEventListener('click', () => {
            removeRecipeFromDatabase(recipe.recipe_url);
        });

        listItem.appendChild(removeBtn);
        recipeList.appendChild(listItem);
    });
}

// Function to extract an image from the recipe URL
async function extractImageFromUrl(recipeLink) {
    try {
        const response = await fetch(recipeLink);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const img = doc.querySelector('img');
        return img ? img.src : null;
    } catch (error) {
        console.error('Error extracting image:', error);
        return null;
    }
}

// Event listener for adding a recipe
addRecipeBtn.addEventListener('click', async function () {
    const recipeLink = recipeLinkInput.value.trim();
    if (!recipeLink) return;

    await addRecipeToDatabase(recipeLink);
    recipeLinkInput.value = ''; // Clear input after adding
});

// Load recipes when the page loads
window.addEventListener('load', loadRecipes);
