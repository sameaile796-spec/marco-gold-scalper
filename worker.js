
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        bot: "MARCO GOLD SCALPER PRO",
        status: "online",
        market: "XAU/USD",
        version: "1.0"
      });
    }

    // Telegram webhook
    if (request.method === "POST" && url.pathname === "/telegram") {
      const secret = request.headers.get(
        "X-Telegram-Bot-Api-Secret-Token"
      );

      if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }

      const update = await request.json();
      const message = update.message;

      if (!message?.text || !message.chat?.id) {
        return new Response("OK");
      }

      const chatId = message.chat.id;
      const command = message.text.trim().split(/\s+/)[0].toLowerCase();

      let reply;

      if (command === "/start") {
        reply =
          "🔥 MARCO GOLD SCALPER PRO\n\n" +
          "Welcome! Bot connection successful.\n\n" +
          "Available commands:\n" +
          "/start - Start bot\n" +
          "/status - Bot status\n" +
          "/test - Test message\n" +
          "/help - Help";
      } else if (command === "/status") {
        reply =
          "MARCO GOLD SCALPER PRO\n\n" +
          "Telegram: CONNECTED\n" +
          "Worker: ONLINE\n" +
          "Market: XAU/USD\n" +
          "Signal engine: NOT CONNECTED YET";
      } else if (command === "/test") {
        reply = "✅ MARCO GOLD SCALPER PRO: Telegram test successful!";
      } else if (command === "/help") {
        reply =
          "Commands:\n/start\n/status\n/test\n/help\n\n" +
          "Gold analysis engine will be connected in the next stage.";
      } else {
        reply = "Unknown command. Send /help";
      }

      await sendTelegram(env, chatId, reply);

      return new Response("OK");
    }

    return new Response("Not Found", { status: 404 });
  }
};

async function sendTelegram(env, chatId, text) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing Telegram bot token");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    }
  );

  if (!response.ok) {
    throw new Error("Telegram API error: " + response.status);
  }

  return response.json();
}
