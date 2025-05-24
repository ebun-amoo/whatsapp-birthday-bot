const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const cron = require('node-cron');

const client = new Client({
  puppeteer: { headless: true },  // Optional: for headless mode=
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async() => {
  console.log('✅ WhatsApp Bot is ready!');

  // const info = await client.info;
  // console.log(`🤖 Bot is using WhatsApp number: ${info.wid.user}`);
  
  // try {
  //   const chats = await client.getChats();
  //   console.log(`📊 Total chats found: ${chats.length}`);

  //   chats.forEach(chat => {
  //     if (chat.isGroup) {
  //       console.log(`📢 Group: ${chat.name} - ${chat.id._serialized}`);
  //     }
  //   });
  // } catch (error) {
  //   console.error('❌ Error fetching chats:', error);
  // }

  // Schedule to run every day at 12AM
  cron.schedule('0 0 * * *', async () => {
    console.log("⏰ Checking birthdays...");

    const birthdays = JSON.parse(fs.readFileSync('./birthdays.json'));
    const today = new Date().toISOString().slice(5, 10); // 'MM-DD'

    let sentCount = 0;

    for (const person of birthdays) {
      if (!/^\d{2}-\d{2}$/.test(person.birthdate)) {
        console.log(`⚠️ Invalid date format for ${person.name}: ${person.birthdate}`);
        continue;
      }

      if (person.birthdate === today) {
        const groupId = '2349075215315-1608012976@g.us'; // LM Goers group ID

        if (!fs.existsSync(person.flyer)) {
          console.log(`❌ Flyer not found for ${person.name}: ${person.flyer}`);
          continue;
        }

        try {
          const media = MessageMedia.fromFilePath(person.flyer);
          await client.sendMessage(groupId, media);
          await client.sendMessage(groupId, person.message);
          console.log(`🎈 Sent birthday wishes to ${person.name}`);
          sentCount++;
        } catch (err) {
          console.log(`⚠️ Failed to send message for ${person.name}: ${err.message}`);
        }
      }
    }

    if (sentCount === 0) {
      console.log("📭 No birthdays today.");
    }
  });
});

client.initialize();
