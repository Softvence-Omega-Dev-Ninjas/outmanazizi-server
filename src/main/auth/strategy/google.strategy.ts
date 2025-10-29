import { Strategy, StrategyOptionsWithRequest, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const secret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callback = configService.get<string>('GOOGLE_CLIENT_CALLBACK_URL');

    super({
      clientID: clientId,
      clientSecret: secret,
      callbackURL: callback,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): void {
    console.log(req.query);
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value as string,
      firstName: name.givenName as string,
      picture: photos[0].value as string,
      provider: 'GOOGLE',
    };
    done(null, user);
  }
}
