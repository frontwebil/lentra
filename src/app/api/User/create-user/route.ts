import prisma from "@/lib/prisma";
import { redis } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const { name, surname, email, password, language } = await req.json();

  const isExistEmail = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (isExistEmail) {
    return NextResponse.json(
      {
        message: "EMAIL_ALREADY_EXISTS",
      },
      {
        status: 409,
      },
    );
  }

  try {
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { message: "Name must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (!surname || surname.trim().length < 3) {
      return NextResponse.json(
        { message: "Surname must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        firstName: name,
        lastName: surname,
        email,
        password: hashedPassword,
      },
    });

    const token = randomBytes(32).toString("hex");

    const key = `email-verification:${token}`;

    await redis.set(key, email, {
      ex: 600,
    });

    await sendVerificationEmail(email, token, language);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
