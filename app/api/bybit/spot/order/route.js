import dbConnect from "@/app/helpers/db";
import { createByBitSpotOrder, isAuthenticated } from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
const BASE_URL = "https://fapi.binance.com";
import { RestClientV5 } from "bybit-api";
import ccxt from "ccxt";
import axios from "axios";

const customizeOptions = (body) => {
  const { type, side, symbol, price, callbackRate, quantity } = body;
  if (type === "market") {
    console.log("here");
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      type,
    };
  }
  if (type === "limit") {
    console.log("here");
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      timeInForce: "GTC",
      type,
    };
  }
  if (type === "stop") {
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      type,
    };
  }
  if (type === "stop_market") {
    return { stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)) };
  }
  if (type === "trailing_stop_market") {
    return {
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      callbackRate: parseFloat(parseFloat(callbackRate).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      type,
    };
  }
};

export async function POST(req, res) {
  // 80fNrSDmS1TJTZK7IA
  // 1TBrzDsfe39yRaviJs2O2pJDEBFDyIZV8P3Y
  try {
    const headerList = headers();
    const token = headerList.get("token");
    await dbConnect();
    if (!token)
      return NextResponse.json(
        {
          success: false,
          message: "invalid authorization! please login again",
        },
        { status: 401 }
      );
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id).select("-password");
    if (!user)
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );

    const body = await req.json();
    const users = body.user;
    let order = null;
    console.log(body);
    if (users === "All") {
      const userArray = await User.find({ byBitSubscribed: true }).select(
        "-password"
      );
      for (let i = 0; i < userArray.length; i++) {
        const us = userArray[i];
        const apiKey = us.byBitApiKey;
        const secret = us.byBitSecretKey;
        const exchange = new ccxt.bybit({
          apiKey,
          secret,
          enableRateLimit: true,
          urls: {
            api: {
              public: "https://api.bybit.com",
              private: "https://api.bybit.com",
            },
          },
        });
        let options = customizeOptions(body);
        options.category = "spot";
        const {
          symbol,
          type,
          side,
          slLimitPrice,
          stopLoss,
          quantity,
          amount,
          price,
        } = body;
        let newType = "";
        if (type === "stop_loss") {
          if (slLimitPrice > 0) {
            newType = "limit";
          } else {
            newType = "market";
          }
          order = await exchange.createOrder(
            symbol,
            newType,
            side,
            quantity,
            price,
            { category: "spot", slLimitPrice, stopLoss, slOrderType: newType }
          );
          console.log(order);
        }   
        if (type === "market") {
          order = await exchange.createOrder(
            symbol,
            type,
            side,
            quantity,
            0,
            {
              category: "spot",
            }
          );
        } else {
          order = await exchange.createOrder(
            symbol,
            type,
            side,
            quantity,
            price,
            { category: "spot" }
          );
        }
        console.log(order)
      }
      return NextResponse.json(
        { success: true, message: "orders created successfully" },
        { status: 200 }
      );
    } else {
      const user = await User.findOne({ username: body.user }).select(
        "-password"
      );
      if (!user.byBitSubscribed)
        return NextResponse.json(
          { success: false, message: "user not found" },
          { status: 404 }
        );
      const apiKey = process.env.BYBIT_API_KEY;
      const secret = process.env.BYBIT_SECRET_KEY;
      const exchange = new ccxt.bybit({
        apiKey,
        secret,
        enableRateLimit: true,
        urls: {
          api: {
            public: "https://api.bybit.com",
            private: "https://api.bybit.com",
          },
        },
      });
      const {
        symbol,
        type,
        side,
        quantity,
        price,
        stopLoss,
        slLimitPrice,
        takeProfit,
      } = body;
      console.log(body);
      body.category = "spot";
      let newType = "";
      if (type === "stop_loss") {
        if (slLimitPrice > 0) {
          newType = "limit";
        } else {
          newType = "market";
        }
        order = await exchange.createOrder(
          symbol,
          newType,
          side,
          quantity,
          price,
          { category: "spot", slLimitPrice, stopLoss, slOrderType: newType }
        );
        console.log(order);
      }
      if (type === "market") {
        order = await exchange.createOrder(symbol, type, side, quantity, null, {
          category: "spot",
        });
      } else {
        order = await exchange.createOrder(
          symbol,
          type,
          side,
          quantity,
          price,
          { category: "spot" }
        );
      }

      if (!order) {
        return NextResponse.json(
          { success: false, message: "order not created" },
          { status: 400 }
        );
      }
    }
    console.log(order);
    return NextResponse.json(
      { success: true, message: "order created successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
