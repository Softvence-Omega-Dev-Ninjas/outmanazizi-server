import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    const clientID = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const callbackURL = process.env.FACEBOOK_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Facebook OAuth environment variables are not set.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'FACEBOOK',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
