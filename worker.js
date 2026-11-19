// MARCO GOLD SCALPER PRO
// Cloudflare Worker - Telegram Bot Foundation
// Version 1.1
// No real trading execution

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        bot: "MARCO GOLD SCALPER PRO",
        status: "online",
        market: "XAU/USD",
        version: "1.1",
        telegram_configured: Boolean(env.TELEGRAM_BOT_TOKEN),
        webhook_configured: Boolean(env.WEBHOOK_SECRET),
        market_data: "NOT CONNECTED",
        signal_engine: "NOT CONNECTED",
        trading: "DISABLED"
      });
    }

    // Telegram Webhook
    if (request.method === "POST" && url.pathname === "/telegram") {
      try {
        // Verify webhook secret
        const secret = request.headers.get(
          "X-Telegram-Bot-Api-Secret-Token"
        );

        if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
          return new Response("Unauthorized", {
            status: 401
          });
        }

        // Read Telegram update
        const update = await request.json();
        const message = update.message;

        // Ignore updates without text/chat
        if (!message?.text || !message?.chat?.id) {
          return new Response("OK", {
            status: 200
          });
        }

        const chatId = message.chat.id;
        const text = message.text.trim();

        // Extract command and remove bot username suffix
        const command = text
          .split(/\s+/)[0]
          .split("@")[0]
          .toLowerCase();

        let reply;

        // /start
        if (command === "/start") {
          reply =
            "🔥 MARCO GOLD SCALPER PRO 🔥\n\n" +
            "Telegram connection successful!\n\n" +
            "Bot: ONLINE ✅\n" +
            "Market: XAU/USD\n" +
            "Trading: DISABLED\n\n" +
            "Available commands:\n" +
            "/start - Start the bot\n" +
            "/status - Check bot status\n" +
            "/test - Test Telegram connection\n" +
            "/help - Show help";
        }

        // /status
        else if (command === "/status") {
          reply =
            "📊 MARCO GOLD SCALPER PRO\n\n" +
            "Worker: ONLINE ✅\n" +
            "Telegram: CONNECTED ✅\n" +
            "Market: XAU/USD\n" +
            "Market data: NOT CONNECTED ⚠️\n" +
            "Analysis engine: NOT CONNECTED ⚠️\n" +
            "Signal system: NOT ACTIVE ⚠️\n" +
            "Automatic scanning: NOT ACTIVE ⚠️\n" +
            "Real trading: DISABLED 🔒";
        }

        // /test
        else if (command === "/test") {
          reply =
            "✅ Telegram test successful!\n\n" +
            "MARCO GOLD SCALPER PRO\n" +
            "Worker is responding correctly.\n\n" +
            "Market analysis is not connected yet.";
        }

        // /help
        else if (command === "/help") {
          reply =
            "🤖 MARCO GOLD SCALPER PRO\n\n" +
            "Commands:\n" +
            "/start - Start bot\n" +
            "/status - Check system status\n" +
            "/test - Test message\n" +
            "/help - Help\n\n" +
            "Gold analysis engine is under development.\n" +
            "No real trades are executed.";
        }

        // Unknown command
        else {
          reply =
            "❓ Unknown command.\n\n" +
            "Send /help to see available commands.";
        }

        // Send Telegram reply
        await sendTelegram(env, chatId, reply);

        return new Response("OK", {
          status: 200
        });
      } catch (error) {
        console.error("Webhook error:", error.message);

        return new Response("Internal Server Error", {
          status: 500
        });
      }
    }

    // Wrong path
    return new Response("Not Found", {
      status: 404
    });
  }
};


// Send message using Telegram Bot API
async function sendTelegram(env, chatId, text) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const telegramUrl =
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    console.error("Telegram API request failed:", response.status);
    throw new Error("Telegram API request failed");
  }

  return result;
}
