// scripts.js

// Initialize MCF entries
let mcfEntries = [];

// Current sort state
let currentSort = {
  column: null,      // 'well', 'static', or 'mcf'
  ascending: true    // true for ascending, false for descending
};

/**
 * Flow Coefficient Lookup Table based on Meter Size and Orifice Plate Size
 */
const flowCoefficientTable = {
  "2": {
    "0.250": 0.396,
    "0.375": 0.886,
    "0.500": 1.574,
    "0.625": 2.471,
    "0.750": 3.587,
    "0.875": 4.937,
    "1.000": 6.549
  },
  "3": {
    "0.250": 0.396,
    "0.375": 0.884,
    "0.500": 1.567,
    "0.625": 2.449,
    "0.750": 3.538,
    "0.875": 4.833,
    "1.000": 6.341
  },
  "4": {
    "0.250": 0.395,
    "0.375": 0.883,
    "0.500": 1.565,
    "0.625": 2.449,
    "0.750": 3.538,
    "0.875": 4.833,
    "1.000": 6.341
  }
};

/**
 * Initializes the application by loading existing MCF entries and setting up event listeners.
 */
function initializeApp() {
  loadMCFEntries();
  setupInputListeners();
}

/**
 * Loads MCF entries from localStorage and displays them.
 */
function loadMCFEntries() {
  const storedEntries = localStorage.getItem('mcfEntries');
  if (storedEntries) {
    try {
      mcfEntries = JSON.parse(storedEntries);
      displayMCFEntries();
    } catch (error) {
      console.error('Error parsing MCF entries from localStorage:', error);
    }
  }
}

/**
 * Sets up event listeners on input fields to trigger automatic MCF calculation.
 */
function setupInputListeners() {
  const staticPressureInput = document.getElementById("staticPressure");
  const differentialPressureInput = document.getElementById("differentialPressure");
  const meterSizeInput = document.getElementById("meterSize");
  const plateSizeInput = document.getElementById("plateSize");

  // Define the list of inputs to monitor
  const inputs = [staticPressureInput, differentialPressureInput, meterSizeInput, plateSizeInput];

  // Attach 'input' and 'change' event listeners to handle both text and select inputs
  inputs.forEach(input => {
    if (input) {
      input.addEventListener("input", handleInputChange);
      input.addEventListener("change", handleInputChange);
    }
  });
}

/**
 * Handles input changes by validating inputs and updating the MCF result.
 */
function handleInputChange() {
  // Attempt to calculate MCF
  const mcf = calculateMCF();

  if (mcf !== null) {
    // Valid inputs; resultDisplay has been updated by calculateMCF()
  } else {
    // Invalid or incomplete inputs; clear the resultDisplay
    const resultDisplay = document.getElementById("resultDisplay");
    if (resultDisplay) {
      resultDisplay.textContent = "";
    }
  }
}

/**
 * Extracts the well name (letters) from the input string.
 * Ignores any '#' characters.
 * @param {string} input - The well identifier input string.
 * @returns {string} The extracted well name.
 */
