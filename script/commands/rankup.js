const axios = require('axios');
const path = require('path');
const { promises: fsPromises } = require('fs');

const jsonBinUrl = 'https://api.jsonbin.io/v3/b/65e33b4c266cfc3fde9228b6';
const jsonBinAccessKey = '$2a$10$YsAY2KOYAVCm4GDQ9uVGI..Xb8hyRI2Jzg15thwTJvY39NpB7Cvtm'; // Replace with your JSON Bin access key

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    console.log(error);
    return "User";
  }
}

async function updateRankApi(senderID, name, currentExp, level) {
  const requiredXp = Math.floor(1000 * Math.pow(level, 2));
  const rankApiUrl = `https://rank2api-5faa0e644e2f.herokuapp.com/rankCard?name=${encodeURIComponent(name)}&level=Level${level}&color=auto&facebookSenderId=${senderID}&progress=69&rank=1&currentXp=${currentExp}&requiredXp=${requiredXp}&showXp=true`;

  try {
    const response = await axios.get(rankApiUrl, { responseType: 'arraybuffer' });

    const imagePath = path.join(__dirname, 'cache', `rankcard.jpeg`);
    await fsPromises.writeFile(imagePath, response.data, 'binary');

    return imagePath;
  } catch (error) {
    console.error('Error updating Rank API:', error.message);
    return null;
  }
}

async function getUserDataFromJsonBin() {
  try {
    const response = await axios.get(jsonBinUrl, {
      headers: {
        'X-Access-Key': jsonBinAccessKey,
      },
    });
    return response.data?.record || {};
  } catch (error) {
    console.error('Error fetching user data from JSON Bin:', error.message);
    return {};
  }
}

async function saveUserDataToJsonBin(userData) {
  try {
    await axios.put(jsonBinUrl, { record: userData }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': jsonBinAccessKey,
      },
    });
  } catch (error) {
    console.error('Error saving user data to JSON Bin:', error.message);
  }
}

module.exports.config = {
  name: "rankup",
  hasPermission: 0,
  version: "1.0.0",
  credits: "Jonell Magallanes",
  Description: "Announcement Rankup :>",
  usePrefix: true,
  commandCategory: "Rankup",
  usages: "?",
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event }) {
  let userData = await getUserDataFromJsonBin();
  const userId = event.senderID;

  if (userData[userId]) {
    userData[userId].exp = (userData[userId].exp || 0) + 10;
    const expNeeded = Math.floor(5 * Math.pow(userData[userId].level || 1, 2));
    
    if (userData[userId].exp >= expNeeded) {
      userData[userId].level += 1;
      userData[userId].exp -= expNeeded;
      const rankLevel = userData[userId].level;
      const announcement = `⏫ | ${await getUserName(api, userId)} Your Keyboard Hero has leveled up to level ${rankLevel}! `;

      const imagePath = await updateRankApi(userId, await getUserName(api, userId), userData[userId].exp, rankLevel);

      if (imagePath) {
        api.sendMessage({
          body: announcement,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID);
      } else {
        api.sendMessage(announcement, event.threadID);
      }
    }
  } else {
    userData[userId] = { exp: 1, level: 1 };
  }

  await saveUserDataToJsonBin(userData);
}

module.exports.run = async function ({ api, event }) {
  api.sendMessage("This Command has rankup function", event.threadID);
};
