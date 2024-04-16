const axios = require('axios');
const fs = require('fs');

let chatEnabled = false; 


if (fs.existsSync('./chatbotStatus.json')) {
    const rawData = fs.readFileSync('./chatbotStatus.json');
    const jsonData = JSON.parse(rawData);
    chatEnabled = jsonData.chatEnabled;
}

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


function saveStatus() {
    const jsonData = { chatEnabled };
    fs.writeFileSync('./chatbotStatus.json', JSON.stringify(jsonData, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
    const command = args[0];
    
    if (command === 'on') {
        chatEnabled = true;
        saveStatus();
        return api.sendMessage("Harold is now ON", event.threadID, event.messageID);
    }

    if (command === 'off') {
        chatEnabled = false;
        saveStatus();
        return api.sendMessage("Harold is now OFF", event.threadID, event.messageID);
    }

    if (!chatEnabled) return; 

    const content = encodeURIComponent(args.join(" "));
    const id = event.senderID;  

    if (!content) return api.sendMessage("Hello There I'm Harold Hutchins Chatbot made by Jonell Magallanes Haha", event.threadID, event.messageID);
    api.setMessageReaction("💭", event.messageID, () => { }, true);

    try {
        const response = await axios.get(`https://harolai-71030c5ce4eb.herokuapp.com/harold?ask=${content}&id=${id}`);
        const { response: reply } = response.data;  
        api.setMessageReaction("💚", event.messageID, () => { }, true);
        api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("Nagkaroon ng Error Sa Main Server ng API Please Try Again Later or Contact the Developer Jonell Magallanes Thanks", event.threadID);
        api.setMessageReaction("😭", event.messageID, () => { }, true);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!chatEnabled || !event.body || !event.isGroup) return; 

    const content = encodeURIComponent(event.body);
    const id = event.senderID;  

    api.setMessageReaction("💭", event.messageID, () => { }, true);

    try {
        const response = await axios.get(`https://harolai-71030c5ce4eb.herokuapp.com/harold?ask=${content}&id=${id}`);
        const { response: reply } = response.data;  
        api.setMessageReaction("💚", event.messageID, () => { }, true);
        api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("Nagkaroon ng Error Sa Main Server ng API Please Try Again Later or Contact the Developer Jonell Magallanes Thanks", event.threadID);
        api.setMessageReaction("😭", event.messageID, () => { }, true);
    }
};
