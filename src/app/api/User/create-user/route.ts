import prisma from "@/lib/prisma";
import { redis } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");

    if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { phone, companyName, email, password, language } = await req.json();

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { message: "Phone is required" },
        { status: 400 },
      );
    }

    if (
      !companyName ||
      typeof companyName !== "string" ||
      companyName.trim().length < 3
    ) {
      return NextResponse.json(
        {
          message: "Company name must be at least 3 characters",
        },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters",
        },
        { status: 400 },
      );
    }

    if (language !== "uk" && language !== "en") {
      return NextResponse.json(
        { message: "Invalid language" },
        { status: 400 },
      );
    }

    const normalizedPhone = phone.trim();
    const normalizedCompanyName = companyName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const isExistEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    const isExistPhone = await prisma.user.findUnique({
      where: {
        phone: phone.trim(),
      },
    });

    if (isExistEmail) {
      return NextResponse.json(
        {
          message: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 },
      );
    }

    if (isExistPhone) {
      return NextResponse.json(
        {
          message: "PHONE_ALREADY_EXISTS",
        },
        { status: 408 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        companyName: normalizedCompanyName,
        email: normalizedEmail,
        password: hashedPassword,
        language,
      },
    });

    try {
      const token = randomBytes(32).toString("hex");

      const key = `email-verification:${token}`;

      await redis.set(key, normalizedEmail, {
        ex: 600,
      });

      await sendVerificationEmail(normalizedEmail, token, language);
    } catch (error) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      throw error;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
