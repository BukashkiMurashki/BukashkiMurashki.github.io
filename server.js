import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const app = express();
app.use(express.static("public"));

const server = http.createServer(app); // HTTP сервер
const wss = new WebSocketServer({ server }); // WebSocket поверх этого HTTP сервера

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Клиент подключился, всего:", clients.length);

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
    console.log("Клиент отключился, всего:", clients.length);
  });
});

const bot = new TelegramBot(TOKEN, { polling: true });
bot.onText(/\/play/, (msg) => {
  if (msg.chat.id.toString() !== CHAT_ID) return;

  clients.forEach(ws => ws.send("play"));
  bot.sendMessage(CHAT_ID, "🔊 Звук отправлен");
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
