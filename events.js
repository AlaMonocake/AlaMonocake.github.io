// events.js - Contains all event definitions for the simulation

// Event pool array to store all events
const events = [
    //Event 1: Master Death
        {
            id: "event_kill_master",
            description: "{master.name} walks into a landmine and dies.",
            valid: (participants) => {
                return participants.filter(p => p.type === "master" && p.status === "alive");
            },
            effects: (master, servant, participants) => {
                master.status = "dead";
                const linkedServant = participants.find(p => p.type === "servant" && p.masterId === master.id);
                if (linkedServant && !linkedServant.hasIndependentAction) {
                    linkedServant.status = "dead";
                }
            }
        },
    
        {
            id: "event_duel",
            description: "{servant1.name} fights with {servant2.name} to the death.",
            valid: (participants) => {
                const aliveServants = participants.filter(p => p.type === "servant" && p.status === "alive");
                if (aliveServants.length < 2) return [];
                // Generate all possible pairs
                const pairs = [];
                for (let i = 0; i < aliveServants.length; i++) {
                    for (let j = i + 1; j < aliveServants.length; j++) {
                        pairs.push([aliveServants[i], aliveServants[j]]);
                    }
                }
                return pairs;
            },
            effects: (servant1, servant2, participants) => {
                const loser = Math.random() < 0.5 ? servant1 : servant2;
                loser.status = "dead";
            }
        },
    
        {
            id: "event_betrayal",
            description: "{servant1.name} betrays {master.name}. The master is left defenseless and killed.",
            valid: (participants) => {
                const betrayers = [];
                const aliveServants = participants.filter(p => p.type === "servant" && p.status === "alive");
                aliveServants.forEach(servant => {
                    const master = participants.find(p => p.id === servant.masterId && p.status === "alive");
                    if (master) {
                        betrayers.push([servant, master]);
                    }
                });
                return betrayers;
            },
            effects: (servant1, master, participants) => {
                master.status = "dead";
                // Servant survives (no change)
            }
        },
    
    {
        id: "poison_mushroom",
        description: "{master.name} eats a poisonous mushroom!",
        valid: (participants) => participants.filter(p => p.type === "master" && p.status === "alive"),
        effects: (master, servant, participants) => {
            // no persistent state; just logs the event
        }
    },
    {
        id: "poison_death",
        description: "{master.name} succumbs to the poison and dies.",
        followUpFor: ["poison_mushroom"],
        valid: (participants, pastEvents) =>
            pastEvents.includes("poison_mushroom") &&
            participants.filter(p => p.type === "master" && p.status === "alive"),
        effects: (master, servant, participants) => {
            master.status = "dead";
            if (servant && !servant.hasIndependentAction) {
                servant.status = "dead";
            }
        }
    },
    {
        id: "poison_heal",
        description: "{master.name} miraculously recovers from the poison!",
        followUpFor: ["poison_mushroom"],
        valid: (participants, pastEvents) =>
            pastEvents.includes("poison_mushroom") &&
            participants.filter(p => p.type === "master" && p.status === "alive"),
        effects: (master, servant, participants) => {
            // healed, no death
        }
    },
    
];

// Export the eventPool so it can be used in other files
export { events };
