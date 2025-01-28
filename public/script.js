import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.1/+esm';

// Set up Supabase connection
const supabaseUrl = 'https://qyicwvjokmrehsyzyogp.supabase.co'; // Replace with your actual Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aWN3dmpva21yZWhzeXp5b2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDg4MzAsImV4cCI6MjA1MzM4NDgzMH0.mGSCnp4GGa4ei-BsdFPzlxKdLRXPGzUzbeKsSokgblg';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addRecipeBtn = document.getElementById('addRecipeBtn');
const recipeLinkInput = document.getElementById('recipeLink');
const recipeList = document.getElementById('recipeList');

// Function to add recipe to Supabase (save link and image URL)
async function addRecipeToDatabase(recipeLink) {
    const recipeImageUrl = await extractImageFromUrl(recipeLink); // Extract the image URL from the recipe link

    // Insert both recipe URL and image URL into the database
    const { data, error } = await supabase
        .from('recipe_database') // Changed table name to recipe_database
        .insert([{ recipe_url: recipeLink, img_url: recipeImageUrl }]); // Updated image column to img_url

    if (error) {
        console.error('Error adding recipe to database:', error);
    } else {
        console.log('Recipe added successfully:', data);
    }
}

// Function to extract the image from the recipe URL
async function extractImageFromUrl(recipeLink) {
    try {
        const response = await fetch(recipeLink);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Extract the first image (You can customize to fetch multiple images or images of specific size)
        const img = doc.querySelector('img');
        return img ? img.src : 'assets/logo.png'; // Return the src of the first image or the fallback image
    } catch (error) {
        console.error('Error extracting image from URL:', error);
        return 'assets/logo.png'; // Fallback image in case of error
    }
}

// Add recipe event listener
addRecipeBtn.addEventListener('click', async function () {
    const recipeLink = recipeLinkInput.value.trim();
    if (recipeLink) {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.flexDirection = 'column';  // Stack elements vertically
        listItem.style.alignItems = 'center'; // Center elements horizontally
        listItem.style.marginBottom = '20px'; // Add some space between recipe items

        // Extract the image from the recipe link
        const recipeImageUrl = await extractImageFromUrl(recipeLink);

        const imgElement = document.createElement('img');
        imgElement.src = recipeImageUrl;
        imgElement.alt = "Recipe Image";
        imgElement.style.width = '120px'; // Resize the image to fit your UI
        imgElement.style.height = '120px'; // Resize the image to fit your UI
        imgElement.style.borderRadius = '8px'; // Add rounded corners
        imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add a subtle shadow
        imgElement.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

        // Add onError to ensure fallback image in case of failure
        imgElement.onerror = function () {
            imgElement.src = 'assets/logo.png'; // Fallback to logo.png
        };

        imgElement.addEventListener('mouseover', () => {
            imgElement.style.transform = 'scale(1.1)';
            imgElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
        });
        imgElement.addEventListener('mouseout', () => {
            imgElement.style.transform = 'scale(1)';
            imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });

        listItem.appendChild(imgElement); // Image goes first

        const recipeLinkElement = document.createElement('a');
        recipeLinkElement.href = recipeLink;
        recipeLinkElement.target = "_blank";
        recipeLinkElement.textContent = recipeLink;

        // Apply cool styles to the link element
        recipeLinkElement.style.fontFamily = 'Arial, sans-serif';
        recipeLinkElement.style.color = '#4CAF50';
        recipeLinkElement.style.fontSize = '16px';
        recipeLinkElement.style.textDecoration = 'none';
        recipeLinkElement.style.transition = 'all 0.3s ease';
        recipeLinkElement.addEventListener('mouseover', () => {
            recipeLinkElement.style.color = '#45a049';
            recipeLinkElement.style.transform = 'scale(1.05)';
        });
        recipeLinkElement.addEventListener('mouseout', () => {
            recipeLinkElement.style.color = '#4CAF50';
            recipeLinkElement.style.transform = 'scale(1)';
        });

        listItem.appendChild(recipeLinkElement); // Link goes second

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.padding = '8px 16px';
        removeBtn.style.marginTop = '10px'; // Add some margin to space out the button
        removeBtn.style.borderRadius = '4px';
        removeBtn.addEventListener('click', () => {
            removeRecipeFromDatabase(recipeLink);
            listItem.remove();
        });

        listItem.appendChild(removeBtn); // Button goes last
        recipeList.appendChild(listItem);

        await addRecipeToDatabase(recipeLink);

        recipeLinkInput.value = '';  // Clear the input after adding
    } else {
        alert('Please enter a valid recipe link!');
    }
});

