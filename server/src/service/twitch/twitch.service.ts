import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwitchService {
    constructor() {}

    async refreshUserAccessToken(refresh_token: string) {
        console.log('Refreshing user Twitch access token');

        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;

        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: clientId,
                client_secret: clientSecret,
            },
        });

        const newAccessToken = response.data.access_token;
        return newAccessToken;
    }

    async getAppAccessToken() {
        console.log('Getting Twitch app access token');

        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;

        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            },
        });

        const appAccessToken = response.data.access_token;
        return appAccessToken;
    }

    async getUserIdFromUsername(username: string, appAccessToken: string) {
        console.log('Getting Twitch user id from username');

        const response = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
            headers: {
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${appAccessToken}`,
            },
        });

        const userId = response.data.data[0].id;
        return userId;
    }

    async subscribeToWebhook(username: string) {
        const appAccessToken = await this.getAppAccessToken();
        const userid = await this.getUserIdFromUsername(username, appAccessToken);
        console.log('Subscribing to Twitch webhook');

        const response = await axios.post(
            'https://api.twitch.tv/helix/eventsub/subscriptions',
            {
                type: 'stream.online',
                version: '1',
                condition: {
                    broadcaster_user_id: userid,
                },
                transport: {
                    method: 'webhook',
                    callback: `${process.env.WEBHOOK}/twitch/twitch-webhook`,
                    secret: 'thisisasecret',
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${appAccessToken}`,
                    'Client-Id': process.env.TWITCH_CLIENT_ID,
                    'Content-Type': 'application/json',
                },
            }
        );

        const subscriptionId = response.data.data[0].id;

        console.log('Subscribed to Twitch webhook:', subscriptionId);

        return subscriptionId;
    }

    async unsubscribeFromWebhook(subscriptionId: string) {
        const appAccessToken = await this.getAppAccessToken();

        console.log('Unsubscribing from Twitch webhook');
        await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${appAccessToken}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });
    }

    async sendMessageToChannel(access_token: string, channel_name: string, message: string, user_id: string) {
        console.log('Sending message to Twitch channel');

        const channel_id = await this.getUserIdFromUsername(channel_name, access_token);

        const response = await axios.post(
            'https://api.twitch.tv/helix/chat/messages',
            {
                broadcaster_id: channel_id,
                sender_id: user_id,
                message: message,
            },
            {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Content-Type': 'application/json',
            },
            }
        );

        console.log('Sent message to Twitch channel:', response.data);
    }
}
