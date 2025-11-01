let participants = [];
import { events } from './events.js';
console.log("Checking if .master elements exist...");
console.log(document.querySelectorAll(".master"));
document.addEventListener("DOMContentLoaded", () => {
    console.log("Checking all master-picture inputs...");
console.log(document.querySelectorAll(".master-picture"));
console.log("Checking all master image elements...");
console.log(document.querySelectorAll(".master-img"));
    document.querySelectorAll(".master").forEach((masterContainer, index) => {
        const inputField = masterContainer.querySelector(".master-picture");
        const imageElement = masterContainer.querySelector(".master-img");

        console.log(`Initializing Master ${index + 1}`);

        if (!inputField || !imageElement) {
            console.error(`Master container ${index + 1} is missing required elements.`);
            return;
        }

        inputField.addEventListener("input", () => {
            const imageUrl = inputField.value.trim();
            console.log(`Master ${index + 1} input detected: ${imageUrl}`);

            if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                imageElement.src = imageUrl;
                console.log(`Master ${index + 1} image updated to: ${imageUrl}`);
            } else {
                console.warn(`Master ${index + 1} invalid URL: ${imageUrl}`);
            }
        });
    });
}); //this was the code for updating the master pictures
document.addEventListener("DOMContentLoaded", () => {
    if (typeof runDayEvents === "function") {
        runDayEvents();
    } else {
        console.error("runDayEvents() is not defined yet.");
    }
});
// now the code for the servant data:
async function fetchServantData() {
    const url = 'https://api.atlasacademy.io/export/NA/basic_servant.json';

    try {
        console.log("Fetching Servant List...");
        const response = await fetch(url);
        const servantsList = await response.json();

        if (!Array.isArray(servantsList)) {
            console.error("Invalid response: Expected an array but got", servantsList);
            return;
        }

        console.log("Servants List Fetched:", servantsList);

        // Prepare an array to store only necessary data
        const servantDataArray = servantsList.map(servant => ({
            id: servant.id,
            name: servant.name,
            image: servant.face,  // This contains their default portrait
            hasIndependentAction: servant.hasIndependentAction || false
        }));

        console.log("Final Servant Data Array:", servantDataArray);
        populateServantDropdown(servantDataArray);
    } catch (error) {
        console.error("Error fetching Servant data:", error);
    }
}

// Example function to populate a dropdown with Servant names
function populateServantDropdown(servantDataArray) {
    // Select ALL servant dropdowns using the class
    document.querySelectorAll(".servant-select").forEach((dropdown) => {
        // Clear existing options except the default "Choose a Servant"
        dropdown.innerHTML = '<option value="">Choose a Servant</option>';
        
        // Add each Servant to the dropdown
        servantDataArray.forEach(servant => {
            const option = document.createElement("option");
            option.textContent = servant.name;  // full display name for user
            option.dataset.id = servant.id;  // store numeric ID if needed later
            option.dataset.image = servant.image; // get the servantimage
            dropdown.appendChild(option);  // <-- fix here
        });
    });
}


// Call the function to fetch and process Servant data
fetchServantData();

