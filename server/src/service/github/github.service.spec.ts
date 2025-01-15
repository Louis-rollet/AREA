// github.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';

global.fetch = jest.fn();

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribeToRepoWebhook', () => {
    it('devrait souscrire à un webhook de dépôt', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      const response = await service.subscribeToRepoWebhook(
        JSON.stringify(JSON.stringify({ owner: 'testOwner', repo: 'testRepo' })),
        'testToken',
        'push'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testOwner/testRepo/hooks',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer testToken',
          }),
        }),
      );
      expect(response.ok).toBe(true);
    });
  });

  describe('unsubscribeToRepoWebhook', () => {
    it("devrait se désinscrire d'un webhook de dépôt", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                config: { url: `${process.env.WEBHOOK}/github/github-webhook-push` },
                events: ['push'],
              },
            ]),
        })
        .mockResolvedValueOnce({ ok: true });

      const response = await service.unsubscribeToRepoWebhook(
        JSON.stringify(JSON.stringify({ owner: 'testOwner', repo: 'testRepo' })),
        'testToken',
        'push'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testOwner/testRepo/hooks/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer testToken',
          }),
        }),
      );
      expect(response.ok).toBe(true);
    });
  });

  describe('parseGithubPush', () => {
    it("devrait analyser le webhook 'push'", () => {
      const payload = {
        ref: 'refs/heads/main',
        repository: { full_name: 'testOwner/testRepo' },
        sender: { login: 'testUser' },
        created_at: '2023-01-01T00:00:00Z',
        head_commit: { url: 'https://github.com/test/commit/1', message: 'Test commit' },
      };

      const result = service.parseGithubPush(
        payload,
        JSON.stringify(JSON.stringify({ owner: 'testOwner', repo: 'testRepo' }))
      );

      expect(result).toEqual({
        owner: 'testUser',
        repo: 'testOwner/testRepo',
        time: '2023-01-01T00:00:00Z',
        commit_url: 'https://github.com/test/commit/1',
        message: 'Test commit',
      });
    });
  });

  describe('parseGithubStar', () => {
    it("devrait analyser le webhook 'star'", () => {
      const payload = {
        action: 'created',
        starred_at: '2023-01-01T00:00:00Z',
        repository: { full_name: 'testOwner/testRepo' },
        sender: { login: 'testUser' },
      };

      const result = service.parseGithubStar(
        payload,
        JSON.stringify(JSON.stringify({ owner: 'testOwner', repo: 'testRepo' }))
      );
    });
  });

  describe('issueOnRepo', () => {
    it("devrait créer une issue dans le dépôt", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      const response = await service.issueOnRepo(
        'testToken',
        'testOwner',
        'testRepo',
        'Test Issue',
        'This is a test issue'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testOwner/testRepo/issues',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer testToken',
          }),
          body: JSON.stringify({
            title: 'Test Issue',
            body: 'This is a test issue',
          }),
        }),
      );
      expect(response.ok).toBe(true);
    });
  });
});
