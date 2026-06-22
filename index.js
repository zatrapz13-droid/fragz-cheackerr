const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Fragz webhook is online ✅");
});

// Webhook
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const event = data?.event || "Unknown Event";
    const invoiceId = data?.data?.invoice_id || "Unknown";

    // Premium Discord embed
    const embed = {
      username: "Fragz Orders",
      embeds: [
        {
          title: "🧾 New Order Received",
          color: 0xff4da6, // pink Fragz theme
          fields: [
            {
              name: "📦 Event",
              value: `\`${event}\``,
              inline: false
            },
            {
              name: "🧾 Invoice ID",
              value: `\`${invoiceId}\``,
              inline: true
            },
            {
              name: "📊 Status",
              value: "🟡 Pending Processing",
              inline: true
            }
          ],
          footer: {
            text: "Fragz Order System • SellAuth Integration"
          },
          timestamp: new Date()
        }
      ]
    };

    await axios.post(process.env.DISCORD_WEBHOOK, embed);

    console.log("Order sent to Discord:", invoiceId);

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.sendStatus(200);
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Fragz webhook running on port ${PORT}`);
});
