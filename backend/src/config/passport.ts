import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from './database';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email returned from Google profile'), undefined);
        }

        // Find by googleId first, then fall back to email
        let user = await prisma.user.findFirst({
          where: { OR: [{ google_id: profile.id }, { email }] },
          include: { role: true },
        });

        if (!user) {
          // First-time Google login → auto-create Customer account
          const customerRole = await prisma.role.findUnique({
            where: { role_name: 'Customer' },
          });

          if (!customerRole) {
            return done(new Error('Customer role not found. Run database seed first.'), undefined);
          }

          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              google_id: profile.id,
              avatar: avatar ?? null,
              role_id: customerRole.id,
            },
            include: { role: true },
          });
        } else if (!user.google_id) {
          // Existing email account — link Google ID
          user = await prisma.user.update({
            where: { id: user.id },
            data: { google_id: profile.id, avatar: avatar ?? user.avatar },
            include: { role: true },
          });
        }

        return done(null, user as unknown as Express.User);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
