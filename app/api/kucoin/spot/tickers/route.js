// const BASE_URL = 'https://testnet.binancefuture.com'
const BASE_URL = 'https://fapi.binance.com'

import dbConnect from "@/app/helpers/db"
import { isAuthenticated } from "@/app/helpers/functions"
import User from "@/app/models/User"
import { Spot } from "@binance/connector"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"
import ccxt from "ccxt"
export async function GET(req, res) {
    try {

       
        const ex = new ccxt.kucoin({
            apiKey: process.env.KU_KEY,
            secret: process.env.KU_SECRET,
            password: process.env.PARAPHRASE,
        })
        const resp = await ex.publicGetMarketAllTickers();
        const tickers = resp.data.ticker.sort((a, b) => {
            if (a.symbol > b.symbol) {
                return 1;
            } else if (a.symbol < b.symbol) {
                return -1;
            } else {
                return 0;
            }
        });

        return NextResponse.json({ success: true, tickers }, { status: 200 })
    } catch (error) {
        console.log(error)
        if (!error.response)
            return NextResponse.json({ success: false, message: error.message }, { status: 500 })

        return NextResponse.json({ success: false, message: error.response.data.msg }, { status: 500 })
    }
}