// now the code for the servant randomizing
document.addEventListener("DOMContentLoaded", function () {
    const servantDropdowns = document.querySelectorAll(".servant-select");
    const randomizeButtons = document.querySelectorAll(".randomize-servant");
    let servantList = [];
    
    async function fetchServantList() {
        const url = "https://api.atlasacademy.io/export/NA/basic_servant.json";
        try {
            const response = await fetch(url);
            const servants = await response.json();
            servantList = servants.map(servant => ({
                id: servant.id,
                name: servant.name,
                image: servant.image
            }));
        } catch (error) {
            console.error("Failed to fetch Servants:", error);
            servantList = [];
        }
    }
    
    function findMatchingDropdownOption(dropdown, servantName) {
        for (let option of dropdown.options) {
            // Use trim() to remove any leading/trailing spaces
            if (option.textContent.trim() === servantName.trim()) {
                return option.value; // Return the ID of the matched servant
            }
        }
        return ""; // Return empty if no match is found
    }
    
    
function randomizeServant(index) {
    if (servantList.length === 0) return;
    
    const randomServant = servantList[Math.floor(Math.random() * servantList.length)];
    const dropdown = servantDropdowns[index];
    
    if (dropdown) {
        const matchedValue = findMatchingDropdownOption(dropdown, randomServant.name);
        if (matchedValue) {
            dropdown.value = matchedValue; // Set the dropdown value to the matched servant ID
            dropdown.selectedIndex = [...dropdown.options].findIndex(opt => opt.value === matchedValue);
        } else {
            console.warn(`Servant with name ${randomServant.name} not found in dropdown options.`);
        }
    }
    

}

    
    fetchServantList().then(() => {
        randomizeButtons.forEach((button, index) => {
            button.addEventListener("click", function () {
                randomizeServant(index);
            });
        });
    });
});

    
//simulation button function:
function saveParticipantsAndStartSimulation() {
    let teamContainers = document.querySelectorAll(".form-container");
    participants = [];

    teamContainers.forEach((teamContainer, index) => {
        let masterContainer = teamContainer.querySelector(".master");
        let servantContainer = teamContainer.querySelector(".servant-selection");

        let nameInput = masterContainer.querySelector(".master-name");
        let genderSelect = masterContainer.querySelector(".gender-select");
        let pictureEl = masterContainer.querySelector(".master-img");

        let name = nameInput ? nameInput.value.trim() || `Master ${index + 1}` : `Master ${index + 1}`;
        let gender = genderSelect ? genderSelect.value : "nonbinary"; // fallback to nonbinary if missing
        let pronouns = getPronouns(gender);
        let servantHasIndependentAction = false; // default unless set elsewhere
        let pictureUrl = pictureEl ? pictureEl.src : "";

        let servantDropdown = servantContainer ? servantContainer.querySelector(".servant-select") : null;

        let servantId = "Unknown";
        let servantName = "Unknown";
        let servantImage;

        if (servantDropdown) {
            const selectedIndex = servantDropdown.selectedIndex;
            const selectedOption = servantDropdown.options[selectedIndex];

            if (selectedOption) {
                servantId = selectedOption.dataset.id || "Unknown";  // numeric ID if needed
                servantName = selectedOption.value || "Unknown";  // shortname the simulator expects


                console.log(`Team ${index + 1} - Selected Servant: id=${servantId}, name=${servantName}`);
            } else {
                console.warn(`Team ${index + 1} - No selected option in servant dropdown`);
            }
        } else {
            console.warn(`Team ${index + 1} - No servant dropdown found`);
        }

        let masterData = {
            id: `master${index + 1}`,
            name: name,
            gender: gender,
            pronouns: pronouns,
            picture: pictureUrl,
            status: "alive",
            type: "master",
            servantId: servantId,
        
        };

        let servantData = {
            id: servantId,
            name: servantName,
            type: "servant",
            status: "alive",
            masterId: masterData.id,
            hasIndependentAction: servantHasIndependentAction,
            image: servantImage //don't gd touch this if servant images work
        };

        participants.push(masterData);
        participants.push(servantData);
    });

    console.log("Saved participants:", participants);
    localStorage.setItem("participants", JSON.stringify(participants));

    window.location.href = "simulation.html";
}

function getPronouns(gender) {
    if (gender === "male") {
        return { subject: "he", object: "him", possessive: "his" };
    } else if (gender === "female") {
        return { subject: "she", object: "her", possessive: "her" };
    } else {
        return { subject: "they", object: "them", possessive: "their" };
    }
}

//code to attach the above function to the button:
document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("simulation");

    if (startButton) {
        startButton.addEventListener("click", saveParticipantsAndStartSimulation);
    } else {
        console.error("Start Simulation button not found!");
    }
});
// ----------------------------
//  Run Daily Events
// ----------------------------
function runDayEvents() {
    console.log("===== DAY 1 =====");
    if (!participants || participants.length === 0) {
    participants = JSON.parse(localStorage.getItem("participants")) || [];
}

    const aliveMasters = participants.filter(p => p.type === "master" && p.status === "alive");

    if (aliveMasters.length === 0) {
        console.log("No masters remain alive. Simulation ends.");
        return;
    }

    // Example Day 1 event
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const targetMaster = aliveMasters[Math.floor(Math.random() * aliveMasters.length)];

    if (randomEvent && targetMaster) {
        const description = randomEvent.description.replace("{master}", targetMaster.name);
       
        console.log(description);

        // Apply event effect if defined
        if (typeof randomEvent.effects === "function") {
            randomEvent.effects(participants, targetMaster);
        }
    }
}

