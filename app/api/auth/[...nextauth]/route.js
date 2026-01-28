import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectToDB();
        const sessionUser = await User.findOne({
          email: session?.user?.email,
        });
        if (sessionUser) {
          session.user.id = sessionUser._id.toString();
        }
        return session;
      } catch (err) {
        console.error('session callback error:', err);
        return session;
      }
    },
    async signIn({ profile }) {
      try {
        await connectToDB();

        // Ensure email exists (required by our User schema and for session lookup)
        if (!profile?.email) {
          console.log('Google profile missing email');
          return false;
        }

        const userExists = await User.findOne({ email: profile.email });

        if (!userExists) {
          // Generate a username that satisfies our regex: 8-20 chars, alphanumeric/._
          const baseRaw = (profile?.email?.split('@')[0] || profile?.name || 'user');
          const base = String(baseRaw).toLowerCase().replace(/[^a-z0-9._]/g, '');
          let safe = base.replace(/\./g, '').replace(/_/g, ''); // prefer alphanumeric to satisfy regex
          if (safe.length < 8) safe = (safe + 'useruseruser').slice(0, 8);
          if (safe.length > 20) safe = safe.slice(0, 20);

          await User.create({
            email: profile.email,
            username: safe,
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log('signIn error:', error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
