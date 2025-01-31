const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require("ws");
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for API requests
app.use(cors({
    origin: ["http://localhost:5175", "https://video.devsonline.in"],
    methods: ["GET", "POST"],
    
}));

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5175", "https://video.devsonline.in","http://localhost:5173"],
        methods: ["GET", "POST"],
        
    }
});

const tickersUrl = "wss://stream.binance.com:9443/ws";
const historicalDataUrl = "https://api.binance.com/api/v3/klines";
const coins = ["btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt", "dogeusdt", "solusdt", "dotusdt", "ltcusdt", "linkusdt"];

let clientsConnected = 0;
let tickerWebSocket = null;
let klineWebSocket = null;
io.on("connection", (socket) => {
    console.log("✅ User connected");
    clientsConnected++;

    if (clientsConnected === 1) {
        startTickerStream();
    }
    socket.on('selectCoin',(coin)=>{
        console.log(`User selected ${coin}`)
        // if (klineWebSocket !==null){
        //     stopKlineStream()
        // }
        // stopTickerStream();
        startKlineStream(coin)

    })
    socket.on("disconnect", () => {
        console.log(" User disconnected");
        clientsConnected--;
        if (clientsConnected === 0) {
            stopTickerStream();
            stopKlineStream();
        }
    });
});


async function startKlineStream(coin){
    // const historicalData = await fetchHistoricalData(coin);
    // io.emit("historicalKlineData", historicalData);
    klineWebSocket = new WebSocket(`${tickersUrl}/${coin}@kline_1s`);
    klineWebSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        io.emit("klineData", data);
    };
    klineWebSocket.onerror = (error) => {
        console.error(`Kline WebSocket Error: ${error.message}`);
    };
    klineWebSocket.onclose = () => {
        console.log("🔴 Kline WebSocket closed");
    };
}
function startTickerStream() {
    console.log("📡 Start 24-hour ticker stream...");
    const streamNames = coins.map(coin => `${coin}@ticker`).join("/");
    tickerWebSocket = new WebSocket(`${tickersUrl}/${streamNames}`);

    tickerWebSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        io.emit("cryptoData", data);
    };

    tickerWebSocket.onerror = (error) => {
        console.error(`❌ Ticker WebSocket Error: ${error.message}`);
    };

    tickerWebSocket.onclose = () => {
        console.log("🔴 Ticker WebSocket closed");
    };
}

function stopTickerStream() {
    if (tickerWebSocket) {
        tickerWebSocket.close();
        tickerWebSocket = null;
        console.log("Stopped 24-hour ticker stream");
    }
}
function stopKlineStream() {
    if (klineWebSocket) {
        klineWebSocket.close();
        klineWebSocket = null;
        console.log(" Stopped Kline data stream");
    }
}
async function fetchHistoricalData(coin){
    try{
        const response = await fetch(`${historicalDataUrl}?symbol=${coin.toUpperCase()}&interval=1s&limit=100`);    
        const data = await response.json();
        const historicalData = [];
        for (let i = 0; i < data.length; i++) {
            historicalData.push({k:{
                t: data[i][0],
                o: data[i][1],
                h: data[i][2],
                l: data[i][3],
                c: data[i][4],
                volume: data[i][5],
                c: data[i][6],
                x:true
            }});
        }
        return historicalData;
}catch(error){
    console.error(`Error fetching historical data for ${coin}:`, error);
    return [];
}
}
app.get("/historical_data", async (req, res) => {
    const { coin } = req.query; 

    if (!coin) {
        return res.status(400).json({ error: "Coin parameter is required" });
    }

    try {
        const historicalData = await fetchHistoricalData(coin);
        return res.json(historicalData);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch historical data" });
    }
});


server.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});
