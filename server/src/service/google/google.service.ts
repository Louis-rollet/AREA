import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1, tasks_v1, calendar_v3 } from 'googleapis';

@Injectable()
export class GoogleService {
  private gmail: gmail_v1.Gmail;
  private tasks: tasks_v1.Tasks;
  private calendar: calendar_v3.Calendar;
  private oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.AUTH0_CALLBACK_URL,
    );
  }

  async refreshAccessToken(refreshToken: string) {
    console.log('Refreshing access token: ', refreshToken);
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    await this.oauth2Client.refreshAccessToken().then((res) => {
      this.setAccessToken(res.credentials.access_token);
    });
    return this.oauth2Client.credentials.access_token;
  }

  setAccessToken(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async subscribeToEmails() {
    const response = await this.gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/elite-antenna-419918/topics/test',
      },
    });
    console.log('Subscribed to emails:', response.data);

    return response.data;
  }

  async unsubscribeToEmails() {
    const response = await this.gmail.users.stop({
      userId: 'me',
    });
    console.log('Unsubscribed to emails:', response.data);
    return response.data;
  }

  async checkEmails(historyId: string) {
    console.log('Checking emails since history ID:', historyId);
    const response = await this.gmail.users.history.list({
      userId: 'me',
      startHistoryId: historyId,
    });
    return response.data;
  }

  async getMessageDetails(messageId: string) {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    return response.data;
  }

  async refreshFromEmail(
    userinfo: any,
    decodedMessageObj: any,
    prisma: PrismaService,
  ) {
    console.log('Decoded message:', decodedMessageObj);
    const user_id = await userinfo.fetchUserInfosFromEmail(
      decodedMessageObj.emailAddress,
      'google-oauth2',
    );

    console.log('user_id:', user_id);

    const google = await userinfo.fetchUserInfosFromUserid(
      user_id,
      'google-oauth2',
    );

    console.log('google:', google);

    const user_id_google = google.provider + '|' + google.user_id;

    console.log('user_id_google:', user_id_google);

    const result = await prisma.area.findMany({
      where: {
        user_id: user_id,
        last_state_token: {
          not: null,
        },
        action_id: 1,
      },
    });

    if (!result || result.length === 0) {
      return null;
    }
    console.log('result:', result);

    const activeResults = result.filter((area) => area.status === true);

    if (activeResults.length === 0) {
      return null;
    }

    console.log('activeResults:', activeResults);

    const tokens = await prisma.token.findMany({
      where: {
        user_id: user_id_google,
      },
    });
    const token = tokens as any[];
    if (token.length === 0) {
      throw new Error('User not found');
    }

    await this.refreshAccessToken(token[0].refresh_token);

    return { activeResults, user_id_google };
  }

  async parseEmail(email: any) {
    const newMessages = email.history
      .filter(
        (historyItem) =>
          historyItem.messagesAdded && historyItem.messagesAdded.length > 0,
      )
      .flatMap((historyItem) => historyItem.messagesAdded);

    for (const message of newMessages) {
      const messageId = message.message.id;
      let messageDetails = null;
      try {
        messageDetails = await this.getMessageDetails(messageId);
      } catch (error) {
        if (error.message.includes('Requested entity was not found')) {
          console.log(`Message with ID ${messageId} not found, skipping.`);
          continue;
        } else {
          throw error;
        }
      }

      if (messageDetails.labelIds.includes('SENT')) {
        console.log('Skipping sent message:', messageDetails);
        return null;
      }

      const body = messageDetails.payload.parts
        ? messageDetails.payload.parts
            .filter((part) => part.mimeType === 'text/plain')
            .map((part) =>
              Buffer.from(part.body.data, 'base64').toString('utf-8'),
            )
            .join('\n')
        : '';

      const headers = messageDetails.payload.headers;
      const from = headers.find((header) => header.name === 'From')?.value;
      const to = headers.find((header) => header.name === 'To')?.value;
      const cc = headers.find((header) => header.name === 'Cc')?.value;
      const bcc = headers.find((header) => header.name === 'Bcc')?.value;
      const date = headers.find((header) => header.name === 'Date')?.value;

      const subject = headers.find(
        (header) => header.name === 'Subject',
      )?.value;

      const emailData = {
        from,
        to,
        subject,
        body,
        cc,
        bcc,
        date,
      };

      const emailRes = JSON.stringify(emailData, null, 2);

      console.log('Email Data:', emailRes);

      return emailData;
    }
  }

  async sendEmail(
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    body: string,
  ) {
    let email = `From: "me" <me>\nTo: ${to}\nSubject: ${subject}\n\n${body}`;
    
    if (cc) {
      email = `Cc: ${cc}\n` + email;
    }
    
    if (bcc) {
      email = `Bcc: ${bcc}\n` + email;
    }

    console.log('Sending email:', email);
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log('Email sent:', response.data);
    return response.data;
  }

  async createTask(task: any) {
    const response = await this.tasks.tasks.insert({
      tasklist: 
      '@default',
      requestBody: task,
    });
    console.log('Task created:', response.data);
    return response.data;
  }

  async createEvent(event: any) {
    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    console.log('Event created:', response.data);
    return response.data;
  }
}
