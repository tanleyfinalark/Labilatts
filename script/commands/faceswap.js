'use strict';

module.exports.config = {
  name: "faceswap",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "josh", //convert by jonell as mirai form
  description: "Generate image",
  usePrefix: false,
  usage: "[reply to a 2 image]",
  commandCategory: "Just For fun",
  cooldowns: 40,
};

module.exports.run = async function({ api, event }) {
  try {
    const { Prodia } = require("prodia.js");
    const prodia = new Prodia("91838cb9-098c-4fa6-aac1-73eb4b3c88d7");
    const axios = require("axios");
    const fs = require('fs');

    let url, url1;

    if (event.type === "message_reply") {
      if (event.messageReply.attachments.length === 0) return api.sendMessage("No image found.", event.threadID);
      if (event.messageReply.attachments[0].type !== "photo") return api.sendMessage("Only image can be converted.", event.threadID);
      
      url = event.messageReply.attachments[0].url;
      if (event.messageReply.attachments.length > 2) return api.sendMessage("Only 2 images can be converted.", event.threadID);

      url = event.messageReply.attachments[0].url;
      url1 = event.messageReply.attachments[1].url;

      api.sendMessage("Processing...", event.threadID);

      const generate = await prodia.faceSwap({
        sourceUrl: encodeURI(url),
        targetUrl: encodeURI(url1),
      });

      while (generate.status !== "succeeded" && generate.status !== "failed") {
        await new Promise(resolve => setTimeout(resolve, 250));
        const job = await prodia.getJob(generate.job);

        if (job.status === "succeeded") {
          let img = (await axios.get(job.imageUrl, { responseType: "arraybuffer" })).data;
          let path = __dirname + '/cache/gen.png';

          fs.writeFileSync(path, Buffer.from(img, "utf-8"));
          return api.sendMessage({ attachment: fs.createReadStream(path) }, event.threadID);
        }
      }
    } else {
      return api.sendMessage("Please reply to an image.", event.threadID);
    }
  } catch (e) {
    return api.sendMessage(e.message, event.threadID);
  }
};
