const axios = require('axios');

module.exports.config = {
    name: "harold",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Chating With Harold Hutchins",
    usePrefix: false,
    commandCategory: "Chatbot",
    usages: "[question]",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const id = event.senderID;  
    let apiUrl;

    if (!content) return api.sendMessage("Hello There I'm Harold Hutchins Chatbot made by Jonell Magallanes Haha", event.threadID, event.messageID);
    api.setMessageReaction("💭", event.messageID, () => { }, true);

    apiUrl = `https://harolai-71030c5ce4eb.herokuapp.com/harold?ask=${content}&id=${id}`;

    try {

        const response = await axios.get(apiUrl);
        const { response: reply } = response.data;  
        api.setMessageReaction("💚", event.messageID, () => { }, true);
        api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("Nagkaroon ng Error Sa Main Server ng API Please Try Again Later or Contact the Developer Jonell Magallanes Thanks", event.threadID);
        api.setMessageReaction("😭", event.messageID, () => { }, true);
    }
};