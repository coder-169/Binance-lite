// const BASE_URL = 'https://testnet.binancefuture.com'

import dbConnect from "@/app/helpers/db";
import { isAuthenticated } from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import ccxt from "ccxt";

function sign(text, secret, outputType = "base64") {
  return crypto.createHmac("sha256", secret).update(text).digest(outputType);
}

export async function GET(req, res) {
  try {
    const headerList = headers();
    const token = headerList.get("token");
    const userId = headerList.get("userId");
    await dbConnect();
    if (userId) {
      const user = await User.findOne({ username: userId }).select("-password");
      if (!user)
        return NextResponse.json(
          { success: false, message: "user not found" },
          { status: 404 }
        );
      if (!user.kuCoinSubscribed)
        return NextResponse.json(
          { success: false, message: "Sorry he is not subscribed" },
          { status: 400 }
        );
      const ex = new ccxt.kucoin({
        apiKey: user.kuCoinApiKey,
        secret: user.kuCoinSecretKey,
        password: user.kuCoinPassphrase,
      });
      const response = await ex.fetchBalance();
      console.log( response.info.data)
      return NextResponse.json(
        {
          success: true,
          message: "wallet found successfully",
          assets: response.info.data,
        },
        { status: 200 }
      );
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
    if (!user.kuCoinSubscribed)
      return NextResponse.json(
        { success: false, message: "Sorry you are not subscribed" },
        { status: 400 }
      );
    console.log(user.kuCoinApiKey, user.kuCoinPassphrase, user.kuCoinSecretKey);
    const ex = new ccxt.kucoin({
      apiKey: user.kuCoinApiKey,
      secret: user.kuCoinSecretKey,
      password: user.kuCoinPassphrase,
    });
    const response = await ex.fetchBalance();
    return NextResponse.json(
      {
        success: true,
        message: "wallet found successfully",
        assets: response.info.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
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
