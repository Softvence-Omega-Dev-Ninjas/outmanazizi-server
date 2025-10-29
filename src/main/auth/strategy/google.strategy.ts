import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
    console.log('passport initialized');
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.GOOGLE_CLIENT_CALLBACK_URL}`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Record<string, any>,
    done: VerifyCallback,
  ): Promise<void> {
    console.log('profile', profile);

    if (!profile) {
      done(null, false);
    }

    const { name, emails, photos } = profile as {
      name: { givenName: string; familyName: string };
      emails: { value: string }[];
      photos: { value: string }[];
    };
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      picture: photos[0].value,
      provider: 'GOOGLE',
    };
    if (!user.email) {
      return done(new Error('No email associated with this account!'), false);
    }
    const userInDb = await this.prisma.user.findUnique({ where: { email: user.email } });
    console.log(userInDb);

    done(null, user);
  }
}

export type GoogleUser = {
  email: string;
  firstName: string;
  picture: string;
  provider: 'GOOGLE';
};
