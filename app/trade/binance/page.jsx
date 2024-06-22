"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import AdminLayout from "../../layouts/AdminLayout";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useGlobalContext } from "../../Context";
import axios from "axios";
import { toast } from "react-toastify";
import { makeOptions } from "../../helpers/functions";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Loader from "@/app/components/Loader";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";

function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.number.isRequired,
};

const iOSBoxShadow =
  "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)";

const trades = [
  "market",
  "limit",
  "stop_loss",
  "stop_loss_limit",
  "take_profit",
  "take_profit_limit",
];
const sides = ["buy", "sell"];

const futureTrades = ["market", "limit", "stop", "stop_market"];
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}
function AirbnbThumbComponent(props) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

AirbnbThumbComponent.propTypes = {
  children: PropTypes.node,
};
function valuetext(value) {
  return `${value}x`;
}
export default function FullWidthTabs() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [order, setOrder] = useState({
    symbol: "",
    quantity: "",
    type: "market",
    quoteOrderQty: "",
    side: "",
    user: "",
    stopPrice: "",
    price: "",
    leverage: 1,
  });
  const [coin, setCoin] = useState(null);
  const handleValueChange = (event, newValue) => {
    setOrder({
      symbol: "",
      quantity: "",
      type: "",
      quoteOrderQty: "",
      side: "",
      user: "",
      stopPrice: "",
      price: "",
      callbackRate: "",
    });
    setValue(newValue);
    setCoinData(null);
    setCoin(null);
    setAssets([]);
    setTickerPrice(0);
  };
  const handleChangeLeverage = (event, newValue) => {
    setOrder({ ...order, leverage: newValue });
  };
  const handleChangeIndex = (index) => {
    setValue(index);
    setQueryCoin("");
  };
  
  const [users, setUsers] = useState([]);
  const handleChange = (e) => {
    console.log(e + "here");
    if (
      e.target.name === "type" &&
      e.target.value === "market" &&
      order.symbol !== ""
    ) {
      tickerPriceFounder(order.symbol);
    }
    if (e.target.name === "price" && e.target.value !== "") {
      setOrder({
        ...order,
        quoteOrderQty: (
          parseFloat(order.quantity) * parseFloat(e.target.value)
        ).toString(),
        [e.target.name]: e.target.value,
      });
    } else {
      if (e.target.name === "user") {
        getAssets(e.target.value);
      }

      setOrder({ ...order, [e.target.name]: e.target.value });
    }
  };
  // const [user, setUser] = useState({ role: "admin", isSubscribed: true });
  const { setLoading, user, loading, getUserInfo } = useGlobalContext();
  const [coins, setCoins] = useState([]);
  const [coinData, setCoinData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [futureCoins, setFutureCoins] = useState([]);
  const [allCoins, setAllCoins] = useState([]);
  const [allFutureCoins, setAllFutureCoins] = useState([]);
  const [showCoins, setShowCoins] = useState(false);
  const [showFutureCoins, setShowFutureCoins] = useState(false);
  const [queryCoin, setQueryCoin] = useState("");
  const [inputValue, setInputValue] = React.useState("");

  const [tickerPrice, setTickerPrice] = useState(0);
  const handleCloseCoins = () => {
    setShowCoins(false);
  };
  const handleCoinFilter = (e) => {
    setQueryCoin(e.target.value);
    if (e.target.value === "") {
      setCoins(allCoins);
    } else {
      const newCoins = allCoins.filter((coin) =>
        coin.symbol.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setCoins(newCoins);
    }
  };
  const handleFutureCoinFilter = (e) => {
    setQueryCoin(e.target.value);
    if (e.target.value === "") {
      setFutureCoins(allFutureCoins);
    } else {
      const newCoins = allFutureCoins.filter((coin) =>
        coin.symbol.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFutureCoins(newCoins);
    }
  };
  const getAssets = async (user) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/binance/${trs[value]}/wallet`, {
        headers: {
          token: localStorage.getItem("auth-token"),
          userId: user,
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        if (data.assets.length > 0) {
          setAssets(data.assets);
        }
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const handleSymbolChange = (symbol) => {
    console.log(assets, symbol);
    if (assets.length <= 0) return;
    let coin = undefined;
    if (trs[value] === "spot") {
      coin = coins.find((a) => a.symbol === symbol);
    }
    if (trs[value] === "future") {
      coin = futureCoins.find((a) => a.symbol === symbol);
    }
    if (!coin) return;
    console.log(assets, coin);
    const asset = assets.find((a) => a.asset === coin.baseAsset);

    console.log(asset);
    if (asset) {
      setCoinData(asset);
      console.log(asset);
    }
  };
  const tickerPriceFounder = async (value) => {
    setLoading(true);
    console.log("here");
    handleSymbolChange(value);
    setQueryCoin("");
    setShowCoins(false);
    setCoins(allCoins);
    const asset = coins.find((a) => a.symbol === value);
    console.log(asset);
    setCoin(asset);
    setOrder({
      ...order,
      symbol: value,
    });
    const response = await fetch("/api/binance/ticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        mark: "spot",
      },
      body: JSON.stringify({ ticker: value }),
    });
    const data = await response.json();
    if (data.success) {
      let price = parseFloat(data.tickerPrice);
      setTickerPrice(price);
    }
    setLoading(false);
  };
  const FutureTickerPriceFounder = async (value) => {
    setLoading(true);
    handleSymbolChange(value);
    setQueryCoin("");
    setShowFutureCoins(false);
    setFutureCoins(allFutureCoins);
    const asset = futureCoins.find((a) => a.symbol === value);
    console.log(asset);
    setCoin(asset);
    setOrder({
      ...order,
      symbol: value,
    });
    // setTickerPrice(4)
    const response = await fetch("/api/binance/ticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        mark: "future",
      },
      body: JSON.stringify({ ticker: value }),
    });
    const data = await response.json();
    console.log(data);
    if (data.success) {
      let price = parseFloat(data.tickerPrice);
      setTickerPrice(price);
    }
    setLoading(false);
  };
  const getUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "GET",
        headers: {
          token: localStorage.getItem("auth-token"),
          exchange: "binance",
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        if (data.subscribers.length > 0) {
          const newArray = [...data.subscribers, { username: "All" }];
          console.log(newArray);
          setUsers(newArray);
        }
        setCoins(data.tickers);
        setAllCoins(data.tickers);
        setAllFutureCoins(data.tickersFuture);
        setFutureCoins(data.tickersFuture);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    setLoading(false);
  };
  const specialHandler = (e) => {
    if (order.price !== "") {
      if (e.target.name === "quantity")
        setOrder({
          ...order,
          quantity: e.target.value,
          quoteOrderQty: (
            parseFloat(e.target.value) * parseFloat(order.price)
          ).toString(),
        });
      if (e.target.name === "quoteOrderQty")
        setOrder({
          ...order,
          quoteOrderQty: e.target.value,
          quantity: (
            parseFloat(e.target.value) / parseFloat(order.price)
          ).toString(),
        });
    } else {
      if (e.target.name === "quantity")
        setOrder({
          ...order,
          quantity: e.target.value,
          quoteOrderQty: (parseFloat(e.target.value) * tickerPrice).toString(),
        });
      if (e.target.name === "quoteOrderQty")
        setOrder({
          ...order,
          quoteOrderQty: e.target.value,
          quantity: (parseFloat(e.target.value) / tickerPrice).toString(),
        });
    }
  };
  const customizeOptions = () => {
    const { quantity, quoteOrderQty, stopPrice, price, leverage } = order;
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(2)),
      stopPrice: parseFloat(parseFloat(stopPrice)),
      quoteOrderQty: parseFloat(parseFloat(quoteOrderQty).toFixed(3)),
      leverage: parseFloat(leverage),
    };
  };

  const trs = ["spot", "future"];

  const makeOptions = (order) => {
    const {
      type,
      side,
      symbol,
      quantity,
      quoteOrderQty,
      stopPrice,
      price,
      leverage,
    } = order;
    console.log(order);
    if (symbol === "" || side === "" || type === "") return {};
    if (trs[value] === "future") {
      if (type === "limit") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          timeInForce: "GTC",
          quantity: parseFloat(
            parseFloat(quantity).toFixed(coin.quantityPrecision || 2)
          ),
          price: parseFloat(parseFloat(price).toFixed(coin.pricePrecision)),
          leverage: parseFloat(leverage),
        };
      }
      if (type === "market") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          quantity: parseFloat(
            parseFloat(quantity).toFixed(coin.quantityPrecision || 2)
          ),
          leverage: parseFloat(leverage),
        };
      }
      if (type === "stop_market") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          quantity: parseFloat(
            parseFloat(quantity).toFixed(coin.quantityPrecision || 2)
          ),
          stopPrice: parseFloat(parseFloat(stopPrice)),
          leverage: parseFloat(leverage),
        };
      }
      if (type === "stop") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          quantity: parseFloat(
            parseFloat(quantity).toFixed(coin.quantityPrecision || 2)
          ),
          price: parseFloat(parseFloat(price).toFixed(coin.pricePrecision)),
          stopPrice: parseFloat(parseFloat(stopPrice)),
        };
        // quantity: parseFloat(parseFloat(quantity).toFixed(3)),
        // price: parseFloat(parseFloat(price).toFixed(2)),
        // stopPrice: parseFloat(parseFloat(stopPrice)),
        // quoteOrderQty: parseFloat(parseFloat(quoteOrderQty).toFixed(3)),
        // leverage: parseFloat(leverage),
      }
    } else {
      if (type === "limit") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),

          timeInForce: "GTC",
          quantity: parseFloat(parseFloat(quantity).toFixed(2)),
          price: parseFloat(parseFloat(price).toFixed(2)),
        };
      }
      if (type === "market") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          quantity: parseFloat(parseFloat(quantity).toFixed(2)),
        };
      }
      if (type === "stop_loss" || type === "take_profit") {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          quantity: parseFloat(parseFloat(quantity).toFixed(2)),
          stopPrice: parseFloat(parseFloat(stopPrice)),
        };
        // quantity: parseFloat(parseFloat(quantity).toFixed(3)),
        // price: parseFloat(parseFloat(price).toFixed(2)),
        // stopPrice: parseFloat(parseFloat(stopPrice)),
        // quoteOrderQty: parseFloat(parseFloat(quoteOrderQty).toFixed(3)),
        // leverage: parseFloat(leverage),
      }
      if (
        type === "stop_limit" ||
        type === "stop_loss_limit" ||
        type === "take_profit_limit"
      ) {
        return {
          symbol,
          side: side.toUpperCase(),
          type: type.toUpperCase(),
          timeInForce: "GTC",
          quantity: parseFloat(parseFloat(quantity).toFixed(2)),
          price: parseFloat(parseFloat(price).toFixed(2)),
          stopPrice: parseFloat(parseFloat(stopPrice)),
        };
      }
    }
  };
  const orderHandler = async (e) => {
    e.preventDefault();
    const body = makeOptions(order);
    if (Object.keys(body).length === 0)
      return toast.error("Please fill all fields");
    setLoading(true);

    try {
      let url = `/api/binance/${trs[value]}/order`;
      console.log(body);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("auth-token"),
          user: order.user,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        toast.success(data.message);
        setOrder({
          symbol: "",
          quantity: "",
          type: "",
          quoteOrderQty: "",
          side: "",
          user: "",
          stopPrice: "",
          price: "",
        });
        setTickerPrice(0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AdminLayout>
      <div className="w-full mx-auto">
        <Box
          sx={{
            bgcolor: "background.paper",
            width: "85%",
            height: "85vh",
            margin: "3rem auto",
            overflowY: "scroll",
          }}
        >
          <AppBar position="static" className="sticky top-0 z-[50]">
            <Tabs
              value={value}
              onChange={handleValueChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="SPOT" {...a11yProps(0)} />
              <Tab label="FUTURE" {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <h3 className="text-3xl mt-4 text-center font-medium">Binance</h3>
          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <div value={value} index={0} dir={theme.direction}>
              {loading ? (
                <Loader />
              ) : (
                <div className="w-4/5 mx-auto mt-4">
                  {!loading && users?.length === 0 ? (
                    <div className="h-[50vh] flex items-center justify-center">
                      <h3 className="text-2xl text-gray-600 font-medium">
                        No Subscribers to Start trade
                      </h3>
                    </div>
                  ) : (
                    users && (
                      <form onSubmit={orderHandler} className="mt-4 w-full">
                        <div className="flex sm:flex-row flex-col w-full gap-4 my-8">
                          <div className="w-full sm:w-1/2">
                            <div className="w-full mb-4 sm:mb-8">
                              <FormControl fullWidth>
                                <InputLabel id="user">User *</InputLabel>
                                <Select
                                  labelId="user"
                                  id="user"
                                  label="User"
                                  name="user"
                                  value={order.user}
                                  onChange={handleChange}
                                >
                                  {users.map((user, idx) => {
                                    return (
                                      <MenuItem
                                        key={user.username}
                                        value={user.username}
                                      >
                                        {user.username}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>

                            <div className="w-full mb-2 sm:mb-4 relative">
                              <FormControl fullWidth>
                                {showCoins && (
                                  <div className=" py-.5 flex items-center justify-between !border-none !outline-none w-full z-50">
                                    <TextField
                                      value={queryCoin}
                                      name="query"
                                      placeholder="Search Coin"
                                      className="w-4/5"
                                      onChange={(e) => handleCoinFilter(e)}
                                    />
                                    <button
                                      onClick={() => setShowCoins(false)}
                                      type="button"
                                      className="mr-6 p-2 rounded-lg bg-gray-100"
                                    >
                                      <CloseIcon />
                                    </button>
                                  </div>
                                )}
                                {!showCoins && (
                                  <Button
                                    variant="contained"
                                    onClick={() => setShowCoins(true)}
                                    className="text-black/80 py-[16px] hover:text-white"
                                  >
                                    {coin ? coin.symbol : "--Select Coin--"}
                                  </Button>
                                )}
                                {showCoins && (
                                  <div className="absolute top-16 left-0 bg-[#fff] z-50 shadow-2xl border p-2 rounded-lg border-gray-100 max-h-80 min-h-max overflow-y-scroll w-full">
                                    {coins.length > 0 ? (
                                      coins?.map((symb, idx) => {
                                        return (
                                          <button
                                            key={symb.symbol}
                                            name="symbol"
                                            value={order.symbol}
                                            type="button"
                                            onClick={() =>
                                              tickerPriceFounder(symb.symbol)
                                            }
                                            className="block px-4 py-2 hover:bg-black/10 w-full"
                                          >
                                            {symb.symbol}
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <button
                                        type="button"
                                        className="block px-4 py-2 w-full"
                                      >
                                        No Coins
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/*<Select
                                  labelId="symbol"
                                  id="symbol"
                                  label="Symbol"
                                  name="symbol"
                                  value={order.symbol}
                                  onChange={(e) =>
                                    tickerPriceFounder(e.target.value)
                                  }
                                >
                                  {coins?.map((symb, idx) => {
                                    return (
                                      <MenuItem
                                        key={symb.symbol}
                                        value={symb.symbol}
                                      >
                                        {symb.symbol}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>*/}
                                {tickerPrice ? (
                                  <small className="text-xs block mt-2">
                                    {tickerPrice}
                                  </small>
                                ) : (
                                  ""
                                )}
                              </FormControl>
                            </div>
                            <div className="w-full text-left hidden sm:block mb-4 sm:my-8">
                              <TextField
                                disabled={order.symbol === "" ? true : false}
                                className="!text-white w-3/5 ml-auto !border-white"
                                id="quoteOrderQty"
                                name="quoteOrderQty"
                                label={`Amount(USDT)`}
                                value={order.quoteOrderQty}
                                onChange={specialHandler}
                                // color="white"
                                variant="outlined"
                              />
                              {assets.length
                                ? assets.map((asset) => {
                                    if (asset.asset === "USDT") {
                                      return (
                                        <div key={asset.asset} className="mt-2">
                                          <small className="text-gray-500 text-xs">
                                            {`Available: ${asset.free} ${asset.asset}`}
                                          </small>
                                        </div>
                                      );
                                    }
                                  })
                                : ""}
                            </div>
                            <div className="w-full text-left hidden sm:block mb-6 sm:my-8">
                              <TextField
                                disabled={order.symbol === "" ? true : false}
                                className="!text-white w-3/5 !border-white"
                                id="quantity"
                                name="quantity"
                                label={`Quantity(${
                                  order.symbol !== "" ? order.symbol : "Coin"
                                })`}
                                value={order.quantity}
                                onChange={specialHandler}
                                autoComplete="off"
                                type="number"
                                // color="white"
                                variant="outlined"
                              />{" "}
                              {coinData ? (
                                <div className="mt-2">
                                  <small className="text-gray-500 text-xs">
                                    {`Available: ${coinData.free} ${coinData.asset}`}
                                  </small>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className="w-full sm:w-1/2">
                            <div className="mb-4 sm:mb-8">
                              <FormControl fullWidth>
                                <InputLabel id="side">Action *</InputLabel>
                                <Select
                                  labelId="side"
                                  id="side"
                                  label="Action"
                                  name="side"
                                  value={order.side}
                                  onChange={handleChange}
                                >
                                  {sides.map((side, idx) => {
                                    return (
                                      <MenuItem key={side} value={side}>
                                        {side.toUpperCase()}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>
                            <div className="w-full mb-4 sm:mb-8">
                              <FormControl fullWidth>
                                <InputLabel id="type_id">Type *</InputLabel>
                                <Select
                                  labelId="type_id"
                                  id="type"
                                  label="Type"
                                  name="type"
                                  value={order.type}
                                  onChange={handleChange}
                                >
                                  {trades.map((trade, idx) => {
                                    return (
                                      <MenuItem key={trade} value={trade}>
                                        {trade
                                          .split("_")
                                          .join(" ")
                                          .toUpperCase()}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>

                            {order.type === "market" && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={true}
                                    className="!text-white text-center  !border-white"
                                    id="market"
                                    name="market"
                                    label="Best Market Price"
                                    variant="outlined"
                                  />
                                </FormControl>
                              </div>
                            )}
                            {(order.type === "stop_loss" ||
                              order.type === "stop_market" ||
                              order.type === "stop" ||
                              order.type === "take_profit" ||
                              order.type === "take_profit_limit" ||
                              order.type === "stop_loss_limit") && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={
                                      order.symbol === "" ? true : false
                                    }
                                    className="!text-white text-center  !border-white"
                                    id="stopPrice"
                                    onChange={handleChange}
                                    name="stopPrice"
                                    label="Stop Price"
                                    variant="outlined"
                                    type="number"
                                    value={order.stopPrice}
                                    autoComplete="off"
                                  />
                                </FormControl>
                              </div>
                            )}
                            {(order.type === "limit" ||
                              order.type === "stop_loss_limit" ||
                              order.type === "stop" ||
                              order.type === "take_profit_limit") && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={
                                      order.symbol === "" ? true : false
                                    }
                                    className="!text-white text-center  !border-white"
                                    id="price"
                                    name="price"
                                    label="Price"
                                    variant="outlined"
                                    onChange={handleChange}
                                    type="number"
                                    autoComplete="off"
                                    value={order.price}
                                  />
                                </FormControl>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="sm:w-1/2 w-full flex  gap-8">
                          <div className="w-1/2 block sm:hidden mb-4 sm:my-8">
                            <TextField
                              disabled={order.symbol === "" ? true : false}
                              className="!text-white w-full !border-white"
                              id="quoteOrderQty"
                              name="quoteOrderQty"
                              label={`Amount(USDT)`}
                              value={order.quoteOrderQty}
                              onChange={specialHandler}
                              // color="white"
                              variant="outlined"
                            />
                            {assets.length
                              ? assets.map((asset) => {
                                  if (asset.asset === "USDT") {
                                    return (
                                      <div key={asset.asset} className="mt-2">
                                        <small className="text-gray-500 text-xs">
                                          {`Available: ${asset.free} ${asset.asset}`}
                                        </small>
                                      </div>
                                    );
                                  }
                                })
                              : ""}
                          </div>
                          <div className="w-1/2 block sm:hidden mb-4 sm:my-8">
                            <TextField
                              disabled={order.symbol === "" ? true : false}
                              className="!text-white w-full !border-white"
                              id="quantity"
                              name="quantity"
                              label={`Quantity(${
                                order.symbol !== "" ? order.symbol : "Coin"
                              })`}
                              value={order.quantity}
                              onChange={specialHandler}
                              autoComplete="off"
                              type="number"
                              // color="white"
                              variant="outlined"
                            />{" "}
                            {coinData ? (
                              <div className="mt-2">
                                <small className="text-gray-500 text-xs">
                                  {`Available: ${coinData.free} ${coinData.asset}`}
                                </small>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="w-full my-4 text-center">
                          <Button
                            variant="contained"
                            type="submit"
                            className="tracking-wider  w-3/4 sm:w-1/2 md:w-1/4 bg-blue-400 hover:bg-blue-500 transition-all duration-200"
                            size="large"
                          >
                            Order
                          </Button>
                        </div>
                      </form>
                    )
                  )}
                </div>
              )}
            </div>
            <div value={value} index={1} dir={theme.direction}>
              {loading ? (
                <Loader />
              ) : (
                <div className="w-4/5 mx-auto mt-4">
                  {!loading && users?.length === 0 ? (
                    <div className="h-[50vh] flex items-center justify-center">
                      <h3 className="text-2xl text-gray-600 font-medium">
                        No Subscribers to Start trade
                      </h3>
                    </div>
                  ) : (
                    users && (
                      <form onSubmit={orderHandler} className="mt-4 w-full">
                        <div className="flex sm:flex-row flex-col w-full h gap-4 my-8">
                          <div className="sm:w-1/2 w-full">
                            <div className="w-full mb-4 sm:mb-8">
                              <FormControl fullWidth>
                                <InputLabel id="user">User *</InputLabel>
                                <Select
                                  labelId="user"
                                  id="user"
                                  label="User"
                                  name="user"
                                  value={order.user}
                                  onChange={handleChange}
                                >
                                  {users.map((user, idx) => {
                                    return (
                                      <MenuItem
                                        key={user.username}
                                        value={user.username}
                                      >
                                        {user.username}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>
                            <div className="w-full mb-2 sm:mb-4 relative">
                              <FormControl fullWidth>
                                {showFutureCoins && (
                                  <div className=" py-.5 flex items-center justify-between !border-none !outline-none w-full z-50">
                                    <TextField
                                      value={queryCoin}
                                      name="query"
                                      placeholder="Search Coin"
                                      className="w-4/5"
                                      onChange={(e) =>
                                        handleFutureCoinFilter(e)
                                      }
                                    />
                                    <button
                                      onClick={() => setFutureCoins(false)}
                                      type="type"
                                      className="mr-6 p-2 rounded-lg bg-gray-100"
                                    >
                                      <CloseIcon />
                                    </button>
                                  </div>
                                )}
                                {!showFutureCoins && (
                                  <Button
                                    variant="contained"
                                    onClick={() => setShowFutureCoins(true)}
                                    className="text-black/80 py-[16px] hover:text-white"
                                  >
                                    {coin ? coin.symbol : "--Select Coin--"}
                                  </Button>
                                )}
                                {showFutureCoins && (
                                  <div className="absolute top-16 left-0 bg-[#fff] z-50 shadow-2xl border p-2 rounded-lg border-gray-100 max-h-80 min-h-max overflow-y-scroll w-full">
                                    {futureCoins.length > 0 ? (
                                      futureCoins?.map((symb, idx) => {
                                        return (
                                          <button
                                            key={symb.symbol}
                                            name="symbol"
                                            value={order.symbol}
                                            type="button"
                                            onClick={() =>
                                              FutureTickerPriceFounder(
                                                symb.symbol
                                              )
                                            }
                                            className="block px-4 py-2 hover:bg-black/10 w-full"
                                          >
                                            {symb.symbol}
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <button
                                        type="button"
                                        className="block px-4 py-2 w-full"
                                      >
                                        No Coins
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/*<Select
                                  labelId="symbol"
                                  id="symbol"
                                  label="Symbol"
                                  name="symbol"
                                  value={order.symbol}
                                  onChange={(e) =>
                                    tickerPriceFounder(e.target.value)
                                  }
                                >
                                  {coins?.map((symb, idx) => {
                                    return (
                                      <MenuItem
                                        key={symb.symbol}
                                        value={symb.symbol}
                                      >
                                        {symb.symbol}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>*/}
                                {tickerPrice ? (
                                  <small className="text-xs block mt-2">
                                    {tickerPrice}
                                  </small>
                                ) : (
                                  ""
                                )}
                              </FormControl>
                            </div>
                            <div className="w-full text-left hidden sm:block mb-2 sm:my-4">
                              <TextField
                                disabled={order.symbol === "" ? true : false}
                                className="!text-white w-3/5 !border-white"
                                id="quoteOrderQty"
                                name="quoteOrderQty"
                                label={`Amount(USDT)`}
                                value={order.quoteOrderQty}
                                onChange={specialHandler}
                                // color="white"
                                variant="outlined"
                              />
                              {assets.length
                                ? assets.map((asset) => {
                                    if (asset.asset === "USDT") {
                                      return (
                                        <div key={asset.asset} className="mt-2">
                                          <small className="text-gray-500 text-xs">
                                            {`Available: ${asset.free} ${asset.asset}`}
                                          </small>
                                        </div>
                                      );
                                    }
                                  })
                                : ""}
                            </div>
                            <div className="w-full text-left hidden sm:block mb-2 sm:my-4">
                              <TextField
                                disabled={order.symbol === "" ? true : false}
                                className="!text-white w-3/5 !border-white"
                                id="quantity"
                                name="quantity"
                                label={`Quantity(${
                                  order.symbol !== "" ? order.symbol : "Coin"
                                })`}
                                value={order.quantity}
                                onChange={specialHandler}
                                autoComplete="off"
                                type="number"
                                // color="white"
                                variant="outlined"
                              />{" "}
                              {coinData ? (
                                <div className="mt-2">
                                  <small className="text-gray-500 text-xs">
                                    {`Available: ${coinData.free} ${coinData.asset}`}
                                  </small>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="w-full md:w-1/2 hidden sm:block mb-2 sm:my-4">
                              <Typography>Leverage</Typography>
                              <Slider
                                getAriaLabel={() => "Leverage"}
                                name="leverage"
                                value={order.leverage}
                                onChange={handleChangeLeverage}
                                valueLabelDisplay="auto"
                                getAriaValueText={valuetext}
                                min={1}
                                max={75}
                              />
                            </div>
                          </div>
                          <div className="w-full sm:w-1/2">
                            <div className="w-full mb-4 sm:mb-8">
                              <FormControl fullWidth>
                                <InputLabel id="side">Action *</InputLabel>
                                <Select
                                  labelId="side"
                                  id="side"
                                  label="Action"
                                  name="side"
                                  value={order.side}
                                  onChange={handleChange}
                                >
                                  {sides.map((side, idx) => {
                                    return (
                                      <MenuItem key={side} value={side}>
                                        {side === "buy"
                                          ? side?.toUpperCase() + " / LONG"
                                          : side?.toUpperCase() + " / SHORT"}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>
                            <div className="w-full mb-2 sm:mb-4">
                              <FormControl fullWidth>
                                <InputLabel id="type_id">Type *</InputLabel>
                                <Select
                                  labelId="type_id"
                                  id="type"
                                  label="Type"
                                  name="type"
                                  value={order.type}
                                  onChange={handleChange}
                                >
                                  {futureTrades.map((trade, idx) => {
                                    return (
                                      <MenuItem key={trade} value={trade}>
                                        {trade
                                          .split("_")
                                          .join(" ")
                                          .toUpperCase()}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            </div>
                            {order.type === "market" && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={true}
                                    className="!text-white text-center  !border-white"
                                    id="market"
                                    name="market"
                                    label="Best Market Price"
                                    variant="outlined"
                                  />
                                </FormControl>
                              </div>
                            )}
                            {(order.type === "stop" ||
                              order.type === "stop_market") && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={
                                      order.symbol === "" ? true : false
                                    }
                                    className="!text-white text-center  !border-white"
                                    id="stopPrice"
                                    onChange={handleChange}
                                    name="stopPrice"
                                    label="Stop Price"
                                    variant="outlined"
                                    type="number"
                                    value={order.stopPrice}
                                    autoComplete="off"
                                  />
                                </FormControl>
                              </div>
                            )}
                            {(order.type === "limit" ||
                              order.type === "stop") && (
                              <div className="w-full mb-4 sm:mb-8">
                                <FormControl fullWidth>
                                  <TextField
                                    disabled={
                                      order.symbol === "" ? true : false
                                    }
                                    className="!text-white text-center  !border-white"
                                    id="price"
                                    name="price"
                                    label="Price"
                                    variant="outlined"
                                    onChange={handleChange}
                                    type="number"
                                    autoComplete="off"
                                    value={order.price}
                                  />
                                </FormControl>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="sm:w-1/2 w-full flex gap-8">
                          <div className="w-1/2 block sm:hidden mb-4 sm:my-8">
                            <TextField
                              disabled={order.symbol === "" ? true : false}
                              className="!text-white w-full !border-white"
                              id="quoteOrderQty"
                              name="quoteOrderQty"
                              label={`Amount(USDT)`}
                              value={order.quoteOrderQty}
                              onChange={specialHandler}
                              // color="white"
                              variant="outlined"
                            />
                            {assets.length
                              ? assets.map((asset) => {
                                  if (asset.asset === "USDT") {
                                    return (
                                      <div key={asset.asset} className="mt-2">
                                        <small className="text-gray-500 text-xs">
                                          {`Available: ${asset.free} ${asset.asset}`}
                                        </small>
                                      </div>
                                    );
                                  }
                                })
                              : ""}
                          </div>
                          <div className="w-1/2 block sm:hidden mb-4 sm:my-8">
                            <TextField
                              disabled={order.symbol === "" ? true : false}
                              className="!text-white w-full !border-white"
                              id="quantity"
                              name="quantity"
                              label={`Quantity(${
                                order.symbol !== "" ? order.symbol : "Coin"
                              })`}
                              value={order.quantity}
                              onChange={specialHandler}
                              autoComplete="off"
                              type="number"
                              // color="white"
                              variant="outlined"
                            />
                            {coinData ? (
                              <div className="mt-2">
                                <small className="text-gray-500 text-xs">
                                  {`Available: ${coinData.free} ${coinData.asset}`}
                                </small>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-1/2 block sm:hidden mb-4 sm:my-8">
                          <Slider
                            getAriaLabel={() => "Temperature range"}
                            value={order.leverage}
                            onChange={handleChangeLeverage}
                            valueLabelDisplay="auto"
                            getAriaValueText={valuetext}
                            min={1}
                            max={75}
                          />
                        </div>
                        <div className="w-full my-4 text-center">
                          <Button
                            variant="contained"
                            type="submit"
                            className="tracking-wider w-3/4 sm:w-1/2 md:w-1/4 mx-auto bg-blue-400 hover:bg-blue-500 transition-all duration-200"
                            size="large"
                          >
                            Order
                          </Button>
                        </div>
                      </form>
                    )
                  )}
                </div>
              )}
            </div>
          </SwipeableViews>
        </Box>
      </div>
    </AdminLayout>
  );
}
