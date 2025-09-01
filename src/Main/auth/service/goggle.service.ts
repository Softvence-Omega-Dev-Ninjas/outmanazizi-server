import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string, // from .env

      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.GOOGLE_CLIENT_CALLBACK_URL}`,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Record<string, any>,
    done: VerifyCallback,
  ): void {
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
      lastName: name.familyName,
      picture: photos[0].value,
    };
    done(null, user);
  }
}

