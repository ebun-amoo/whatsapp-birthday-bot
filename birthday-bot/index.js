const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const logger = require('./config/logger');
const checkAndSendBirthdays = require('./services/birthdayService');

const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  logger.info('✅ WhatsApp Bot is ready!');

  // const chats = await client.getChats();
  // chats.forEach(chat => {
  //   if (chat.isGroup) {
  //     logger.info(`📛 ${chat.name} - ${chat.id._serialized}`);
  //   }
  // });

  // Schedule to run every day at midnight
  cron.schedule('33 13 * * *', () => checkAndSendBirthdays(client));
});

client.initialize();