function extractWellName(input) {
  if (!input) return null;
  // Remove any '#' characters
  input = input.replace(/#/g, '');
  // Extract letters
  const nameMatch = input.match(/[A-Za-z]+/g);
  if (nameMatch) {
    return nameMatch.join(' ').trim();
  }
  return null;
}

/**
 * Extracts the well number (digits) from the input string.
 * @param {string} input - The well identifier input string.
 * @returns {string} The extracted well number.
 */
function extractWellNumber(input) {
  if (!input) return null;
  // Extract numbers
  const numberMatch = input.match(/\d+/g);
  if (numberMatch) {
    return numberMatch.join('').trim();
  }
  return null;
}

/**
 * Saves a new MCF entry based on user input from the calculator.
 */
function saveMCF() {
  // Retrieve input elements
  const wellIdentifierInput = document.getElementById("wellIdentifier");
  const staticPressureInput = document.getElementById("staticPressure");
  const differentialPressureInput = document.getElementById("differentialPressure");
  const meterSizeInput = document.getElementById("meterSize");
  const plateSizeInput = document.getElementById("plateSize");

  // Get and sanitize input values
  const wellIdentifier = wellIdentifierInput.value.trim();
  const staticPressure = staticPressureInput.value.trim();
  const differentialPressure = differentialPressureInput.value.trim();
  const meterSize = meterSizeInput.value;
  const plateSize = plateSizeInput.value;

  // Extract wellName and wellNumber from wellIdentifier
  const wellName = extractWellName(wellIdentifier) || "Well";
  const wellNumber = extractWellNumber(wellIdentifier) || "#";

  // Validate required fields
  if (!staticPressure || !differentialPressure || !meterSize || !plateSize) {
    alert("Please fill out all required fields before saving.");
    return;
  }

  // Calculate MCF
  const mcf = calculateMCF();
  if (mcf === null) {
    alert("Invalid input for pressure values or flow coefficient. Please enter valid numbers and select appropriate sizes.");
    return;
  }

  // Create a new entry object
  const entry = {
    wellName,
    wellNumber,
    staticPressure: parseFloat(staticPressure),
    differentialPressure: parseFloat(differentialPressure),
    meterSize,
    plateSize,
    mcf: Math.round(mcf),
    timestamp: new Date().toLocaleString()
  };

  // Save the new entry to localStorage
  mcfEntries.push(entry);
  localStorage.setItem('mcfEntries', JSON.stringify(mcfEntries));

  // Update the display and reset form inputs
  displayMCFEntries();
  clearInputs();

  // Clear specific fields as per original requirement
  differentialPressureInput.value = '';

  // Clear the resultDisplay after saving the entry
  const resultDisplay = document.getElementById("resultDisplay");
  if (resultDisplay) {
    resultDisplay.textContent = "";
  }
}

/**
 * Saves a new MCF entry based on manual input.
 */
function saveManualEntry() {
  // Retrieve input elements
  const manualWellIdentifierInput = document.getElementById("manualWellIdentifier");
  const manualStaticPressureInput = document.getElementById("manualStaticPressure");
  const manualMCFInput = document.getElementById("manualMCF");

  // Get and sanitize input values
  const wellIdentifier = manualWellIdentifierInput.value.trim();
  const staticPressure = manualStaticPressureInput.value.trim();
  const mcfValue = manualMCFInput.value.trim();

  // Extract wellName and wellNumber from wellIdentifier
  const wellName = extractWellName(wellIdentifier) || "Well";
  const wellNumber = extractWellNumber(wellIdentifier) || "#";

  // Validate required fields
  if (!wellIdentifier || !staticPressure || !mcfValue) {
    alert("Please fill out all required fields before saving.");
    return;
  }

  // Create a new entry object
  const entry = {
    wellName,
    wellNumber,
    staticPressure: parseFloat(staticPressure),
    differentialPressure: null,
    meterSize: null,
    plateSize: null,
    mcf: Math.round(parseFloat(mcfValue)),
    timestamp: new Date().toLocaleString()
  };

  // Save the new entry to localStorage
  mcfEntries.push(entry);
  localStorage.setItem('mcfEntries', JSON.stringify(mcfEntries));

  // Update the display and reset form inputs
  displayMCFEntries();
  closeManualEntry();
  clearManualInputs();
}

/**
 * Calculates the MCF based on user input values.
 * @returns {number|null} The calculated MCF or null if inputs are invalid.
 */
function calculateMCF() {
  const staticPressure = parseFloat(document.getElementById("staticPressure").value);
  const differentialPressure = parseFloat(document.getElementById("differentialPressure").value);
  const meterSize = document.getElementById("meterSize").value;
  const plateSize = document.getElementById("plateSize").value;

  // Constants for calculation
  const Patm = 14.7; // Atmospheric pressure (PSI)
  const Y = 1;        // Expansion factor (assumed to be 1)

  // Validate numerical inputs
  if (isNaN(staticPressure) || isNaN(differentialPressure) ||
      staticPressure <= 0 || differentialPressure <= 0) {
    return null;
  }

  // Validate meterSize and plateSize
  if (!meterSize || !plateSize) {
    return null;
  }

  // Ensure plateSize is less than meterSize
  const meterDiameter = parseFloat(meterSize);
  const plateDiameter = parseFloat(plateSize);
  if (plateDiameter >= meterDiameter) {
    return null;
  }

  // Retrieve Flow Coefficient (C) from the lookup table
  const flowCoefficients = flowCoefficientTable[meterSize];
  if (!flowCoefficients) {
    return null;
  }

  const C = flowCoefficients[plateSize];
  if (!C) {
    return null;
  }

  // Calculate Q using the formula: Q = C * Y * sqrt(DP * (P + Patm))
  const Q = C * Y * Math.sqrt(differentialPressure * (staticPressure + Patm));

  // Display the result in the designated div
  const resultDisplay = document.getElementById("resultDisplay");
  if (resultDisplay) {
    resultDisplay.textContent = `Result: ${Math.round(Q)} MCF/day`;
  }

  return Q;
}

/**
 * Displays all saved MCF entries in the table.
 */
function displayMCFEntries() {
  const mcfList = document.getElementById("mcfList");
  if (!mcfList) {
    return;
  }

  // Clear existing entries
  mcfList.innerHTML = "";

  // Populate the table with each entry
  mcfEntries.forEach((entry, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="py-2 px-4 border-t text-sm md:text-base">${entry.wellName} ${entry.wellNumber}</td>
      <td class="py-2 px-4 border-t text-sm md:text-base">${entry.staticPressure} PSI</td>
      <!-- Hide this cell on mobile -->
      <td class="py-2 px-4 border-t text-sm md:text-base hidden md:table-cell">${entry.differentialPressure !== null ? entry.differentialPressure + ' DP' : 'N/A'}</td>
      <td class="py-2 px-4 border-t text-sm md:text-base">${entry.mcf} MCF</td>
      <td class="py-2 px-4 border-t text-sm md:text-base">
        <button class="text-red-600 hover:text-red-800 transition flex items-center justify-center" onclick="deleteMCFEntry(${index})">
          <i class="fa fa-trash-o text-lg"></i>
          <span class="hidden md:inline ml-1">Delete</span>
        </button>
      </td>
    `;

    mcfList.appendChild(row);
  });
}

/**
 * Deletes a specific MCF entry based on its index.
 * @param {number} index - The index of the entry to delete.
 */
function deleteMCFEntry(index) {
  if (index < 0 || index >= mcfEntries.length) {
    return;
  }

  // Remove the entry from the array
  mcfEntries.splice(index, 1);

  // Update localStorage
  localStorage.setItem('mcfEntries', JSON.stringify(mcfEntries));

  // Refresh the displayed list
  displayMCFEntries();
}

/**
 * Clears specific form inputs after saving an entry.
 */
function clearInputs() {
  document.getElementById("wellIdentifier").value = "";
  document.getElementById("staticPressure").value = "";
  // document.getElementById("plateSize").value = ""; // Reset plate size to empty
  // document.getElementById("meterSize").selectedIndex = 0; // Reset meter size to first option

  // Clear the resultDisplay
  const resultDisplay = document.getElementById("resultDisplay");
  if (resultDisplay) {
    resultDisplay.textContent = "";
  }
}

/**
 * Clears inputs in the manual entry form.
 */
function clearManualInputs() {
  document.getElementById("manualWellIdentifier").value = "";
  document.getElementById("manualStaticPressure").value = "";
  document.getElementById("manualMCF").value = "";
}

/**
 * Opens the manual entry modal.
 */
function openManualEntry() {
  const modal = document.getElementById("manual-entry-modal");
  if (modal) {
    modal.style.display = "block";
  }
}

/**
 * Closes the manual entry modal.
 */
function closeManualEntry() {
  const modal = document.getElementById("manual-entry-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Sorts the MCF entries based on the specified column.
 * @param {string} column - The column to sort by ('well', 'static', 'mcf').
 */
function sortTable(column) {
  if (currentSort.column === column) {
    // If already sorting by this column, toggle the sort order
    currentSort.ascending = !currentSort.ascending;
  } else {
    // Otherwise, start sorting by this column in ascending order
    currentSort.column = column;
    currentSort.ascending = true;
  }

  // Perform the sort
  mcfEntries.sort((a, b) => {
    let valA, valB;

    switch(column) {
      case 'well':
        // Combine wellName and wellNumber for comparison
        valA = `${a.wellName} ${a.wellNumber}`.toLowerCase();
        valB = `${b.wellName} ${b.wellNumber}`.toLowerCase();
        break;
      case 'static':
        valA = a.staticPressure;
        valB = b.staticPressure;
        break;
      case 'mcf':
        valA = a.mcf;
        valB = b.mcf;
        break;
      default:
        return 0;
    }

    if (valA < valB) return currentSort.ascending ? -1 : 1;
    if (valA > valB) return currentSort.ascending ? 1 : -1;
    return 0;
  });

  // Update sort icons
  updateSortIcons();

  // Refresh the displayed list
  displayMCFEntries();
}

/**
 * Updates the sort icons based on the current sort state.
 */
function updateSortIcons() {
  // Reset all sort icons to default
  const sortColumns = ['well', 'static', 'mcf'];
  sortColumns.forEach(col => {
    const icon = document.getElementById(`sort-${col}`);
    if (icon) {
      icon.className = 'fa fa-sort text-sm ml-1'; // Default sort icon
    }
  });

  // Set the appropriate sort icon for the current sorted column
  if (currentSort.column) {
    const icon = document.getElementById(`sort-${currentSort.column}`);
    if (icon) {
      if (currentSort.ascending) {
        icon.className = 'fa fa-caret-up text-sm ml-1'; // Ascending
      } else {
        icon.className = 'fa fa-caret-down text-sm ml-1'; // Descending
      }
    }
  }
}

// Ensure all functions are accessible globally
window.saveMCF = saveMCF;
window.deleteMCFEntry = deleteMCFEntry;
window.openManualEntry = openManualEntry;
window.closeManualEntry = closeManualEntry;
window.saveManualEntry = saveManualEntry;
window.sortTable = sortTable; // Add sortTable to global scope

/**
 * Initializes the application when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", initializeApp);

// Hide the loading screen when the page has fully loaded
window.addEventListener('load', function() {
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
});
