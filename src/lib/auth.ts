import { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { redis } from "./rate-limit";
import { sendVerificationEmail } from "./nodemailer";

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.isConfirmed) {
          const token = randomBytes(32).toString("hex");

          const isExistToken = await redis.get(
            `email-verification-user:${user.email}`,
          );

          if (isExistToken) {
            throw new Error("EMAIL_NOT_CONFIRMED");
          } else {
            await redis.set(`email-verification:${token}`, user.email, {
              ex: 600,
            });

            await redis.set(`email-verification-user:${user.email}`, token, {
              ex: 600,
            });

            await sendVerificationEmail(user.email, token, user.language);
            throw new Error("EMAIL_NOT_CONFIRMED");
          }
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          companyName: user.companyName,
          language: user.language,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.phone = user.phone;
        token.companyName = user.companyName;
        token.language = user.language;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        phone: token.phone as string,
        companyName: token.companyName as string,
        language: token.language as "uk" | "en",
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
