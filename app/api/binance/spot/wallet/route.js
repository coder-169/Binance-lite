// const BASE_URL = 'https://testnet.binancefuture.com'
const BASE_URL = "https://fapi.binance.com";

import dbConnect from "@/app/helpers/db";
import { getServerTime, isAuthenticated } from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import ccxt from "ccxt";
export async function GET(req, res) {
  try {
    const headerList = headers();
    const token = headerList.get("token");
    const userId = headerList.get("userId");
    await dbConnect();
    console.log(token)
    if (userId) {
      const user = await User.findOne({ username: userId }).select("-password");
      if (!user)
        return NextResponse.json(
          { success: false, message: "user not found" },
          { status: 404 }
        );
      if (!user.binanceSubscribed)
        return NextResponse.json(
          { success: false, message: "user not subscribed " },
          { status: 400 }
        );
      const serverTime = await getServerTime();
      var recvWindow = 2000; // Maximum recvWindow value
      const params = { timestamp: serverTime - recvWindow };
      let query = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      const signature = crypto
        .createHmac("sha256", process.env.WALLET_SECRET_KEY)
        .update(query)
        .digest("hex");
      query += `&signature=${signature}`;
      const url = "https://api.binance.com/api/v3/account?" + query;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": process.env.WALLET_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const d = await response.json();
      console.log(d.balances[0]);
      // /api/v3/account
      const assets = d.balances;
      return NextResponse.json({ success: true, assets }, { status: 200 });
    }
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
    if (!user.binanceSubscribed)
      return NextResponse.json({ success: false }, { status: 400 });
    const serverTime = await getServerTime();
    var recvWindow = 2000; // Maximum recvWindow value
    const params = { timestamp: serverTime - recvWindow };
    let query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const signature = crypto
      .createHmac("sha256", process.env.WALLET_SECRET_KEY)
      .update(query)
      .digest("hex");
    query += `&signature=${signature}`;
    const url = "https://api.binance.com/api/v3/account?" + query;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": process.env.WALLET_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const d = await response.json();
    // /api/v3/account
    const assets = d?.balances?.filter(
      (asset) => parseInt(asset.free) + parseInt(asset.locked) > 0
    );
    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch (error) {
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
