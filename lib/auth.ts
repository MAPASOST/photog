import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        if (credentials.username !== ADMIN_USERNAME) return null;

        const plain = process.env.ADMIN_PASSWORD;
        let valid = false;

        if (ADMIN_PASSWORD_HASH) {
          valid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH);
        } else if (plain) {
          valid = credentials.password === plain;
        }

        if (!valid) return null;
        return { id: "admin", name: "Admin", email: "admin@photog.local" };
      },
    }),
  ],
  pages: {
    signIn: "/admin",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
