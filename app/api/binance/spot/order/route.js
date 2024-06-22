import dbConnect from "@/app/helpers/db";
import {
  createSpotOrder,
  isAuthenticated,
  makeOptions,
} from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Get Open Orders
export async function GET(req, res) {
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

    const user = await User.findOne({ username: body.user }).select(
      "-password"
    );
    if (!user)
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );

    const client = new Spot(user.api, user.secret);

    const { data } = await client.account();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, res) {
  try {
    const body = await req.json();
    console.log(body);
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
    let order = null;
    if (!user)
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );
    let users = headerList.get("user");
    console.log(users);
    if (users === "All") {
      const userArray = await User.find({ binanceSubscribed: true }).select(
        "-password"
      );
      for (let i = 0; i < userArray.length; i++) {
        const us = userArray[i];
        const client = new Spot(us.binanceApiKey, us.binanceSecretKey);
        const { symbol, type, side } = body;
        const options = await makeOptions(body);
        await client.newOrder(symbol, side, type, options);
      }
    } else {
      const user = await User.findOne({ username: users }).select("-password");
      if (!user)
        return NextResponse.json(
          { success: false, message: "user not found" },
          { status: 404 }
        );
      if (!user.binanceSubscribed)
        return NextResponse.json(
          { success: false, message: "Sorry you are not subscribed" },
          { status: 400 }
        );
      order = await createSpotOrder(body, user.binanceApiKey, user.binanceSecretKey);
      console.log(order);
      if (order.error) {
        return NextResponse.json(
          { success: false, message: order.message },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { success: true, message: "order created successfully", order },
      { status: 200 }
    );
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
