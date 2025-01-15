import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { expressJwtSecret } from 'jwks-rsa';
import { promisify } from 'util';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';

@Injectable()
export class Auth0Guard extends AuthGuard('auth0') {
  constructor(private readonly configService: ConfigService) {
    super({
      audience: configService.get<string>('AUTH0_AUDIENCE'),
      domain: configService.get<string>('AUTH0_DOMAIN'),
      responseType: 'code',
      redirectUri: configService.get<string>('AUTH0_CALLBACK_URL'),
      client_id: configService.get<string>('AUTH0_CLIENT_ID'),
      access_type: 'offline',
      connection_scope:
        'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send \
      https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
    });
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    response.setHeader('Access-Control-Allow-Origin', '*');
    return super.handleRequest(err, user, info, context);
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
    return token;
  }
}

@Injectable()
export class CheckAuthGuard implements CanActivate {
  private AUTH0_AUDIENCE: string;
  private AUTH0_DOMAIN: string;
  constructor(private configService: ConfigService) {
    this.AUTH0_AUDIENCE = this.configService.get('AUTH0_AUDIENCE');
    this.AUTH0_DOMAIN = this.configService.get('AUTH0_DOMAIN');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.getArgByIndex(0);
    const res = context.getArgByIndex(1);
    const checkJwt = promisify(
      expressjwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${this.configService.get('AUTH0_DOMAIN')}/.well-known/jwks.json`,
        }) as GetVerificationKey,
        audience: this.configService.get('AUTH0_AUDIENCE'),
        issuer: `https://${this.configService.get('AUTH0_DOMAIN')}/`,
        algorithms: ['RS256'],
      }),
    );
    try {
      await checkJwt(req, res);
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
