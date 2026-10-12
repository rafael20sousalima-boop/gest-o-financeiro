import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("AUTH ERROR: Missing credentials");
          return null;
        }

        console.log("AUTH: Attempting login for username:", credentials.username);

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          console.log("AUTH ERROR: User not found for username:", credentials.username);
          // Listar todos os usuários para debug
          const allUsers = await prisma.user.findMany({ select: { username: true, ativo: true } });
          console.log("AUTH: All users in database:", allUsers);
          return null;
        }

        if (!user.ativo) {
          console.log("AUTH ERROR: User is inactive:", user.username);
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          console.log("AUTH ERROR: Password mismatch for user:", user.username);
          return null;
        }

        console.log("AUTH SUCCESS: Login successful for user:", user.username);

        return {
          id: user.id,
          name: user.nome || user.username,
          email: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
  pages: {
    signIn: "/login",
    error: "/login"
  },
  trustHost: true
};
