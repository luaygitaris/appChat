// lib/auth.ts

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials);
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        });

        const result = schema.safeParse(credentials);
        if (!result.success) {
          console.log("Validation failed");
          return null;
        }

        const { email, password } = result.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log("No user found for email:", email);
          return null;
        }
        console.log("User found:", user);

        const isValid = await bcrypt.compare(password, user.Password || "");
        if (!isValid) {
          console.log("Password mismatch");
          return null;
        }
        return isValid ? user : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
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
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.picture as string,
        };
      }
      return session;
    },
  },
};
