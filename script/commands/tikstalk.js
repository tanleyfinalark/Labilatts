const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "tikstalk",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Jonell Magallanes",
    description: "ikTok user information", //api by jonell Magallanes 
    usePrefix: false,
    commandCategory: "Media",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const username = args[0];

    if (!username) {
        return api.sendMessage("Please provide a TikTok username.", event.threadID);
    }

    try {
        const response = await axios.get(`https://jonellccapis-dbe67c18fbcf.herokuapp.com/api/tikstalk?unique_id=${username}`);
        const userData = response.data;

        const avatarURL = userData.avatarLarger;
        const avatarFilename = path.basename(avatarURL);
        const avatarPath = path.join(__dirname, 'avatars', avatarFilename);

        const avatarResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
        fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data));

        const message = {
            body: `👤 | TikTok User Information\n\nUsername: ${userData.username}\nLikes: ${userData.heartCount}\nFollowers: ${userData.followerCount}\nFollowing: ${userData.followingCount}\nBio: ${userData.signature}`,
            attachment: fs.createReadStream(avatarPath)
        };
        return api.sendMessage(message, event.threadID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("🚧 | Error fetching TikTok user information.", event.threadID);
    }
};
