import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import ReactApexChart from "react-apexcharts";
 
const URL = "https://video.devsonline.in:3000";
 
const Ticker = () => {
  const [tickers, setTickers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState("1d");
  const [chartData, setChartData] = useState([]);
  const socketRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [options, setOptions] = useState({
    chart: {
      type: "candlestick",
      background: "#1E222D",
      height: 400,
      animations: {
        enabled: false // Disable animations for better performance
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      // text: "Crypto Price Chart",
      style: { color: "#fff" }
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px"
      },
      x: {
        format: 'MMM dd HH:mm' // Add time format for x-axis tooltip
      }
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \'yy',
          day: 'dd MMM',
          hour: 'HH:mm'
        },
        style: { colors: "#666" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#666" },
      },
      title: {
        text: "Price",
        style: { color: "#666" },
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#82ca9d",
          downward: "#ff4976",
        },
      },
    },
  });
 
  const [series, setSeries] = useState([
    {
      data: [],
    },
  ]);
 
  // useEffect(() => {
  //   console.log("series",series);
  // }, [series]);
  // // console.log("series",series);
 
  const fetchHistoricalData = async (symbol) => {
    try {
      const response = await fetch(
        `${URL}/historical_data?coin=${symbol.toLowerCase()}`
      );
      const data = await response.json();
 
      // Transform the historical data to match the chart format
      const formattedData = data.map((candle) => ({
        x: new Date(candle.k.t).getTime(),
        y: [
          parseFloat(candle.k.o),
          parseFloat(candle.k.h),
          parseFloat(candle.k.l),
          parseFloat(candle.k.c),
        ],
      }));
 
      // Update the chart with historical data
      setSeries([
        {
          name: symbol,
        data: formattedData.sort((a, b) => a.x - b.x),
        },
      ]);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };
 
  const getIconUrl = (symbol) => {
    // Remove USDT from symbol to get base currency
    const baseCurrency = symbol.replace("USDT", "").toLowerCase();
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/32/color/${baseCurrency}.png`;
  };
 
 
 
  useEffect(() => {
    const socket = io(URL);
    socketRef.current = socket;
 
    socket.on("connect", () => {
      setIsConnected(true);
    });
 
    if (socketRef.current) {
      socketRef.current.emit('duration_ticker', duration);
    }
 
    socket.on("cryptoData", (data) => {
      // console.log("data",data);
      const receivedData = Array.isArray(data) ? data : [data];
      setTickers((prev) => {
        const newTickers = [...prev];
        receivedData.forEach((newTicker) => {
          const index = newTickers.findIndex((t) => t.s === newTicker.s);
          index > -1
            ? (newTickers[index] = newTicker)
            : newTickers.push(newTicker);
        });
        return newTickers.sort((a, b) => a.s.localeCompare(b.s));
      });
    });
 
    socket.on("klineData", (data) => {
      console.log(data);
      if (data.k.x) {
        const candleData = {
          x: new Date(data.k.t).getTime(), // timestamp
          y: [
            parseFloat(data.k.o), // open
            parseFloat(data.k.h), // high
            parseFloat(data.k.l), // low
            parseFloat(data.k.c), // close
          ],
        };
 
        setSeries((prevSeries) => {
          // Check if a candle with the same timestamp already exists
          const isDuplicate = prevSeries[0].data.some(
            (existingCandle) => existingCandle.x === candleData.x
          );
 
          // Only add the new candle if it's not a duplicate
          if (!isDuplicate) {
            return [{
              data: [...prevSeries[0].data.slice(-100), candleData],
            }];
          }
          return prevSeries;
        });
      }
    });
 
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
 
    return () => {
      socket.disconnect();
    };
  }, [duration]);
 
 
 
  const handleRowClick = (symbol) => {
    setSelectedSymbol(symbol);
    setShowPopup(true);
    console.log(symbol);
    fetchHistoricalData(symbol);
    if (socketRef.current) {
      socketRef.current.emit("selectCoin", symbol.toLowerCase());
    }
  };
 
  return (
    <div className="dark-ticker-container" >
      {/* <div className="header">
        <div className="header-content">
          <h1>
            <span className="gradient-text">Crypto Live Ticker</span>
          </h1>
          <div className="controls">
            <div className="connection-status">
              <div
                className={`status-dot ${
                  isConnected ? "connected" : "disconnected"
                }`}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
      </div> */}
 
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              style={{background:'none',display:'flex',justifyContent:'end'}}
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
            <h2>{selectedSymbol} Chart</h2>
            <ReactApexChart
              options={options}
              series={series}
              type="candlestick"
              height={400}
            />
          </div>
        </div>
      )}
 
      <div className="table-wrapper">
        <table className="dark-ticker-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pair</th>
              <th>Price</th>
              <th>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="duration-select"
                >
                  <option value="1h">1H</option>
                  <option value="4h">4H</option>
                  <option value="1d">24H</option>
                </select>{" "}
              </th>
              <th>Open</th>
              <th>Previous Close</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker, index) => (
              <tr
                key={ticker.s}
                onClick={() => handleRowClick(ticker.s)}
                style={{ cursor: "pointer" }}
              >
                <td>{index + 1}</td>
                <td className="pair-cell">
                  <img
                    src={getIconUrl(ticker.s)}
                    alt={ticker.s}
                    className="crypto-icon"
                    onError={(e) => {
                      e.target.src =
                        "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/32/color/generic.png";
                    }}
                  />
                  <span className="pair-symbol">
                    {ticker.s.replace("USDT", "")}
                  </span>
                  <span className="pair-base">/USDT</span>
                </td>
                <td className="price-cell">
                  ${parseFloat(ticker.c).toFixed(4)}
                </td>
                <td>
                  <div
                    className={`change-cell ${
                      ticker.P >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {parseFloat(ticker.P).toFixed(2)}%
                  </div>
                </td>
                <td>${parseFloat(ticker.o).toFixed(4)}</td>
                <td>${parseFloat(ticker.c).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
export default Ticker;
 