// events.js - Contains all event definitions for the simulation

// Event pool array to store all events
const eventPool = [
    //Event 1: Master Death
    {
        id: "event_kill_master",
        description: "{master} walks into a landmine and dies.",
        type: "kill-master",
        targets: ["master"], // Needs one master as the target
        effect: (participants, master) => {
            master.status = "dead"; // Mark master as dead
            const servant = participants.find(p => p.type === "servant" && p.masterId === master.id);
            if (servant && !servant.hasIndependentAction) {
                servant.status = "dead"; // If the servant doesn't have Independent Action, they die too
            }
        }
    },
    // Event 2: Duel
    {
        id: "event_duel",
        description: "{servant1} fights with {servant2} to the death.",
        type: "duel",
        targets: ["servant", "servant"], // Needs two servants as the targets
        effect: (participants, servant1, servant2) => {
            const loser = Math.random() < 0.5 ? servant1 : servant2;
            loser.status = "dead"; // Randomly pick a servant to die
        }
    },
    // Add more events here as needed...
    {
        id: "event_betrayal",
        description: "{servant1} betrays {master}. The master is left defenseless and killed.",
        type: "betrayal",
        targets: ["servant", "master"],
        effect: (participants, servant1, master) => {
            if (servant1 && master) {
                servant1.status = "alive"; // Servant survives
                master.status = "dead"; // Master is dead
            }
        }
    },
    
];

// Export the eventPool so it can be used in other files
export { eventPool };
