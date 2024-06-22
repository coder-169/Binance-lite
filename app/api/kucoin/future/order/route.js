
import dbConnect from "@/app/helpers/db";
import { isAuthenticated } from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import ccxt from "ccxt";
export async function POST(req, res) {
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
    const user = await User.findOne(data.user).select("-password");
    const body = await req.json();
    let order = null;
    const users = body.user;
    if (users === "All") {
      const userArray = await User.find({ byBitSubscribed: true }).select(
        "-password"
      );
      if (!userArray)
        return NextResponse.json(
          { success: false, message: "users not found" },
          { status: 404 }
        );
        console.log(body)
      for (let i = 0; i < userArray.length; i++) {
        const us = userArray[i];
        const ex = new ccxt.kucoinfutures({
          apiKey: us.kuCoinApiKey,
          secret: us.kuCoinSecretKey,
          password: us.kuCoinPassphrase,
        });
        const { symbol, type, side, quantity, price } = body;
        let coin = symbol.split("-").join("/");
        order = await ex.createOrder(coin, type, side, quantity, price, body);
      }
      return NextResponse.json(
        { success: true,order, message: "order created successfully" },
        { status: 200 }
      );
    } else {
      const user = await User.findOne({ username: body.user }).select(
        "-password"
      );
      if (!user.kuCoinSubscribed)
        return NextResponse.json({ success: false }, { status: 400 });
      // console.log(user.api)
      const ex = new ccxt.kucoinfutures({
        apiKey: user.kuCoinApiKey,
        secret: user.kuCoinSecretKey,
        password: user.kuCoinPassphrase,
      });
      const { symbol, type, side, quantity, price } = body;
      let coin = symbol.split("-").join("/");
      const order = await ex.createOrder(
        coin,
        type,
        side,
        quantity,
        price,
        body
      );
      return NextResponse.json(
        { success: true, message: "order created successfully", order },
        { status: 200 }
      );
    }
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
