const FoodItem = document.querySelector("#SearchItem");
const SearchBtn = document.querySelector("#SearchButton");
const ResultsDiv = document.querySelector(".Results");

// Number of recipes to fetch per request (can be adjusted)
const recipesPerPage = 100;  // Set this to a number greater than 10 (e.g., 20 or 30)

// Add event listener for the search button
SearchBtn.addEventListener('click', () => {
    console.log('Search button clicked');
    FetchApi();
});

// Asynchronous function to fetch data from API
async function FetchApi() {
    const SearchItem = FoodItem.value;
    if (SearchItem.trim() === '') {
        alert("Please enter a food item!");
        return;
    }

    console.log(SearchItem);
    const BaseUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${SearchItem}&app_id=fb2b7359&app_key=7ff614ea6be84cc44b122799650f6834&imageSize=SMALL&from=0&to=${recipesPerPage}`;

    try {
        const response = await fetch(BaseUrl);
        const data = await response.json();
        const result = data.hits;
        console.log(result);
        ShowCards(result);
    } catch (error) {
        console.error('Error fetching data: ', error);
        alert("Failed to fetch data. Please try again later.");
    }

    // Clear the input field after search
    FoodItem.value = '';
}

// Function to display cards with the fetched recipes
function ShowCards(resources) {
    let Output = '';

    if (resources.length === 0) {
        Output = `<p>No recipes found for your search.</p>`;
    } else {
        resources.forEach(resource => {
            Output += `
            <div class="food-item">
                <div class="imageHolder">
                    <img src="${resource.recipe.image}" alt="Recipe Image">
                </div>
                <div class="details">
                    <h2 class="label">Title: <span>${resource.recipe.label}</span></h2>
                    <h2 class="label">Dish Type: <span>${resource.recipe.dishType || 'N/A'}</span></h2>
                    <h2 class="label">Cuisine: <span>${resource.recipe.cuisineType || 'N/A'}</span></h2>
                    <h2 class="label">Calories: <span>${resource.recipe.calories.toFixed(2)}</span></h2>
                    <h2 class="label">Meal Type: <span>${resource.recipe.mealType || 'N/A'}</span></h2>
                    <h2 class="label">Diet Labels: <span>${resource.recipe.dietLabels.join(', ') || 'N/A'}</span></h2>
                    <button>
                        <a href="${resource.recipe.url}" target="_blank">View Recipe</a>
                    </button>
                </div>
            </div>
            `;
        });
    }

    ResultsDiv.innerHTML = Output;
}
