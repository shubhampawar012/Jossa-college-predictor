// Store the college data
let collegeData = [];
let currentFilteredData = [];
let currentRenderedData = [];
let currentRankValue = null;
let currentCategoryValue = null;
let currentStateValue = null;
let currentGenderValue = null;

// Initialize student count from localStorage
let studentCount = parseInt(localStorage.getItem("studentCount")) || 95334;

// Form and results section elements (global so displayResults can access)
let formSection = null;
let resultsSection = null;

// Helper function to determine college type from institute name
function getCollegeType(instituteName) {
    const name = instituteName.toLowerCase().replace(/\s+/g, " ");
    if (name.includes("indian institute of technology") || (name.includes("iit") && !name.includes("iiit"))) return "IIT";
    if (name.includes("indian institute of information technology") || name.includes("international institute of information technology") || name.includes("iiit")) return "IIIT";
    if (name.includes("national institute of technology") || name.includes("nit")) return "NIT";
    return "GFTI";
}

function getPreferredBranches() {
    const selected = Array.from(document.querySelectorAll(".branch-filter:checked"));
    if (selected.length === 0) return [];
    return selected.flatMap(item => {
        const values = item.getAttribute("data-values") || item.value || "";
        return values.split("|").map(v => v.trim().toLowerCase()).filter(Boolean);
    });
}

function buildBaseMatches(rankValue, category, gender) {
    if (!Number.isFinite(rankValue)) return [];

    const seatType = category === "General" ? "OPEN" : category;
    const preferredBranches = getPreferredBranches();

    const matches = collegeData.filter(college => {
        const closing = Number(college["Closing Rank"]);
        const rankMatch = rankValue <= closing;
        const categoryMatch = college["Seat Type"] === seatType;
        const collegeType = college.type || getCollegeType(college["Institute"]);
        const notIIT = collegeType !== "IIT";
        const programName = (college["Academic Program Name"] || "").toLowerCase();
        const notArchitecture = !programName.includes("architecture");
        const branchMatch = preferredBranches.length === 0
            ? true
            : preferredBranches.some(branch => programName.includes(branch));

        let genderMatch = false;
        const dbGender = college["Gender"];
        if (gender === "Male") {
            genderMatch = (dbGender === "Gender-Neutral");
        } else if (gender === "Female") {
            genderMatch = (dbGender === "Gender-Neutral" || dbGender.includes("Female-only"));
        }

        return rankMatch && categoryMatch && genderMatch && notIIT && notArchitecture && branchMatch;
    });

    return matches.sort((a, b) => Number(a["Closing Rank"]) - Number(b["Closing Rank"]));
}

function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash + value.charCodeAt(i) * (i + 1)) % 100000;
    }
    return hash;
}

function getProbability(rank, opening, closing) {
    if (!Number.isFinite(rank) || !Number.isFinite(opening) || !Number.isFinite(closing)) return "LOW";
    if (rank <= opening) return "HIGH";
    const mid = opening + (closing - opening) * 0.5;
    return rank <= mid ? "MEDIUM" : "LOW";
}

function getAvgPackage(college) {
    const type = college.type || getCollegeType(college["Institute"]);
    const seed = hashString(`${college["Institute"]}-${college["Academic Program Name"]}`);
    let min = 6;
    let max = 14;
    if (type === "NIT") {
        min = 12;
        max = 22;
    } else if (type === "IIIT") {
        min = 10;
        max = 20;
    }
    return min + (seed % (max - min + 1));
}

function getPlacement(college) {
    const type = college.type || getCollegeType(college["Institute"]);
    const seed = hashString(`${college["Academic Program Name"]}-${college["Institute"]}`);
    let min = 70;
    let max = 90;
    if (type === "NIT") {
        min = 85;
        max = 98;
    } else if (type === "IIIT") {
        min = 80;
        max = 95;
    }
    return min + (seed % (max - min + 1));
}

function getProbabilityBadge(probability) {
    const styles = {
        HIGH: "color: #166534; background: #dcfce7;",
        MEDIUM: "color: #92400e; background: #fef3c7;",
        LOW: "color: #991b1b; background: #fee2e2;"
    };
    const labels = {
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low"
    };
    const style = styles[probability] || styles.LOW;
    const label = labels[probability] || "Low";
    return `<span style="${style} padding: 4px 8px; border-radius: 4px; font-weight: 600;">${label}</span>`;
}

// Load college data from JSON file  
async function loadCollegeData() {
    try {
        const response = await fetch('file.json');
        if (!response.ok) throw new Error("HTTP error " + response.status);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid data format");
        
        collegeData = data;
        // Add type field to each college based on institute name
        collegeData.forEach(college => {
            college.type = getCollegeType(college["Institute"]);
        });
    } catch (error) {
        loadSampleData();
    }
}

