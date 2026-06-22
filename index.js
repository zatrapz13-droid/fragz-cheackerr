const express = require("express");
const axios = require("axios");

const app = express();

// IMPORTANT: allow JSON body
app.use(express.json());

// Health check route (so your link doesn’t look “broken”)
app.get("/", (req, res) => {
  res.send("Fragz webhook is online ✅");
});

// Webhook route (SellAuth sends orders here)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("🔥 SELL AUTH EVENT RECEIVED:");
    console.log(JSON.stringify(data, null, 2));

    // Extract invoice safely
    const invoiceId = data?.data?.invoice_id || "Unknown";

    const event = data?.event || "Unknown Event";

    // Send to Discord
    await axios.post(process.env.DISCORD_WEBHOOK, {
      content: `🧾 **New Order Received**

📦 Event: ${event}
🧾 Invoice ID: ${invoiceId}
`
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.sendStatus(200); // always respond 200 so SellAuth doesn't retry spam
  }
});

// Start server (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Fragz webhook running on port ${PORT}`);
});
