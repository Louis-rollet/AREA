// rss.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { RssService } from './rss.service';

describe('RssService', () => {
  let service: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssService],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('getRssFeed', () => {
    it('devrait retourner un flux RSS valide si l’URL est correcte', async () => {
      const mockFeed = { items: [{ title: 'Article Test', link: 'https://example.com/article1' }] };

      const mockParseURL = jest.fn().mockResolvedValue(mockFeed);
      jest.mock('rss-parser', () => {
        return jest.fn().mockImplementation(() => ({
          parseURL: mockParseURL,
        }));
      });

      const url = 'https://example.com/rss';
      const feed = await service.getRssFeed(url);

      expect(mockParseURL).toHaveBeenCalledWith(url);
      expect(feed).toEqual(mockFeed);
    });

    it('devrait retourner null en cas d’erreur lors de la récupération du flux RSS', async () => {
      const mockParseURL = jest.fn().mockRejectedValue(new Error('Erreur de parsing'));
      jest.mock('rss-parser', () => {
        return jest.fn().mockImplementation(() => ({
          parseURL: mockParseURL,
        }));
      });

      const url = 'https://example.com/invalid-rss';
      const feed = await service.getRssFeed(url);
    });
  });
});
