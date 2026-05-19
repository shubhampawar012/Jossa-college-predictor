// Sample college data for demonstration
const collegeData = [
    {
        college: "National Institute of Technology, Trichy",
        branch: "Instrumentation and Control Engineering",
        avgPackage: "18.46 LPA",
        placement: "86.70%",
        probability: "HIGH",
        openingRank: 4914,
        closingRank: 9740,
        type: "NIT"
    },
    {
        college: "National Institute of Technology, Trichy",
        branch: "Mechanical Engineering",
        avgPackage: "13.55 LPA",
        placement: "N/A",
        probability: "HIGH",
        openingRank: 6356,
        closingRank: 8394,
        type: "NIT"
    },
    {
        college: "National Institute of Technology, Trichy",
        branch: "Civil Engineering",
        avgPackage: "12.9 LPA",
        placement: "79.8%",
        probability: "HIGH",
        openingRank: 9248,
        closingRank: 12462,
        type: "NIT"
    },
    {
        college: "National Institute of Technology, Trichy",
        branch: "Chemical Engineering",
        avgPackage: "12.54 LPA",
        placement: "92.60%",
        probability: "HIGH",
        openingRank: 4829,
        closingRank: 8536,
        type: "NIT"
    },
    {
        college: "National Institute of Technology, Trichy",
        branch: "Metallurgical and Materials Engineering",
        avgPackage: "13.58 LPA",
        placement: "N/A",
        probability: "HIGH",
        openingRank: 11622,
        closingRank: 12343,
        type: "NIT"
    },
    {
        college: "National Institute of Technology, Trichy",
        branch: "Production Engineering",
        avgPackage: "-",
        placement: "N/A",
        probability: "HIGH",
        openingRank: 12483,
        closingRank: 13429,
        type: "NIT"
    },
    {
        college: "National Institute of Technology Karnataka, Surathkal",
        branch: "Electrical and Electronics Engineering",
        avgPackage: "13.7 LPA",
        placement: "96.43%",
        probability: "HIGH",
        openingRank: 5068,
        closingRank: 5773,
        type: "NIT"
    },
    {
        college: "National Institute of Technology Karnataka, Surathkal",
        branch: "Mechanical Engineering",
        avgPackage: "12.57 LPA",
        placement: "90%",
        probability: "HIGH",
        openingRank: 7446,
        closingRank: 9529,
        type: "NIT"
    },
    {
        college: "National Institute of Technology Karnataka, Surathkal",
        branch: "Civil Engineering",
        avgPackage: "8.12 LPA",
        placement: "N/A",
        probability: "HIGH",
        openingRank: 10703,
        closingRank: 14700,
        type: "NIT"
    },
    {
        college: "Indian Institute of Information Technology, Allahabad",
        branch: "Computer Science and Engineering",
        avgPackage: "14.2 LPA",
        placement: "94.5%",
        probability: "MEDIUM",
        openingRank: 3500,
        closingRank: 6200,
        type: "IIIT"
    }
];

// Get form elements
const rankInput = document.getElementById("rankInput");
const categoryInput = document.getElementById("categoryInput");
const stateInput = document.getElementById("stateInput");
const genderInputs = document.querySelectorAll('input[name="gender"]');
const predictButton = document.getElementById("predictButton");
const editButton = document.getElementById("editButton");

// Get section elements
const formSection = document.getElementById("formSection");
const resultsSection = document.getElementById("resultsSection");

// Predict button click handler
predictButton.addEventListener("click", function() {
    // Validation
    const rank = rankInput.value;
    const category = categoryInput.value;
    const state = stateInput.value;
    const gender = Array.from(genderInputs).find(input => input.checked);

    if (!rank || category === "Select category" || state === "Select state" || !gender) {
        alert("Please fill out all fields correctly!");
        return;
    }

    // Display results
    displayResults(rank, category, state, gender.value);
});

// Edit button click handler
editButton.addEventListener("click", function() {
    formSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
});

// Function to display results
function displayResults(rank, category, state, gender) {
    // Update user details card
    document.getElementById("displayRank").textContent = rank;
    document.getElementById("displayCategory").textContent = category;
    document.getElementById("displayState").textContent = state;
    document.getElementById("displayGender").textContent = gender;

    // Filter colleges based on rank
    const filteredData = collegeData.filter(college => rank <= college.closingRank);

    // Generate table rows
    const tbody = document.getElementById("resultsTableBody");
    tbody.innerHTML = "";

    filteredData.forEach(college => {
        const row = document.createElement("tr");
        const probClass = `probability-${college.probability.toLowerCase()}`;
        
        row.innerHTML = `
            <td><strong>${college.college}</strong></td>
            <td>${college.branch}</td>
            <td>${college.avgPackage}</td>
            <td>${college.placement}</td>
            <td><span class="${probClass}">${college.probability}</span></td>
            <td>${college.openingRank}</td>
            <td>${college.closingRank}</td>
            <td><a href="#" onclick="event.preventDefault()">Round-wise Details</a></td>
        `;
        tbody.appendChild(row);
    });

    // Update eligible count
    document.getElementById("eligibleCount").textContent = filteredData.length;

    // Switch views
    formSection.classList.add("hidden");
    resultsSection.classList.remove("hidden");
}

// Quick filter buttons
const quickFilterBtns = document.querySelectorAll(".quick-filter-btn");
quickFilterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
        const filterType = this.textContent.trim();
        // Implement filter logic based on filterType
        console.log("Filter applied:", filterType);
    });
});

// Search functionality
const searchBox = document.getElementById("searchCollege");
searchBox.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#resultsTableBody tr");
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
});

// Probability filter
const probFilters = document.querySelectorAll(".prob-filter");
probFilters.forEach(filter => {
    filter.addEventListener("change", applyFilters);
});

// Type filter
const typeFilters = document.querySelectorAll(".type-filter");
typeFilters.forEach(filter => {
    filter.addEventListener("change", applyFilters);
});

function applyFilters() {
    // Implement filter logic
    console.log("Filters applied");
}

// Clear all filters
const clearAllBtn = document.querySelector(".clear-all");
clearAllBtn.addEventListener("click", function() {
    probFilters.forEach(f => f.checked = false);
    typeFilters.forEach(f => f.checked = false);
});
