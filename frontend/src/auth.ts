import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
 
const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
})

export { handlers, signIn, signOut, auth }