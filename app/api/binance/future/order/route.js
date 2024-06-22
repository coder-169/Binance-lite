import dbConnect from "@/app/helpers/db";
import { createFutureOrder, isAuthenticated } from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import ccxt from "ccxt";

const customizeOptions = (body) => {
  const { type, side, symbol, options, quantity, price } = body;

  if (type === "MARKET".toLocaleLowerCase()) {
    return {
      orderid: Date.now() + 2,
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      type,
    };
  }
  if (type === "LIMIT".toLocaleLowerCase()) {
    return {
      orderid: Date.now() + 2,
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      timeInForce: "GTC",
      type,
    };
  }
  if (type === "STOP".toLocaleLowerCase()) {
    return {
      orderid: Date.now() + 2,
      quantity: parseFloat(parseFloat(quantity).toFixed(3)),
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
      price: parseFloat(parseFloat(price).toFixed(3)),
      side,
      symbol,
      timestamp: Date.now(),
      type,
    };
  }
  if (type === "STOP_MARKET".toLocaleLowerCase()) {
    return {
      orderid: Date.now() + 2,
      stopPrice: parseFloat(parseFloat(stopPrice).toFixed(3)),
    };
  }
  if (type === "TRAILING_STOP_MARKET".toLocaleLowerCase()) {
    return {
      orderid: Date.now() + 2,
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
  try {
    const body = await req.json();
    const headerList = headers();
    await dbConnect();
    const token = headerList.get("token");
    let order = null;
    if (!token)
      return NextResponse.json(
        {
          success: false,
          message: "invalid authorization! please login again",
        },
        { status: 401 }
      );
    const users = headerList.get("user");
    if (users === "All") {
      const userArray = await User.find({ binanceSubscribed: true }).select(
        "-password"
      );
      let errMessage = "";
      let order = null
      for (let i = 0; i < userArray.length; i++) {
        let us = userArray[i];
        order = await createFutureOrder(
          body,
          us.binanceApiKey,
          us.binanceSecretKey
        );
        if (order.error) {
          errMessage += us.username + "'s " + order.message + "\n";
        }
      }
      if (order?.error) {
        return NextResponse.json(
          { success: false, message: errMessage },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: true, message: "orders created successfully" },
          { status: 200 }
        );
      }
    } else {
      const user = await User.findOne({ username: users }).select("-password");
      order = await createFutureOrder(
        body,
        user.binanceApiKey,
        user.binanceSecretKey
      );
      if (order.error) {
        return NextResponse.json(
          { success: false, message: order.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: true, message: "order created successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    // console.log(error.response)
    if (!error.response)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    return NextResponse.json(
      { success: false, message: error.response.data.msg },
      { status: 500 }
    );
  }
}
