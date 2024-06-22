"use server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const generateCode = async () => {
  let code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};
export const sendEmail = async (req, res, mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.HOST,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
export const makeOptions = async ({
  quantity,
  symbol,
  limit,
  type,
  quoteOrderQty,
  side,
  stopPrice,
  price,
}) => {
  if (type === "MARKET".toLowerCase()) {
    return quantity === ""
      ? { error: true }
      : { quantity: parseFloat(parseFloat(quantity).toFixed(3)) };
  }
  if (type === "LIMIT".toLowerCase()) {
    if (quantity === "" || price === "") return { error: true };
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
      timeInForce: "GTC",
    };
  }
  if (type === "STOP_LOSS".toLowerCase()) {
    if (quantity === "" || stopPrice === "") return { error: true };

    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
    };
  }
  if (type === "STOP_LOSS_LIMIT".toLowerCase()) {
    if (quantity === "" || price === "" || stopPrice === "")
      return { error: true };

    return {
      timeInForce: "GTC",
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
    };
  }
  if (type === "TAKE_PROFIT".toLowerCase()) {
    if (quantity === "" || stopPrice === "") return { error: true };

    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
    };
  }
  if (type === "TAKE_PROFIT_LIMIT".toLowerCase()) {
    if (quantity === "" || price === "" || stopPrice === "")
      return { error: true };

    return {
      timeInForce: "GTC",
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
    };
  }
  if (type === "LIMIT_MAKER".toLowerCase()) {
    if (quantity === "" || price === "") return { error: true };
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
    };
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const headerList = headers();
    const token = headerList.get("token");
    if (!token)
      return NextResponse.json(
        {
          success: false,
          message: "invalid authorization! please login again",
        },
        { status: 401 }
      );
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.id;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
};
export const getServerTime = async (req, res) => {
  try {
    const resp = await fetch("https://api.binance.com/api/v3/time", {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": process.env.WALLET_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const dt = await resp.json();
    return dt.serverTime;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
};

export const getSpotSymbols = async (req, res) => {
  try {
    const url = "https://api.binance.com/api/v3/exchangeInfo";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": process.env.WALLET_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const d = await response.json();
    if (response.status !== 200) {
      return { error: true, d };
    }
    const symbols = d.symbols;
    return symbols;
  } catch (error) {
    return NextResponse.json({ error });
  }
};
export const getFutureSymbols = async (req, res) => {
  try {
    const url = "https://fapi.binance.com/fapi/v1/exchangeInfo";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": process.env.WALLET_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const d = await response.json();
    return d.symbols;
  } catch (error) {
    return NextResponse.json({ error });
  }
};
function generateTimestamp(serverTime, recvWindow) {
  // Get current time in milliseconds
  var currentTimeMs = new Date().getTime();

  // Adjust your timestamp using the server time
  var adjustedTimestamp =
    serverTime + ((currentTimeMs - serverTime) % recvWindow);

  // Limit the adjusted timestamp to not exceed the maximum recvWindow
  var timestamp = Math.min(adjustedTimestamp, serverTime + recvWindow);

  return timestamp;
}

export const createSpotOrder = async (params, api, secret) => {
  try {
    const serverTime = await getServerTime();
    var recvWindow = 2000; // Maximum recvWindow value
    params.timestamp = serverTime - recvWindow;
    let query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(query)
      .digest("hex");
    query += `&signature=${signature}`;
    const url = "https://api.binance.com/api/v3/order?" + query;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": api,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();
    console.log(data);
    if (response.status === 200) {
      return { data, error: false };
    } else {
      return { message: data.msg, error: true };
    }
  } catch (error) {
    return { error: true, message: error.message };
  }
};
export const createFutureOrder = async (params, api, secret) => {
  try {
    const serverTime = await getServerTime();
    var recvWindow = 2000; // Maximum recvWindow value
    params.timestamp = serverTime - recvWindow;
    let query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(query)
      .digest("hex");
    query += `&signature=${signature}`;
    const url = "https://fapi.binance.com/fapi/v1/order?" + query;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": api,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();
    console.log(data)
    if (response.status === 200) {
      return { data, error: false };
    } else {
      if(data.code === -4164)  return { message: "Order price must be greater than 5UDT", error: true };
      return { message: data.msg || data.message, error: true };
    }
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const createByBitSpotOrder = async (params, api, secret) => {
  try {
    var recvWindow = 5000; // Maximum recvWindow value
    const timestamp = (Date.now() - recvWindow).toString();
    const string = timestamp + api + recvWindow + params;
    const sign = crypto
      .createHmac("sha256", secret)
      .update(string)
      .digest("hex");
    var headers = {
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-SIGN": sign,
      "X-BAPI-API-KEY": api,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow.toString(),
      "Content-Type": "application/json; charset=utf-8",
    };
    const url = "https://api.bybit.com/v2/private/order/create";
    const response = await fetch(url, {
      method: "POST",
      headers,
    });
    const data = await response.json();
    if (response.status === 200) {
      return { data, error: false };
    } else {
      return { message: data.msg || data.message, error: true };
    }
  } catch (error) {
    return { error: true, message: error.message };
  }
};
