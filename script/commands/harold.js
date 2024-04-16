const axios = require('axios');

let chatEnabled = true;

module.exports.config = {
    name: "harold",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Chating With Harold Hutchins",
    usePrefix: false,
    commandCategory: "Chatbot",
    usages: "[on/off]",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
    const command = args[0];
    
    if (command === 'on') {
        chatEnabled = true;
        return api.sendMessage("✅ | Harold is now ON", event.threadID, event.messageID);
    }

    if (command === 'off') {
        chatEnabled = false;
        return api.sendMessage("✅ | Chatbot is now OFF", event.threadID, event.messageID);
    }

    if (!chatEnabled) return; 

    const content = encodeURIComponent(args.join(" "));
    const id = event.senderID;  
    let apiUrl;

    if (!content) return api.sendMessage("Hello There I'm Harold Hutchins Chatbot made by Jonell Magallanes Haha", event.threadID, event.messageID);
    
    api.sendTypingIndicator(event.threadID);

    apiUrl = `https://harolai-71030c5ce4eb.herokuapp.com/harold?ask=${content}&id=${id}`;

    try {
        const response = await axios.get(apiUrl);
        const { response: reply } = response.data;  
        api.sendMessage(reply, event.threadID, () => {
            api.sendTypingIndicator(event.threadID, false); // Turn off typing indicator after sending message
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("Nagkaroon ng Error Sa Main Server ng API Please Try Again Later or Contact the Developer Jonell Magallanes Thanks", event.threadID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!chatEnabled) return;

    if (event.body !== null && event.isGroup) {
        const content = encodeURIComponent(event.body);
        const id = event.senderID;  
        let apiUrl;

        api.sendTypingIndicator(event.threadID);

        apiUrl = `https://harolai-71030c5ce4eb.herokuapp.com/harold?ask=${content}&id=${id}`;

        try {
            const response = await axios.get(apiUrl);
            const { response: reply } = response.data;  
            api.sendMessage(reply, event.threadID, () => {
                api.sendTypingIndicator(event.threadID, false); // Turn off typing indicator after sending message
            });
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ | Nagkaroon ng Error Sa Main Server ng API Please Try Again Later or Contact the Developer Jonell Magallanes Thanks", event.threadID);
        }
    }
};
    
