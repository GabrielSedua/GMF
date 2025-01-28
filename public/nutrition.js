const APP_ID = "91f05c25";
const APP_KEY = "8b4e4a86945ebc5f0f14c8e3e6560b64";
const APP_URL = 'https://api.edamam.com/api/nutrition-details';

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("SearchItemNutrition");
const resultsContainer = document.getElementById("resultsContainer");

let mySearch = '';
let myNutrition = null;

const labelsOrder = [
    'Protein', 'Carbohydrates (net)', 'Carbohydrate, by difference', 'Total lipid (fat)', 'Fatty acids, total monounsaturated',
    'Fatty acids, total polyunsaturated', 'Fatty acids, total saturated', 'Fatty acids, total trans', 'Sugars, total including NLEA',
    'Cholesterol', 'Iron, Fe', 'Vitamin E (alpha-tocopherol)', 'Vitamin A, RAE', 'Vitamin B-6', 'Vitamin B-12',
    'Vitamin C, total ascorbic acid', 'Vitamin D (D2 + D3)', 'Vitamin K (phylloquinone)', 'Zinc, Zn', 'Magnesium, Mg',
    'Calcium, Ca', 'Fiber, total dietary', 'Folic acid', 'Folate, DFE', 'Folate, food', 'Potassium, K', 'Sodium, Na',
    'Niacin', 'Phosphorus, P', 'Riboflavin', 'Thiamin', 'Energy', 'Water'
];

// Function to fetch data from the API
const fetchData = async (ingr) => {
    resultsContainer.innerHTML = "Loading..."; // Show loading text
    const response = await fetch(`${APP_URL}?app_id=${APP_ID}&app_key=${APP_KEY}`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingr: ingr })
    });

    if (response.ok) {
        const data = await response.json();
        myNutrition = data;
        displayResults();
    } else {
        resultsContainer.innerHTML = "<p>Ooops! There was an error. Please check your ingredients.</p>";
    }
};

// Function to display results
const displayResults = () => {
    resultsContainer.innerHTML = ""; // Clear previous results

    if (myNutrition) {
        const caloriesDiv = document.createElement("p");
        caloriesDiv.textContent = `Calories: ${myNutrition.calories}`;
        resultsContainer.appendChild(caloriesDiv);

        labelsOrder.forEach((desiredLabel) => {
            const element = Object.values(myNutrition.totalNutrients).find(el => el.label === desiredLabel);
            if (!element) return; // Skip if label isn't found

            const { label, quantity, unit } = element;
            const itemDiv = document.createElement("div");
            itemDiv.className = (label === 'Protein' || label === 'Total lipid (fat)' || label === 'Carbohydrates (net)') ? "red item" : "black item";
            itemDiv.innerHTML = `<strong>${label}:</strong> ${quantity} ${unit}`;
            resultsContainer.appendChild(itemDiv);
        });
    }
};

// Event listener for form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    mySearch = searchInput.value;
    const ingr = mySearch.split(/[,,;,\n,\r]/); // Split input by different delimiters
    fetchData(ingr);
});
