const TelegramApi = require("node-telegram-bot-api");
const { TG_TOKEN, PAY_TOKEN } = require("./settings");
const token = TG_TOKEN;
const bot = new TelegramApi(token, { polling: true });
const { gameOptions, againOptions } = require("./options");

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать",
  );
  const randomNum = Math.floor(Math.random() * 10);
  chats[chatId] = randomNum;
  await bot.sendMessage(chatId, "Я загадал, угадывай!", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Сведения о твоем имени в тг" },
    { command: "/game", description: "Угадай число" },
    { command: "/pay", description: "Купить товар" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://chpic.su/_data/stickers/f/find_bez_texta/find_bez_texta_002.webp?v=1698441002",
      );
      return bot.sendMessage(chatId, "Салам");
    }
    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.chat.first_name} ${msg.chat.last_name}`,
      );
    }
    if (text === "/game") {
      await startGame(chatId);
    }
    if (text === "/pay") {
      return bot.sendInvoice(
        chatId,
        "Товар",
        "описание товара",
        "payload",
        PAY_TOKEN,
        "RUB",
        [
          {
            label: "товар",
            amount: 8000,
          },
        ],
        {
          photo_url:
            "https://raskraskirus.ru/wp-content/uploads/7/2/f/72fc60554b098002430ef9cbd5c8ac35.png",
          need_name: true,
          is_flexible: true,
        },
      );
    }
    return bot.sendMessage(chatId, "Я такую команду не знаю;(");
  });
};

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  if (data === "/again") {
    return startGame(chatId);
  }
  if (data === chats[chatId]) {
    return await bot.sendMessage(chatId, "Ты угадал", againOptions);
  } else {
    return await bot.sendMessage(
      chatId,
      `Ты не угадал, бот загадал число ${chats[chatId]}`,
      againOptions,
    );
  }
});

start();
