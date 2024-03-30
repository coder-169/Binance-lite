// // const BASE_URL = 'https://testnet.binancefuture.com'
// const BASE_URL = 'https://fapi.binance.com'

import crypto from 'crypto';
import { NextResponse } from 'next/server';


function getSignature(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function GET(req, res) {

    try {
        await isAuthenticated(req, res)
        await dbConnect()
        const user = await User.findById(req.user).select('-password')

        if (!user)
            return NextResponse.json({ success: false, message: "user not found" }, { status: 404 })
        const apiKey = user.byBitApiKey;
        const secret = user.byBitSecretKey;
        const recvWindow = '5000';
        const timestamp = Date.now().toString();
        const parameters = {
            accountType: "UNIFIED"
        }
        let url = process.env.BYBIT_BASE + '/v5/asset/transfer/query-account-coins-balance';
        let queryString = Object.keys(parameters).map(key => `${key}=${encodeURIComponent(parameters[key])}`).join('&');
        url = url + '?' + queryString;
        const sign = getSignature(timestamp + apiKey + recvWindow + queryString, secret);
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'X-BAPI-SIGN-TYPE': '2',
                'X-BAPI-SIGN': sign,
                'X-BAPI-API-KEY': apiKey,
                'X-BAPI-TIMESTAMP': timestamp,
                'X-BAPI-RECV-WINDOW': '5000',
                'Content-Type': 'application/json; charset=utf-8'
            },
        })
        const data = await resp.json();
        const assets = data.result.balance.filter(asset => asset.walletBalance > 0)
        return NextResponse.json({ success: true, assets }, { status: 200 })

    } catch (error) {

        return NextResponse.json({ success: false, error }, { status: 200 })
    }
}