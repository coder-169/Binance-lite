import dbConnect from "@/app/helpers/db";
import {
  getExchangeInfo,
  getFutureSymbols,
  getSpotSymbols,
  isAuthenticated,
} from "@/app/helpers/functions";
import User from "@/app/models/User";
import { Spot } from "@binance/connector";
import ccxt from "ccxt";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export async function GET(req, res) {
  try {
    await dbConnect();
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
    const user = await User.findById(data.id).select("-password");
    if (!user)
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );
    if (user.role !== "admin")
      return NextResponse.json(
        { success: false, message: "role not authorized" },
        { status: 400 }
      );
    let subscribers = [];
    const ex = headerList.get("exchange");
    let tickers = [];
    let tickersFuture = [];

    let coins;
    let coinsFuture;
    if (ex === "kucoin") {
      subscribers = await User.find({ kuCoinSubscribed: true });
      if (subscribers?.length > 0) {
        const exc = new ccxt.kucoin({
          apiKey: process.env.KU_KEY,
          secret: process.env.KU_SECRET,
          password: process.env.PARAPHRASE,
        });
        const excfuc = new ccxt.kucoinfutures({
          apiKey: process.env.KU_KEY,
          secret: process.env.KU_SECRET,
          password: process.env.PARAPHRASE,
        });
        const resp = await exc.publicGetMarketAllTickers();
        const respf = await excfuc.futuresPublicGetContractsActive();
        tickers = resp.data.ticker
        tickersFuture = respf.data
      }
    }
    if (ex === "binance") {
      subscribers = await User.find({ binanceSubscribed: true });
      if (subscribers?.length > 0) {
        const ex = new ccxt.binance({
          apiKey: user.api,
          secret: user.secret,
        });
        tickers = await getSpotSymbols();
        if (tickers.error) {
          return NextResponse.json(
            { success: false, d: tickers.d },
            { status: 402 }
          );
        }
        tickersFuture = await getFutureSymbols();
        
      }
    }
    if (ex === "bybit") {
      subscribers = await User.find({ byBitSubscribed: true });
      if (subscribers?.length > 0) {
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
        const respp = await exchange.publicGetV5MarketTickers({
          category: "spot",
        });
        const resp = await exchange.publicGetV5MarketTickers({
          category: "linear",
        });
        tickersFuture = resp.result.list
        tickers =respp.result.list;
      }
    }
    return NextResponse.json(
      {
        tickers,
        tickersFuture,
        success: true,
        message: "subscribers found successfully",
        subscribers,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
