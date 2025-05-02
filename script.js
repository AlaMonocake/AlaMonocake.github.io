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
            option.textContent = servant.name;
            option.dataset.name = servant.name;
            dropdown.appendChild(option);  // <-- fixed here
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

    
    
//simulation button function:
function saveParticipantsAndStartSimulation() {
    let masterContainers = document.querySelectorAll(".master");
    let participants = [];

    masterContainers.forEach((masterContainer, index) => {
        let nameInput = masterContainer.querySelector(".master-name");
        let servantDropdown = masterContainer.querySelector(".servant-select");
    
        // Get the master name, fallback to default "Master X" if not provided
        let name = nameInput ? nameInput.value || `Master ${index + 1}` : `Master ${index + 1}`;
    
        // Get the displayed image's src URL
        let pictureUrl = masterContainer.querySelector(".master-img").src;
    
        // Ensure servantDropdown exists and get the selected servant's ID and name
        let servantId = "Unknown"; // Default value
        let servantName = "Unknown"; // Default value
    
        if (servantDropdown) {
            servantId = servantDropdown.value || "Unknown";  // Get servant ID from dropdown value
            // Get the servant's name from the selected option's data-name attribute
            let selectedOption = servantDropdown.options[servantDropdown.selectedIndex];
            servantName = selectedOption ? selectedOption.dataset.name || "Unknown" : "Unknown";
        }
    
        // Prepare the master data object
        let masterData = {
            name: name,
            picture: pictureUrl,
            status: "alive",
        type: "master",
        servantId: servantId,  // Store the servant's ID
        servantName: servantName // Store the servant's name
    };

        participants.push(masterData);
    });

    console.log("Saved participants:", participants);
    localStorage.setItem("participants", JSON.stringify(participants));

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