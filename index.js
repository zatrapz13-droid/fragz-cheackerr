const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
const SELLAUTH_API = process.env.SELLAUTH_API;

app.post("/webhook", async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);

    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== req.headers["x-signature"]) {
      return res.status(403).send("Bad signature");
    }

    if (req.body.event !== "NOTIFICATION.SHOP_INVOICE_CREATED") {
      return res.sendStatus(200);
    }

    const invoiceId = req.body.data.invoice_id;

    const response = await axios.get(
      `https://api.sellauth.com/v1/invoices/${invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${SELLAUTH_API}`
        }
      }
    );

    const order = response.data;

    const embed = {
      embeds: [{
        title: "🌸 FRAGZ ORDER RECEIVED",
        description: "━━━━━━━━━━━━━━━━━━",
        color: 16738740, // pink

        fields: [
          {
            name: "🧾 Invoice",
            value: `#${order.id}`,
            inline: true
          },
          {
            name: "👤 Customer",
            value: order.discord_id
              ? `<@${order.discord_id}>`
              : "No Discord Linked",
            inline: true
          },
          {
            name: "📧 Email",
            value: order.customer_email || "Unknown"
          },
          {
            name: "💳 Payment Method",
            value: order.payment_method || "Unknown",
            inline: true
          },
          {
            name: "🛒 Product",
            value: order.products?.[0]?.name || "Unknown"
          },
          {
            name: "💰 Price",
            value: `$${order.total}`,
            inline: true
          },
          {
            name: "📦 Stock Remaining",
            value: String(
              order.products?.[0]?.variant_stock || "Unknown"
            ),
            inline: true
          },
          {
            name: "Status",
            value: "Payment Received ✅"
          }
        ],

        footer: {
          text: "Fragz Store"
        },

        timestamp: new Date()
      }]
    };

    await axios.post(DISCORD_WEBHOOK, embed);

    res.sendStatus(200);

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Fragz webhook running");
});