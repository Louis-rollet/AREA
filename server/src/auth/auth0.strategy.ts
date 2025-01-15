import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private configService: ConfigService) {
    super({
      domain: configService.get<string>('AUTH0_DOMAIN'),
      clientID: configService.get<string>('AUTH0_CLIENT_ID'),
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET'),
      callbackURL: configService.get<string>('AUTH0_CALLBACK_URL'),
      scope: 'openid profile email',
      audience: configService.get<string>('AUTH0_AUDIENCE'),
      state: false,
    });
  }

  public async getAuth0Token() {
    const tokenResponse = await axios.post(
      `https://${this.configService.get<string>('AUTH0_DOMAIN')}/oauth/token`,
      {
        client_id: this.configService.get<string>('AUTH0_CLIENT_ID'),
        client_secret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
        audience: this.configService.get<string>('AUTH0_AUDIENCE'),

        grant_type: 'client_credentials',
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    const token = tokenResponse.data.access_token;

    // console.log("Token:", token);

    return token;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      const user = {
        accessToken,
        refreshToken,
        profile,
      };
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}

async function postLinkAccounts(
  primaryAccountUserId: string,
  second_user_provider: string,
  secondaryAccountUserId: string,
) {
  const auth0strategy = new Auth0Strategy(new ConfigService());
  const token = await auth0strategy.getAuth0Token();
  const response = await axios.post(
    process.env.AUTH0_AUDIENCE + `users/${primaryAccountUserId}/identities`,
    {
      provider: second_user_provider,
      user_id: secondaryAccountUserId,
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  console.log(response.data);
  return response.data;
}

async function delete_user(
  primaryAccountUserId: string,
  second_user_provider: string,
  secondaryAccountUserId: string,
) {
  const auth0strategy = new Auth0Strategy(new ConfigService());
  const token = await auth0strategy.getAuth0Token();
  try {
    const response = await axios.delete(
      process.env.AUTH0_AUDIENCE +
        `users/${primaryAccountUserId}/identities/${second_user_provider}/${secondaryAccountUserId}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

async function delete_all_relation(
  primaryAccountUserId: string,
)
{
  const auth0strategy = new Auth0Strategy(new ConfigService());
  const token = await auth0strategy.getAuth0Token();

  try {
    const response = await axios.get(
      process.env.AUTH0_AUDIENCE + `users/${primaryAccountUserId}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );

    const identities = response.data.identities;
    const unlinkPromises = identities
      .filter(identity => identity.provider !== 'auth0' && identity.provider + "|" + identity.user_id !== primaryAccountUserId)
      .map(identity => 
      axios.delete(
        process.env.AUTH0_AUDIENCE +
        `users/${primaryAccountUserId}/identities/${identity.provider}/${identity.user_id}`,
        {
        headers: {
          authorization: `Bearer ${token}`,
        },
        },
      )
      );

    const unlinkResponses = await Promise.all(unlinkPromises);
    console.log('Unlinked identities:', unlinkResponses.map(res => res.data));
    return unlinkResponses.map(res => res.data);
  } catch (error) {
    console.error('Error unlinking identities:', error);
    throw error;
  }
}

export { postLinkAccounts, delete_user, delete_all_relation };