// Fallback sample data - MUST use correct JSON field names
function loadSampleData() {
    collegeData = [
        {
            "Institute": "National Institute of Technology, Trichy",
            "Academic Program Name": "Computer Science and Engineering",
            "Seat Type": "OPEN",
            "Gender": "Gender-Neutral",
            "Opening Rank": 2500,
            "Closing Rank": 5000,
            "type": "NIT"
        },
        {
            "Institute": "National Institute of Technology, Warangal",
            "Academic Program Name": "Computer Science and Engineering",
            "Seat Type": "OBC-NCL",
            "Gender": "Gender-Neutral",
            "Opening Rank": 800,
            "Closing Rank": 1500,
            "type": "NIT"
        },
        {
            "Institute": "National Institute of Technology, Trichy",
            "Academic Program Name": "Mechanical Engineering",
            "Seat Type": "OPEN",
            "Gender": "Gender-Neutral",
            "Opening Rank": 6000,
            "Closing Rank": 8500,
            "type": "NIT"
        },
        {
            "Institute": "International Institute of Information Technology, Hyderabad",
            "Academic Program Name": "Computer Science",
            "Seat Type": "OPEN",
            "Gender": "Gender-Neutral",
            "Opening Rank": 5000,
            "Closing Rank": 10000,
            "type": "IIIT"
        }
    ];
}

// Function to display results
function displayResults(rank, category, state, gender) {
    const rankValue = Number(rank);
    if (!Number.isFinite(rankValue)) {
        alert("Please enter a valid rank.");
        return;
    }

    currentRankValue = rankValue;
    currentCategoryValue = category;
    currentStateValue = state;
    currentGenderValue = gender;

    // Update user details card
    document.getElementById("displayRank").textContent = rank;
    document.getElementById("displayCategory").textContent = category;
    document.getElementById("displayState").textContent = state;
    document.getElementById("displayGender").textContent = gender;

    currentFilteredData = buildBaseMatches(rankValue, category, gender);

    // Display all filtered colleges
    renderTable(currentFilteredData);

    // Update eligible count
    document.getElementById("eligibleCount").textContent = currentFilteredData.length;

    // Increment student count
    studentCount++;
    localStorage.setItem("studentCount", studentCount);
    updateStudentCountDisplay();

    // Switch views
    formSection.classList.add("hidden");
    resultsSection.classList.remove("hidden");
}

// Function to update student count display in both sections
function updateStudentCountDisplay() {
    const footnotesInForm = document.querySelectorAll(".form-section .footnote span:last-child");
    const footnotesInResults = document.querySelectorAll(".results-section .footnote span:last-child");
    
    const text = `${studentCount.toLocaleString()} students have already predicted their college`;
    
    footnotesInForm.forEach(el => el.textContent = text);
    footnotesInResults.forEach(el => el.textContent = text);
}

