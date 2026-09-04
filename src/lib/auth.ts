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

            await sendVerificationEmail(user.email, token, "uk");
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
          name: user.firstName,
          lastName: user.lastName,
          email: user.email,
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
        token.name = user.name;
        token.email = user.email;
        token.lastName = user.lastName;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: token.email,
        lastName: token.lastName as string,
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
