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
window.onload = function() {
    console.log("Page fully loaded! Fetching Servant data...");
    fetchServantData();};
//now the code for the servant data:
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
            hasIndependentAction: false // Placeholder, since this isn't in basic_servant.json
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
            option.value = servant.id; // Use Servant ID
            option.textContent = servant.name; // Use Servant Name
            dropdown.appendChild(option);
        });
    });
}
// Call the function to fetch and process Servant data
fetchServantData();
//now the code for the servant randomizing
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
                image: servant.face
            }));
        } catch (error) {
            console.error("Failed to fetch Servants:", error);
            servantList = [];
        }
    }
    
    function findMatchingDropdownOption(dropdown, servantName) {
        for (let option of dropdown.options) {
            if (option.textContent.includes(servantName)) {
                return option.value;
            }
        }
        return ""; 
    }
    
    function randomizeServant(index) {
        if (servantList.length === 0) return;
        
        const randomServant = servantList[Math.floor(Math.random() * servantList.length)];
        const dropdown = servantDropdowns[index];
        
        if (dropdown) {
            const matchedValue = findMatchingDropdownOption(dropdown, randomServant.name);
            if (matchedValue) {
                dropdown.value = matchedValue;
            }
        }
        
        const servantImage = document.querySelectorAll(".servant-img")[index];
        if (servantImage) {
            servantImage.src = randomServant.image;
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

//the code to collect the participants data and start the simulation:
document.addEventListener("DOMContentLoaded", function () {
    // Function to gather all selected Masters and Servants
    function collectParticipants() {
        const participants = [];
        
        document.querySelectorAll(".master").forEach((masterContainer, index) => {
            const name = masterContainer.querySelector(".master-name").value || `Master ${index + 1}`;
            const gender = masterContainer.querySelector(".gender-select").value === "male";
            const picture = masterContainer.querySelector(".master-img").src;

            const masterContainers = document.querySelectorAll(".master");
console.log(`Found ${masterContainers.length} master containers`);

masterContainers.forEach((masterContainer, index) => {
    console.log(`Checking Master ${index + 1}:`, masterContainer);
});

            const servantDropdown = masterContainer.querySelector(".servant-select");
            const servantName = servantDropdown.options[servantDropdown.selectedIndex].textContent;
            if (!servantDropdown) {
                console.error(`❌ Servant dropdown missing in Master ${index + 1}`);
            } else {
                console.log(`✅ Servant dropdown found in Master ${index + 1}`);
            }

            console.log("Name Input:", nameInput);
            console.log("Picture Input:", pictureInput);
            console.log("Servant Dropdown:", servantDropdown);
            
            participants.push({
                name,
                gender,
                picture,
                status: "alive",
                type: "master",
                servant: servantName
            });

            // Find servant details
            const servantImg = document.querySelectorAll(".servant-img")[index].src;
            const servantHasIndependentAction = false; // Placeholder, replace with fetched data if available
            
            participants.push({
                name: servantName,
                picture: servantImg,
                status: "alive",
                type: "servant",
                master: name,
                independentAction: servantHasIndependentAction
            });
        });

        return participants;
    }
    
    // Save to localStorage and move to simulation page
    document.getElementById("simulation").addEventListener("click", function () {
        const participants = collectParticipants();
        localStorage.setItem("participants", JSON.stringify(participants));
        window.location.href = "simulation.html";
    });
});
//simulation button function:
function saveParticipantsAndStartSimulation() {
    const masters = document.querySelectorAll(".master");
    let participants = [];

    masters.forEach((master, index) => {
        const nameInput = master.querySelector(".name-input");
        const name = nameInput ? nameInput.value : `Master ${index + 1}`;
        const picture = master.querySelector(".master-img").src;
        const servantSelect = master.querySelector(".servant-select");
        const servant = servantSelect ? servantSelect.value : "Unknown";

        participants.push({
            name,
            picture,
            status: "alive",
            type: "master",
            servant
        });
    });

    // Debugging Step: Log before saving
    console.log("Saving participants:", participants);

    // Save to localStorage
    localStorage.setItem("participants", JSON.stringify(participants));

    // Debugging Step: Verify it saved correctly
    console.log("Saved to localStorage:", localStorage.getItem("participants"));

    // Redirect to simulation page
    window.location.href = "simulation.html";
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