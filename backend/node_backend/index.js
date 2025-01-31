// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const WebSocket = require("ws");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: "*" }  // Allow frontend connections
// });

// const JWT_SECRET = "your_django_secret_key";  // Use same secret as Django

// // Binance API URLs
// const tickersUrl = "wss://stream.binance.com:9443/ws";
// const coins = ["btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt", "dogeusdt", "solusdt", "dotusdt", "ltcusdt", "linkusdt"];
// let tickerWebSocket = null;
// let klineWebSocket = null;
// let clientsConnected = 0;

// // ✅ Middleware to authenticate WebSocket connections
// // io.use((socket, next) => {
// //     const token = socket.handshake.auth.token;
// //     if (!token) return next(new Error("Authentication error: No token provided"));

// //     try {
// //         const decoded = jwt.verify(token, JWT_SECRET);
// //         socket.user = decoded;
// //         next();
// //     } catch (err) {
// //         return next(new Error("Authentication error: Invalid token"));
// //     }
// // });

// // ✅ Handle WebSocket connection
// io.on("connection", (socket) => {
//     console.log(`✅ User connected`);
//     clientsConnected++;

//     if (clientsConnected === 1) {
//         startTickerStream();
//     }

//     // ✅ Handle coin selection for Kline data
//     socket.on("selectCoin", (coin) => {
//         console.log(`🔄 User selected: ${coin}`);
//         stopTickerStream();
//         startKlineStream(coin);
//     });

//     // ✅ Handle returning to ticker view
//     socket.on("backToTicker", () => {
//         console.log(`🔄 Returning to 24-hour ticker`);
//         stopKlineStream();
//         startTickerStream();
//     });

//     socket.on("disconnect", () => {
//         console.log(`❌ User ${socket.user.username} disconnected`);
//         clientsConnected--;

//         if (clientsConnected === 0) {
//             stopTickerStream();
//             stopKlineStream();
//         }
//     });
// });

// // ✅ Start 24-Hour Ticker Stream
// function startTickerStream() {
//     console.log("📡 Starting 24-hour ticker stream...");
//     const streamNames = coins.map(coin => `${coin}@ticker`).join("/");
//     tickerWebSocket = new WebSocket(`${tickersUrl}/${streamNames}`);

//     tickerWebSocket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         io.emit("cryptoData", data);
//     };

//     tickerWebSocket.onerror = (error) => {
//         console.error(`Ticker WebSocket Error: ${error.message}`);
//     };

//     tickerWebSocket.onclose = () => {
//         console.log("🔴 Ticker WebSocket closed");
//     };
// }

// // ✅ Start Kline (Candlestick) Data Stream
// function startKlineStream(coin) {
//     console.log(`📊 Fetching Kline data for ${coin.toUpperCase()}...`);
//     klineWebSocket = new WebSocket(`${tickersUrl}/${coin}@kline_1m`);

//     klineWebSocket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         io.emit("klineData", data);
//     };

//     klineWebSocket.onerror = (error) => {
//         console.error(`Kline WebSocket Error: ${error.message}`);
//     };

//     klineWebSocket.onclose = () => {
//         console.log("🔴 Kline WebSocket closed");
//     };
// }

// // ✅ Stop Ticker WebSocket
// function stopTickerStream() {
//     if (tickerWebSocket) {
//         tickerWebSocket.close();
//         tickerWebSocket = null;
//         console.log("🛑 Stopped 24-hour ticker stream");
//     }
// }

// // ✅ Stop Kline WebSocket
// function stopKlineStream() {
//     if (klineWebSocket) {
//         klineWebSocket.close();
//         klineWebSocket = null;
//         console.log("🛑 Stopped Kline data stream");
//     }
// }

// server.listen(3000, () => {
//     console.log("✅ Server running on http://localhost:3000");
// });
let clientsConnected = 0;
const express=require('express')
const http=require('http')
const {Server}=require('socket.io')
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }  // Allow frontend connections
});
const tickersUrl = "wss://stream.binance.com:9443/ws";
const coins = ["btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt", "dogeusdt", "solusdt", "dotusdt", "ltcusdt", "linkusdt"];

io.on("connection",(socket)=>{
    console.log("user connected")
    clientsConnected++
    if(clientsConnected===1){
        startTickerStream();
    }
    socket.on("disconnect",()=>{
        console.log("user disconnected")
        clientsConnected--
        if(clientsConnected===0){
            stopTickerStream();
        }
    })
})

function startTickerStream(){
    console.log("start 24hr ticker stream")
    const streamNames = coins.map(coin => `${coin}@ticker`).join("/");
    console.log("streamnames--->",streamNames)
    tickerWebSocket = new WebSocket(`${tickersUrl}/${streamNames}`);
    tickerWebSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Data--->",data)
        io.emit("cryptoData", data);
    };
    tickerWebSocket.onerror = (error) => {
        console.error(`Ticker WebSocket Error: ${error.message}`);
    };
    tickerWebSocket.onclose = () => {
        console.log(" Ticker WebSocket closed");
    };
}
function stopTickerStream(){
    if(tickerWebSocket!==null){
        tickerWebSocket.close()
        tickerWebSocket = null;
        console.log(" Stopped 24-hour ticker stream");
    }
}

server.listen(3000, () => {
    console.log(" Server running on http://localhost:3000");
});