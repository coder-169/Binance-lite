import dbConnect from "@/app/helpers/db";
import User from "@/app/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export async function GET(req, res) {
  try {
    const headerList = headers();
    await dbConnect();
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
    if (user.role !== "admin")
      return NextResponse.json(
        { success: false, message: "role not authorized" },
        { status: 400 }
      );
    const users = await User.find({}).select("-password");
    const newUsers = users.filter((user) => user._id.toString() !== data.id);
    return NextResponse.json(
      { success: true, message: "users found", users: newUsers },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 200 }
    );
  }
}
