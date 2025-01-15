import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MicrosoftService {
  constructor() {}

  async mailSubscription(access_token: string): Promise<string> {
    const data = JSON.stringify({
      changeType: 'created,updated',
      notificationUrl: env.MICROSOFT_NOTIFICATION_URL,
      resource: '/me/mailFolders(\'Inbox\')/messages', // Limit to Inbox
      expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      clientState: env.MICROSOFT_CLIENT_STATE,
    });

    console.log('data:', data);

    console.log('access_token:', access_token);

    const token = 'Bearer ' + access_token;
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: env.MICROSOFT_SUBSCRIPTION_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
      console.log('Subscription ID:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.log(error.response.data);
      throw new Error('Failed to subscribe to mail notifications');
    }
  }

  async mailUnsubscription(access_token: string, subscriptionId: string) {
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `${env.MICROSOFT_SUBSCRIPTION_URL}/${subscriptionId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    };
    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
      throw new Error('Failed to unsubscribe from mail notifications');
    }
  }

  async checkEmails(email_id: string, access_token: string) {
    console.log('Checking emails ID:', email_id);
    
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://graph.microsoft.com/v1.0/${email_id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    };

    try {
      const response = await axios.request(config);
      const { from, to, cc, bcc, receivedDateTime: date } = response.data;
      return {
        from,
        to,
        subject: response.data.subject,
        body: response.data.body.content,
        cc,
        bcc,
        date,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const data = new URLSearchParams();
    data.append('client_id', env.MICROSOFT_CLIENT_ID);
    data.append('client_secret', env.MICROSOFT_CLIENT_SECRET);
    data.append('refresh_token', refreshToken);
    data.append('grant_type', 'refresh_token');
    data.append('redirect_uri', env.REDIRECT_URI);
    data.append('scope', 'offline_access https://graph.microsoft.com/mail.read');

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    try {
      const response = await axios.request(config);
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    } catch (error) {
      if (error.response && error.response.data) {
        console.log('Error data:', error.response.data);
        if (error.response.data.error === 'invalid_grant') {
          return null;
        }
      } else {
        console.log('Error:', error.message);
        if (error.message.error === 'invalid_grant') {
          return null;
        }
      }
      throw new Error('Failed to refresh access token');
    }
  }

  async addEventToCalendar(access_token: string, event: any) {
    const data = JSON.stringify(event);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://graph.microsoft.com/v1.0/me/events',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
      return response.data.id;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to add event to calendar');
    }
  }
}
