import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as bcrypt from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        });

        const result = schema.safeParse(credentials);
        if (!result.success) return null;

        const { email, password } = result.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.Password || "");
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
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt" as const,
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
    async session({ session, token, user }) {
      if (token) session.user.id = token.id || user.id;
      if (token) session.user.email = token.email;
      if (token) session.user.name = token.name;
      if (token) session.user.image = token.picture;
      return session;
    },
  },
};
export { authOptions };
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
