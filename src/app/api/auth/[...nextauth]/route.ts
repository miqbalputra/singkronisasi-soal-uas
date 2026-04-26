import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username }
        })

        if (!admin) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)

        if (!isPasswordValid) return null

        return { id: admin.id, name: admin.username }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
