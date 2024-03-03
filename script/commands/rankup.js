const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const authFilePath = path.join(__dirname, 'auth.json');
const auth = require(authFilePath);

const drive = google.drive({
  version: 'v3',
  auth: auth,
});

const dataFileName = 'userData.json';

async function readUserDataFile() {
  try {
    const response = await drive.files.list({
      q: `name='${dataFileName}'`,
    });

    if (response.data.files.length > 0) {
      const fileId = response.data.files[0].id;
      const fileContent = await drive.files.get({ fileId, alt: 'media' });
      return JSON.parse(fileContent.data);
    }

    return null;
  } catch (error) {
    console.error('Error reading user data file:', error.message);
    return null;
  }
}

async function createOrUpdateUserDataFile(data) {
  try {
    const existingData = await readUserDataFile();

    const fileMetadata = {
      name: dataFileName,
      mimeType: 'application/json',
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify({ ...existingData, ...data }),
    };

    if (existingData) {
      await drive.files.update({
        fileId: existingData.id,
        media,
      });
    } else {
      await drive.files.create({
        resource: fileMetadata,
        media,
      });
    }

    console.log('User data file created/updated successfully');
  } catch (error) {
    console.error('Error creating/updating user data file:', error.message);
  }
}

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || 'User';
  } catch (error) {
    console.log(error);
    return 'User';
  }
}

async function updateRankApi(senderID, name, currentExp, level) {
  const requiredXp = Math.floor(1000 * Math.pow(level, 2));
  const rankApiUrl = `https://rank2api-5faa0e644e2f.herokuapp.com/rankCard?name=${encodeURIComponent(name)}&level=Level${level}&color=auto&facebookSenderId=${senderID}&progress=69&rank=1&currentXp=${currentExp}&requiredXp=${requiredXp}&showXp=true`;

  try {
    const response = await axios.get(rankApiUrl, { responseType: 'arraybuffer' });
    const imagePath = path.join(__dirname, 'cache', `rankcard.jpeg`);
    await fs.writeFile(imagePath, response.data, 'binary');
    return imagePath;
  } catch (error) {
    console.error('Error updating Rank API:', error.message);
    return null;
  }
}

module.exports.config = {
  name: 'rankup',
  hasPermission: 0,
  version: '1.0.0',
  credits: 'Jonell Magallanes',
  Description: 'Announcement Rankup :>',
  usePrefix: true,
  commandCategory: 'Rankup',
  usages: '?',
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event }) {
  const userId = event.senderID;
  const userData = await readUserDataFile();

  if (userData && userData[userId]) {
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
          attachment: fs.createReadStream(imagePath),
        }, event.threadID);
      } else {
        api.sendMessage(announcement, event.threadID);
      }
    }

    await createOrUpdateUserDataFile(userData);
  } else {
    const initialUserData = { exp: 1, level: 1 };
    await createOrUpdateUserDataFile({ [userId]: initialUserData });
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage('This Command has rankup function', event.threadID);
};
