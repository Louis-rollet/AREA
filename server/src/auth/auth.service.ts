import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AreaService } from 'src/area/area.service';
import { Auth0Guard } from './auth.guard';
import { postLinkAccounts, delete_user, delete_all_relation } from './auth0.strategy';
import { TokenService } from 'src/area/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly AreaService: AreaService,
    private readonly tokenService: TokenService,
  ) {}

  async handleCallback(code: string): Promise<any> {
    console.log('code', code);
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('AUTH0_CLIENT_ID'),
      client_secret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
      code: code,
      redirect_uri: this.configService.get<string>('AUTH0_CALLBACK_URL'),
    });

    const tokenResponse = await fetch(
      'https://' + process.env.AUTH0_DOMAIN + '/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      },
    );

    const data = await tokenResponse.json();
    console.log('data', data);
    const decodedToken = jwt.decode(data.access_token);
    const userId = decodedToken.sub;
    const userinfo = new UserInfos();
    const userIdentities = await userinfo.fetchUserAllIdentities(userId as string);
    for (const identity of userIdentities) {
      console.log('userInfos', identity);

      if (identity?.provider == 'auth0') {
        continue;
      }
      if (identity?.refresh_token) {
        await this.tokenService.postTokens(
          (identity.provider + '|' + identity.user_id) as string,
          identity.access_token,
          identity.refresh_token,
        );
      } else {
        await this.tokenService.postTokensAccess(
          (identity.provider + '|' + identity.user_id) as string,
          identity.access_token,
        );
      }
    }

    return data.access_token;
  }

  async linkAccounts(firstUser: string, otherUserToken: string) {
    const decoded = jwt.decode(otherUserToken, { complete: true });
    const otherUser = decoded.payload.sub;
    const [otherUserProvider, ...rest] = (otherUser as string).split('|');
    const otherUserId = rest.join('|');
    console.log('otherUserProvider:', otherUserProvider);
    console.log('otherUserId:', otherUserId);
    await postLinkAccounts(firstUser, otherUserProvider, otherUserId);
  }

  Customredirect(connection: string, access_token: string) {
    const configService = new ConfigService();
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const responseType = 'code';
    const callbackURL = `${configService.get<string>('AUTH0_CALLBACK_URL')}-${connection}?access_token=${access_token}`;
    const clientId = configService.get<string>('AUTH0_CLIENT_ID');
    const accessType = 'offline';

    if (connection === 'oauth2')
      connection = 'twitch';

    const authUrl =
      `https://${domain}/authorize?` +
      `audience=${audience}&` +
      `response_type=${responseType}&` +
      `client_id=${clientId}&` +
      `redirect_uri=${callbackURL}&` +
      `access_type=${accessType}&` +
      `connection=${connection}`;

    console.log('authUrl:', authUrl);
    return authUrl;
  }

  Redirect(plaform: string) {
    const configService = new ConfigService();
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const responseType = 'code';
    const callbackURL = `${configService.get<string>('AUTH0_CALLBACK_URL')}?platform=${plaform}`;
    const clientId = configService.get<string>('AUTH0_CLIENT_ID');
    const accessType = 'offline';

    const authUrl =
      `https://${domain}/authorize?` +
      `audience=${audience}&` +
      `response_type=${responseType}&` +
      `client_id=${clientId}&` +
      `redirect_uri=${callbackURL}&` +
      `access_type=${accessType}&`;

    console.log('authUrl:', authUrl);
    return authUrl;
  }



  async UnlinkAccounts(firstUser: string, service_to_unlink: string) {
    const userinfo = new UserInfos();
    const firstUserInfos = await userinfo.fetchUserInfosFromUserid(firstUser, service_to_unlink);
    console.log('firstUserInfos:', firstUserInfos);
    if (firstUserInfos) {
      const user_to_unlink_id = firstUserInfos.user_id;
      console.log('user_to_unlink_id:', user_to_unlink_id);
      console.log('service_to_unlink:', service_to_unlink);
      console.log('firstUser:', firstUser);
      if (service_to_unlink + '|' + user_to_unlink_id === firstUser) {
        return 'You can\'t unlink your main account';
      } else {
        await delete_user(firstUser, service_to_unlink, user_to_unlink_id);
        return 'Unlinked';
      }
    }
  }
  
}

@Injectable()
export class UserInfos {
  async getAuthToken(): Promise<string> {
    const configService = new ConfigService();
    const auth0strategy = new Auth0Guard(configService);
    return auth0strategy.getAuth0Token();
  }

  async fetchUserInfo(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      console.log('response', response);
      const data = await response.json();
      return data.identities ? data.identities[0] : null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchUserAllIdentities(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      return data.identities;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchUserInfosFromEmail(email: string, service: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      },
    };

    const query = encodeURIComponent(`identities.profileData.email:"${email}" AND identities.provider:"${service}"`);
    const url = `${audience}users?q=${query}&search_engine=v3`;

    try {
      // First try the existing method
      let response = await fetch(url, options);
      let data = await response.json();
      console.log('data:', data);
      if (data.length > 0) {
        for (const a_data of data) {
          const all_identities = await this.fetchUserAllIdentities(a_data.user_id);
          console.log('all_identities:', all_identities);
          if (all_identities.length > 0) {
            for (const identity of all_identities) {
              if (identity.provider === service && identity.profileData && identity.profileData.email && identity.profileData.email === email) {
                return  a_data.user_id;
              }
            }
          } else {
            return null;
          }
        }
      }

      const newUrl = `${audience}users-by-email?email=${encodeURIComponent(email)}`;
      response = await fetch(newUrl, options);
      data = await response.json();
      console.log('new data:', data);
      if (!data || data.length === 0 || data[0].statusCode === 429) {
        return null;
      }
      return data[0].user_id;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchUserServiceToken(userId: string, service: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      const services = [];
      for (const identity of data.identities) {
        if (identity.provider === service) {
          services.push(identity);
        }
      }
      return services;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchUserService(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      const services = [];
      for (const identity of data.identities) {
        services.push(identity.provider);
      }
      return services;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchUserInfosFromUserid(
    userId: string,
    service: string,
  ): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      if (!data.identities) {
        console.log(data);
        return null;
      }
      for (const identity of data.identities) {
        if (identity.provider === service) {
          return identity;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchMainUser(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      console.log('fetchMainUser:', userId);
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      console.log('data:', data);
      return data.user_id;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchMainUserProvider(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      const user_provider = data.user_id.split('|')[0];
      return user_provider;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchAllUserId(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      const users_ids = [];
      if (!data.identities) {
        return users_ids;
      }
      for (const identity of data.identities) {
        users_ids.push(identity.provider + '|' + identity.user_id);
      }
      return users_ids;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async fetchEmails(userId: string): Promise<any> {
    const audience = process.env.AUTH0_AUDIENCE;
    const token = await this.getAuthToken();

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(`${audience}users/${userId}`, options);
      const data = await response.json();
      const emails = [];
      if (!data.identities) {
        return emails;
      }
      for (const identity of data.identities) {
        console.log('identity:', identity);
        if (identity.profileData && identity.profileData.email) {
          emails.push(identity.profileData.email);
        } else {
          emails.push(data.email);
        }
      }
      return emails;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}
