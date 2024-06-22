// // const BASE_URL = 'https://testnet.binancefuture.com'
// const BASE_URL = 'https://fapi.binance.com'

import dbConnect from "@/app/helpers/db";
import User from "@/app/models/User";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import ccxt from "ccxt";

function getSignature(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export async function GET(req, res) {
  try {
    const headerList = headers();
    const token = headerList.get("token");
    const userId = headerList.get("userId");
    if (userId) {
      const user = await User.findOne({ username: userId }).select("-password");
      if (!user)
        return NextResponse.json(
          { success: false, message: "user not found" },
          { status: 404 }
        );
      if (!user.byBitSubscribed)
        return NextResponse.json(
          { success: false, message: "user not subscribed" },
          { status: 400 }
        );

      const apiKey = user.byBitApiKey;
      const secret = user.byBitSecretKey;
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
      const data = await exchange.privateGetV5AccountWalletBalance({
        accountType: "UNIFIED",
      });
      const assets = data.result.list[0].coin;
      console.log(assets);
      return NextResponse.json({ success: true, assets }, { status: 200 });
    }
    await dbConnect();
    if (!token)
      return NextResponse.json(
        {
          success: false,
          message: "invalid authorization! please login again",
        },
        { status: 401 }
      );
    const da = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(da.id).select("-password");
    if (!user)
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );
    if (!user.byBitSubscribed)
      return NextResponse.json(
        { success: false, message: "user not subscribed" },
        { status: 400 }
      );

    const apiKey = user.byBitApiKey;
    const secret = user.byBitSecretKey;
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
    const data = await exchange.privateGetV5AccountWalletBalance({
      accountType: "UNIFIED",
    });
    const assets = data.result.list[0].coin
    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
