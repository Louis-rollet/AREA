import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
    async subscribeToRepoWebhook(params: string, access_token: string, event: string) {
        const params_2 = JSON.parse(params);
        const params_json = JSON.parse(params_2);
        console.log('params:', params_json);
        console.log(`https://api.github.com/repos/${params_json.owner}/${params_json.repo}/hooks`);
        const response = await fetch(`https://api.github.com/repos/${params_json.owner}/${params_json.repo}/hooks`, {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({
            name: 'web',
            active: true,
            events: [event],
            config: {
                url: `${process.env.WEBHOOK}/github/github-webhook-${event}`,
                content_type: 'json',
                insecure_ssl: '0',
            },
            }),
        });
        console.log('Subscribed to repo webhook:');
        return response;
    }

    async unsubscribeToRepoWebhook(params: string, access_token: string, event: string) {
        const params_2 = JSON.parse(params);
        const params_json = JSON.parse(params_2);
        const response = await fetch(`https://api.github.com/repos/${params_json.owner}/${params_json.repo}/hooks`, {
            method: 'GET',
            headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            },
        });
        if (!response.ok) {
            console.error('Failed to fetch webhooks:', response);
            return response;
        }
        const hooks = await response.json();
        console.log(hooks);
        if (Array.isArray(hooks)) {
            for (const hook of hooks) {
                if (hook.config.url == `${process.env.WEBHOOK}/github/github-webhook-${event}` && arraysEqual(hook.events, [event])) {
                    const response = await fetch(`https://api.github.com/repos/${params_json.owner}/${params_json.repo}/hooks/${hook.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            Accept: 'application/vnd.github+json',
                        },
                    });
                    console.log('Unsubscribed to repo webhook:');
                    return response;
                } else {
                    console.log("Comparing", hook.config.url, `${process.env.WEBHOOK}/github/github-webhook-${event}`, hook.events, event);
                }
            }
        } else {
            console.error('Failed to fetch webhooks:', hooks);
            return hooks;
        }
        console.log('No webhook found to unsubscribe');
        return 'No webhook found to unsubscribe';
    }

    parseGithubPush(webhookPayload: any, parameters: string) {
        const params = JSON.parse(parameters);
        const params_json = JSON.parse(params);
        if (webhookPayload.ref && webhookPayload.repository.full_name == `${params_json.owner}/${params_json.repo}`) {
            return {
                    owner: webhookPayload.sender.login,
                    repo: webhookPayload.repository.full_name,
                    time: webhookPayload.created_at,
                    commit_url: webhookPayload.head_commit.url,
                    message: webhookPayload.head_commit.message,
                };
            }
        return null;
    }

    parseGithubStar(webhookPayload: any, parameters: string) {
        const params = JSON.parse(parameters);
        const params_json = JSON.parse(params);
        if (webhookPayload.action == 'created' && webhookPayload.starred_at !== null && webhookPayload.repository.full_name == `${params_json.owner}/${params_json.repo}`) {
            return {
                    owner: webhookPayload.sender.login,
                    repo: webhookPayload.repository.full_name,
                    time: webhookPayload.created_at,
                };
            }
        return null;
    }

    async issueOnRepo(access_token: string, owner: string, repo:string, title: string, body: string) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({
            title: title,
            body: body,
            }),
        });
        if (!response.ok) {
            console.error('Failed to create issue:', response);
            return response;
        }
        console.log('Issue created:');
        return response;
    }
}

function arraysEqual(a: any[], b: any[]): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}