import { Injectable } from '@nestjs/common';

@Injectable()
export class RssService {
    async getRssFeed(url: string) {
        const Parser = require('rss-parser');
        const parser = new Parser();
        try {
            console.log('Parsing RSS:', url);
            return await parser.parseURL(url);
        } catch (error) {
            console.log('Error parsing RSS:', error);
            return null;
        }
    }
}
