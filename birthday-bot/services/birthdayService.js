const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const logger = require('../config/logger');

const GROUP_ID = '120363305252726975@g.us'; // AI group ID
const birthdaysPath = path.join(__dirname, '..', 'data', 'birthdays.json');

async function checkAndSendBirthdays(client) {
  logger.info("⏰ Checking birthdays...");

  const birthdays = JSON.parse(fs.readFileSync(birthdaysPath));
  const today = new Date().toISOString().slice(5, 10); // 'MM-DD'

  let sentCount = 0;

  for (const person of birthdays) {
    if (!/^\d{2}-\d{2}$/.test(person.birthdate)) {
      logger.warn(`⚠️ Invalid date format for ${person.name}: ${person.birthdate}`);
      continue;
    }

    if (person.birthdate === today) {
      if (!fs.existsSync(person.flyer)) {
        logger.error(`❌ Flyer not found for ${person.name}: ${person.flyer}`);
        continue;
      }

      try {
        const media = MessageMedia.fromFilePath(person.flyer);
        await client.sendMessage(GROUP_ID, media);
        await client.sendMessage(GROUP_ID, person.message);
        logger.info(`🎈 Sent birthday wishes to ${person.name}`);
        sentCount++;
      } catch (err) {
        logger.error(`⚠️ Failed to send message for ${person.name}: ${err.message}`);
      }
    }
  }

  if (sentCount === 0) {
    logger.info("📭 No birthdays today.");
  }
}

module.exports = checkAndSendBirthdays;