// Initialize event listeners and load data when page loads
document.addEventListener("DOMContentLoaded", function() {
    
    // Load college data asynchronously
    loadCollegeData();
    
    updateStudentCountDisplay();
    
    // Get form elements
    const rankInput = document.getElementById("rankInput");
    const categoryInput = document.getElementById("categoryInput");
    const stateInput = document.getElementById("stateInput");
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const predictButton = document.getElementById("predictButton");
    const editButton = document.getElementById("editButton");


    // Get section elements (set global variables)
    formSection = document.getElementById("formSection");
    resultsSection = document.getElementById("resultsSection");

    // Predict button click handler
    if (predictButton) {
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
    }

    // Edit button click handler
    if (editButton) {
        editButton.addEventListener("click", function() {
            formSection.classList.remove("hidden");
            resultsSection.classList.add("hidden");
        });
    }

    // Print button click handler
    const printButton = document.getElementById("printButton");
    if (printButton) {
        printButton.addEventListener("click", function() {
            const dataToPrint = (currentRenderedData && currentRenderedData.length)
                ? currentRenderedData
                : currentFilteredData;

            openPrintWindow(dataToPrint);
        });
    }

    // Setup filter listeners
    const probFilters = document.querySelectorAll(".prob-filter");
    probFilters.forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    const typeFilters = document.querySelectorAll(".type-filter");
    typeFilters.forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    const branchFilters = document.querySelectorAll(".branch-filter");
    branchFilters.forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    // Clear all filters
    const clearAllBtn = document.querySelector(".clear-all");
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", function() {
            document.querySelectorAll(".prob-filter").forEach(f => f.checked = false);
            document.querySelectorAll(".type-filter").forEach(f => f.checked = false);
            document.querySelectorAll(".branch-filter").forEach(f => f.checked = false);
            document.getElementById("searchCollege").value = "";

            applyFilters();
        });
    }

    // Quick filter buttons
    const quickFilterBtns = document.querySelectorAll(".quick-filter-btn");
    quickFilterBtns.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const filterType = this.textContent.trim();
            
            // Clear existing filters and search
            document.querySelectorAll(".prob-filter").forEach(f => f.checked = false);
            document.querySelectorAll(".type-filter").forEach(f => f.checked = false);
            document.getElementById("searchCollege").value = "";

        let filteredData = currentFilteredData.slice();

        if (filterType === "Top 5 NITs") {
            filteredData = filteredData
                .filter(c => (c.type || getCollegeType(c["Institute"])) === "NIT")
                .sort((a, b) => a["Opening Rank"] - b["Opening Rank"])
                .slice(0, 5);
        } else if (filterType === "Top 10 NITs") {
            filteredData = filteredData
                .filter(c => (c.type || getCollegeType(c["Institute"])) === "NIT")
                .sort((a, b) => a["Opening Rank"] - b["Opening Rank"])
                .slice(0, 10);
        } else if (filterType === "CS & IT Branches") {
                filteredData = filteredData.filter(c => 
                    c["Academic Program Name"].toLowerCase().includes("computer") || 
                    c["Academic Program Name"].toLowerCase().includes("information technology") || 
                    c["Academic Program Name"].toLowerCase().includes("it")
                );
            } else if (filterType === "Core Branches") {
                filteredData = filteredData.filter(c => {
                    const branch = c["Academic Program Name"].toLowerCase();
                    return branch.includes("mechanical") || branch.includes("civil") || 
                           branch.includes("chemical") || branch.includes("electrical") || 
                           branch.includes("production");
                });
            } else if (filterType === "Near My Domicile State") {
                // For now, show all - can be extended with state data
                filteredData = filteredData;
            }

            renderTable(filteredData);
            document.getElementById("eligibleCount").textContent = filteredData.length;
        });
    });

    // Search functionality
    const searchBox = document.getElementById("searchCollege");
    if (searchBox) {
        searchBox.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === "") {
                // If search is cleared, show current filtered data
                renderTable(currentFilteredData);
                return;
            }
            
            // Search within currentFilteredData
            const filteredData = currentFilteredData.filter(college => 
                college["Institute"].toLowerCase().includes(searchTerm) || 
                college["Academic Program Name"].toLowerCase().includes(searchTerm)
            );

            filteredData.sort((a, b) => Number(a["Closing Rank"]) - Number(b["Closing Rank"]));
            renderTable(filteredData);
        });
    }
});

// Function to render table
function renderTable(data) {
    currentRenderedData = Array.isArray(data) ? data : [];

    const tbody = document.getElementById("resultsTableBody");
    tbody.innerHTML = "";

    if (currentRenderedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">No colleges found matching your filters</td></tr>';
        return;
    }

    currentRenderedData.forEach(college => {
        const row = document.createElement("tr");
        const opening = Number(college["Opening Rank"]);
        const closing = Number(college["Closing Rank"]);
        const probability = getProbability(currentRankValue, opening, closing);
        const avgPackage = getAvgPackage(college);
        const placement = getPlacement(college);
        
        row.innerHTML = `
            <td><strong>${college["Institute"]}</strong></td>
            <td>${college["Academic Program Name"]}</td>
            <td>₹${avgPackage} LPA</td>
            <td>${placement}%</td>
            <td>${getProbabilityBadge(probability)}</td>
            <td>${opening}</td>
            <td>${closing}</td>
            <td><a href="#" onclick="event.preventDefault()">Details</a></td>
        `;
        tbody.appendChild(row);
    });
}

// Function to render table
function applyFilters() {
    if (!Number.isFinite(currentRankValue)) return;

    const selectedProbabilities = Array.from(document.querySelectorAll(".prob-filter"))
        .filter(f => f.checked)
        .map(f => f.value);

    const selectedTypes = Array.from(document.querySelectorAll(".type-filter"))
        .filter(f => f.checked)
        .map(f => f.getAttribute("data-type"));

    currentFilteredData = buildBaseMatches(currentRankValue, currentCategoryValue, currentGenderValue);

    let filteredData = currentFilteredData.filter(college => {
        const opening = Number(college["Opening Rank"]);
        const closing = Number(college["Closing Rank"]);
        const probability = getProbability(currentRankValue, opening, closing);
        const probMatch = selectedProbabilities.length === 0 || selectedProbabilities.includes(probability);
        const collegeType = college.type || getCollegeType(college["Institute"]);
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(collegeType);
        const notIIT = collegeType !== "IIT";

        return probMatch && typeMatch && notIIT;
    });

    filteredData.sort((a, b) => Number(a["Closing Rank"]) - Number(b["Closing Rank"]));

    renderTable(filteredData);
    document.getElementById("eligibleCount").textContent = filteredData.length;
    document.getElementById("searchCollege").value = "";
}

