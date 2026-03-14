import User from "../models/user.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password || !name) {
      return res.status(400).json({
        success: false,
        data: { message: "All fields are required." },
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: { message: "Email or username already in use." },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      username,
      password: hashedPassword,
      name,
    });

    return res.status(201).json({
      success: true,
      data: { message: "User registered successfully." },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      data: { message: "Internal server error." },
    });
  }
};