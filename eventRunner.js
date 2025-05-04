import { events } from './events.js';

function processEventTemplate(template, context) {
    return template.replace(/\{([a-zA-Z0-9_.]+)\}/g, (_, key) => {
        const parts = key.split(".");
        let value = context;
        for (const part of parts) {
            if (value && part in value) {
                value = value[part];
            } else {
                return `{${key}}`; // leave if missing
            }
        }
        return value;
    });
}

export function runRandomEvent(participants) {
    const aliveMasters = participants.filter(p => p.type === "master" && p.status === "alive");
    const aliveServants = participants.filter(p => p.type === "servant" && p.status === "alive");

    const randomMaster = aliveMasters[Math.floor(Math.random() * aliveMasters.length)];
    const randomServant = participants.find(p => p.id === randomMaster.servantId);

    const validEvents = events.filter(event => {
        const validPool = event.valid(participants);
        return validPool.includes(randomMaster);
    });

    if (validEvents.length === 0) {
        console.warn("No valid events available.");
        return;
    }

    const event = validEvents[Math.floor(Math.random() * validEvents.length)];

    // Run effects
    event.effects(randomMaster, randomServant, participants);

    // Generate event text
    const eventText = processEventTemplate(event.description, {
        master: randomMaster,
        servant: randomServant
    });

    console.log(eventText);
}