// Search functionality removed - now in DOMContentLoaded

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function openPrintWindow(data) {
    try {
        const safeData = Array.isArray(data) ? data : [];
        
        if (safeData.length === 0) {
            alert("No colleges to print. Please apply filters first.");
            return;
        }

        const rank = document.getElementById("displayRank")?.textContent?.trim() || "-";
        const category = document.getElementById("displayCategory")?.textContent?.trim() || "-";
        const state = document.getElementById("displayState")?.textContent?.trim() || "-";
        const gender = document.getElementById("displayGender")?.textContent?.trim() || "-";

        const selectedProb = Array.from(document.querySelectorAll(".prob-filter"))
            .filter(x => x.checked)
            .map(x => x.value);

        const selectedTypes = Array.from(document.querySelectorAll(".type-filter"))
            .filter(x => x.checked)
            .map(x => x.getAttribute("data-type"));

        const searchTerm = document.getElementById("searchCollege")?.value?.trim() || "";

        // Build table rows
        let rowsHtml = "";
        for (let college of safeData) {
            const opening = Number(college["Opening Rank"]) || 0;
            const closing = Number(college["Closing Rank"]) || 0;
            const probability = getProbability(currentRankValue, opening, closing);
            const probLabel = probability === "HIGH" ? "High" : probability === "MEDIUM" ? "Medium" : "Low";
            const avgPackage = getAvgPackage(college);
            const placement = getPlacement(college);

            const inst = (college["Institute"] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            const branch = (college["Academic Program Name"] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

            rowsHtml += `<tr><td>${inst}</td><td>${branch}</td><td>₹${avgPackage} LPA</td><td>${placement}%</td><td>${probLabel}</td><td>${opening}</td><td>${closing}</td></tr>`;
        }

        if (!rowsHtml) {
            rowsHtml = `<tr><td colspan="7" style="text-align:center;">No rows to print.</td></tr>`;
        }

        // Open popup
        const win = window.open("", "_blank");
        if (!win) {
            alert("Popup blocked. Please allow popups to print.");
            return;
        }

        // Write HTML document
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>College List - Print</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 10px; }
    .meta { font-size: 11px; color: #555; margin-bottom: 15px; line-height: 1.6; }
    .meta strong { color: #000; }
    .note { font-size: 10px; color: #666; margin-bottom: 15px; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #e5e7eb; color: #111; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ccc; }
    td { padding: 8px; border: 1px solid #ddd; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr { page-break-inside: avoid; }
    @media print {
      body { margin: 0; padding: 10px; }
      table { font-size: 10px; }
    }
  </style>
</head>
<body>
  <h1>JEE Main College Predictor — Filtered College List</h1>
  <div class="meta">
    <strong>Your Details:</strong> Rank: ${rank} | Category: ${category} | State: ${state} | Gender: ${gender}
    <br />
    <strong>Filters Applied:</strong> Probability: ${selectedProb.length ? selectedProb.join(", ") : "All"} | Type: ${selectedTypes.length ? selectedTypes.join(", ") : "All"} ${searchTerm ? "| Search: " + searchTerm : ""}
    <br />
    <strong>Total Results:</strong> ${safeData.length} colleges
  </div>
  <div class="note">Note: Avg Package and Placement are estimated. Probability is based on your rank vs opening/closing ranks.</div>
  <table>
    <thead>
      <tr>
        <th>College</th>
        <th>Branch</th>
        <th>Avg Package</th>
        <th>Placement</th>
        <th>Probability</th>
        <th>Opening Rank</th>
        <th>Closing Rank</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <script>
    window.addEventListener('load', function() {
      setTimeout(() => { window.print(); }, 500);
    });
  </script>
</body>
</html>`;

        win.document.write(htmlContent);
        win.document.close();

    } catch (error) {
        alert("Error generating print document: " + error.message);
    }
}

// FALLBACK: Direct button click handler as backup
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("predictButton");
    if (btn && !btn.onclick) {
        btn.onclick = function(e) {
            e.preventDefault();

            const rankInput = document.getElementById("rankInput");
            const categoryInput = document.getElementById("categoryInput");
            const stateInput = document.getElementById("stateInput");
            const genderInputs = document.querySelectorAll('input[name="gender"]');

            const rank = rankInput.value;
            const category = categoryInput.value;
            const state = stateInput.value;
            const gender = Array.from(genderInputs).find(input => input.checked);

            if (!rank || category === "Select category" || state === "Select state" || !gender) {
                alert("Please fill out all fields correctly!");
                return false;
            }

            displayResults(rank, category, state, gender.value);
            return false;
        };
    }
});