// Function to remove recipe from Supabase
async function removeRecipeFromDatabase(recipeLink) {
    const { data, error } = await supabase
        .from('recipe_database') // Changed table name to recipe_database
        .delete()
        .eq('recipe_url', recipeLink);

    if (error) {
        console.error('Error removing recipe from database:', error);
    } else {
        console.log('Recipe removed successfully:', data);
    }
}

// Load existing recipes from Supabase
async function loadRecipes() {
    const { data, error } = await supabase
        .from('recipe_database') // Changed table name to recipe_database
        .select('*');  // Select all fields for future scalability

    if (error) {
        console.error('Error loading recipes from database:', error);
        return;
    }

    data.forEach((recipe) => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.flexDirection = 'column';  // Stack elements vertically
        listItem.style.alignItems = 'center'; // Center elements horizontally
        listItem.style.marginBottom = '20px'; // Add some space between recipe items

        const recipeLinkElement = document.createElement('a');
        recipeLinkElement.href = recipe.recipe_url;
        recipeLinkElement.target = "_blank";
        recipeLinkElement.textContent = recipe.recipe_url;

        // Apply cool styles to the link element
        recipeLinkElement.style.fontFamily = 'Arial, sans-serif';
        recipeLinkElement.style.color = '#4CAF50';
        recipeLinkElement.style.fontSize = '16px';
        recipeLinkElement.style.textDecoration = 'none';
        recipeLinkElement.style.transition = 'all 0.3s ease';
        recipeLinkElement.addEventListener('mouseover', () => {
            recipeLinkElement.style.color = '#45a049';
            recipeLinkElement.style.transform = 'scale(1.05)';
        });
        recipeLinkElement.addEventListener('mouseout', () => {
            recipeLinkElement.style.color = '#4CAF50';
            recipeLinkElement.style.transform = 'scale(1)';
        });

        listItem.appendChild(recipeLinkElement); // Link goes second

        // Check if there is an image URL stored for the recipe
        if (recipe.img_url) {  // Use img_url (updated column name)
            const imgElement = document.createElement('img');
            imgElement.src = recipe.img_url;  // Use the image URL from the database
            imgElement.alt = "Recipe Image";
            imgElement.style.width = '120px'; // Resize the image to fit your UI
            imgElement.style.height = '120px'; // Resize the image to fit your UI
            imgElement.style.borderRadius = '8px'; // Add rounded corners
            imgElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add a subtle shadow
            imgElement.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

            // Handle fallback if image fails to load
            imgElement.onerror = function () {
                imgElement.src = 'assets/logo.png'; // Fallback image
            };

            listItem.appendChild(imgElement); // Image goes first
        }

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.padding = '8px 16px';
        removeBtn.style.marginTop = '10px'; // Add some margin to space out the button
        removeBtn.style.borderRadius = '4px';
        removeBtn.addEventListener('click', () => {
            removeRecipeFromDatabase(recipe.recipe_url);
            listItem.remove();
        });

        listItem.appendChild(removeBtn); // Button goes last
        recipeList.appendChild(listItem);
    });
}

// Load recipes when the page loads
window.addEventListener('load', loadRecipes);
