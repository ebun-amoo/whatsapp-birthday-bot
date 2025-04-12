const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const cron = require('node-cron');

const client = new Client();

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');

  // Schedule to run every day at 6AM
  cron.schedule('0 6 * * *', async () => {
    console.log("⏰ Checking birthdays...");

    const birthdays = JSON.parse(fs.readFileSync('./birthdays.json'));
    const today = new Date().toISOString().slice(5, 10); // 'MM-DD'

    for (const person of birthdays) {
      if (person.birthdate === today) {
        const media = MessageMedia.fromFilePath(person.flyer);
        const groupId = '1234567890-1234567890@g.us'; // Replace with your group ID

        await client.sendMessage(groupId, media);
        await client.sendMessage(groupId, person.message);
        console.log(`🎈 Sent birthday wishes to ${person.name}`);
      }
    }
  });
});

client.initialize();
