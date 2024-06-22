
import { NextResponse } from "next/server"
import { Spot } from "@binance/connector"
import User from "@/app/models/User"
import dbConnect from "@/app/helpers/db"
import { isAuthenticated } from "@/app/helpers/functions"
import ccxt from "ccxt"

// Get Open Orders
export async function POST(req, res) {
    try {
        const headerList = headers()
        const token = headerList.get('token')
        await dbConnect()
        if (!token)
            return NextResponse.json({ success: false, message: "invalid authorization! please login again" }, { status: 401 })
        const data = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await User.findById(data.id).select('-password');
        if (!user)
        return NextResponse.json({ success: false, message: "user not found" }, { status: 404 })
        const body = await req.json()
        // const client = new Spot(process.env.ORIG_WALLET_API_KEY, process.env.ORIG_WALLET_SECRET_KEY)
        if (body.exchange === 'kucoin') {
            const ex = new ccxt.kucoin({
                apiKey: process.env.KU_KEY,
                secret: process.env.KU_SECRET,
                password: process.env.PARAPHRASE,
            })
            const resp = await ex.publicGetMarkPriceSymbolCurrent({ symbol: body.ticker });
            return NextResponse.json({ success: true, message: 'ticker price found', resp }, { status: 200 })
        }
        if (body.exchange === 'binance') {
            const client = new Spot(process.env.WALLET_API_KEY, process.env.WALLET_SECRET_KEY, { baseURL: "https://testnet.binance.vision" })
            if (!client)
                return NextResponse.json({ success: false, message: 'client not created' })

            const { data } = await client.tickerPrice(body.ticker)
            return NextResponse.json({ success: true, message: 'ticker price found', tickerPrice: data.price }, { status: 200 })

        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}