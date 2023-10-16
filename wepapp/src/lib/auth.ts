import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import { prisma } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials'
// import { utils } from 'ethers'
import { SiweMessage } from "siwe";
import { getCsrfToken } from "next-auth/react";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    credits: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token }) => {
      const db_user = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });
      if (db_user) {
        token.id = db_user.id;
        token.credits = db_user.credits;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.sub;
        session.user.email = token.sub;
        session.user.image = token.picture;
        session.user.credits = token.credits;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: PrismaAdapter(prisma),
  providers:  [
    CredentialsProvider({
      id: "web3",
      name: "web3",
      credentials: {
        message: { label: "Message", type: "text" },
        signedMessage: { label: "Signed Message", type: "text" }, // aka signature
      },
      async authorize(credentials, req) {
        console.log("\n\nHIT", credentials)
        if (!credentials?.signedMessage || !credentials?.message) {
          return null;
        }

        try {
          // On the Client side, the SiweMessage()
          // will be constructed like this:
          //
          // const siwe = new SiweMessage({
          //   address: address,
          //   statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
          //   nonce: await getCsrfToken(),
          //   expirationTime: new Date(Date.now() + 2*60*60*1000).toString(),
          //   chainId: chain?.id
          // });

          const siwe = new SiweMessage(JSON.parse(credentials?.message));
          const result = await siwe.verify({
            signature: credentials.signedMessage,
            nonce: await getCsrfToken({ req: {headers: req.headers} }),
          });

          if (!result.success) throw new Error("Invalid Signature");

          if (result.data.statement !== process.env.NEXT_PUBLIC_SIGNIN_MESSAGE)
            throw new Error("Statement Mismatch");

          // if (new Date(result.data.expirationTime as string) < new Date())
          //   throw new Error("Signature Already expired");
          console.log("Returning")
          return {
            id: siwe.address,
          };
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
};

export const getAuthSession = () => {
  return getServerSession(authOptions);
};

