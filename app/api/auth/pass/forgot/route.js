
import dbConnect from "@/app/helpers/db"
import { generateCode, isAuthenticated, sendEmail } from "@/app/helpers/functions"
import User from "@/app/models/User"
import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req, res) {
    try {
        await dbConnect()
        const body = await req.json()
        const { email } = body
        if (!email)
            return NextResponse.json({ success: false, message: 'invalid email!' }, { status: 400 })
        const user = await User.findOne({ email });
        if (!user)
            return NextResponse.json({ success: false, message: 'user not found' }, { status: 404 })
        let code = await generateCode()
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            // to: 'info@mawsool.tech',
            subject: `Forgot Password Code`,
            text: `Hey ${user.username}, \n\n Here is your code for password forget this will expire in 10 minutes\n ${code}`,
        }
        sendEmail(req, res, mailOptions)
        return NextResponse.json({ success: true, message: 'mail sent', code })
    } catch (error) {
        return NextResponse.json({ success: true, message: error.message }, { status: 500 })
    }
}