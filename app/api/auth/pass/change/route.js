import dbConnect from "@/app/helpers/db"
import { isAuthenticated } from "@/app/helpers/functions"
import User from "@/app/models/User"
import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"

export async function PUT(req, res) {
    try {
        await dbConnect()
        const body = await req.json()
        const { email } = body
        const user = await User.findOne({ email })
        if (!user)
            return NextResponse.json({ success: false, message: 'invalid email! user not found' }, { status: 404 })

        user.password = await bcryptjs.hash(body.password, 10)
        await user.save()
        return NextResponse.json({ success: true, message: "password updated successfully", user }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}