
import dbConnect from "@/app/helpers/db"
import { isAuthenticated } from "@/app/helpers/functions"
import User from "@/app/models/User"
import { Spot } from "@binance/connector"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"
import ccxt from "ccxt"
export async function POST(req, res) {
    try {
        const apiKey = process.env.BYBIT_API_KEY;
        const secret = process.env.BYBIT_SECRET_KEY;
        const headerList = headers()
        const mark = headerList.get("mark")

        const body = await req.json()
        const exchange = new ccxt.bybit({
            apiKey, secret, enableRateLimit: true, urls: {
                api: {
                    public: "https://api.bybit.com",
                    private: "https://api.bybit.com",
                },
            },
        })
        if (mark === "spot") {
            const resp = await exchange.publicGetSpotV3PublicQuoteTickerPrice({ symbol: body.ticker, category: "spot" });
            const tickerPrice = resp.result.price;
            return NextResponse.json({ success: true, tickerPrice, }, { status: 200 })
        } else {
            // const resp = await exchange.publicGetV5MarketTickers();
            const resp = await exchange.publicGetDerivativesV3PublicTickers({ symbol: body.ticker, category: "linear" });
            const tickerPrice = resp.result.list[0].lastPrice;
            return NextResponse.json({ success: true, tickerPrice, }, { status: 200 })
        }


    } catch (error) {
        if (!error.response)
            return NextResponse.json({ success: false, message: error.message }, { status: 500 })

        return NextResponse.json({ success: false, message: error.response.data.msg }, { status: 500 })
    }
}