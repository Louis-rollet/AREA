import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { AuthService, UserInfos } from './auth.service';
import { CheckAuthGuard as AuthGuard2 } from './auth.guard';
import * as jwt from 'jsonwebtoken';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login*')
  // @UseGuards(Auth0Guard)
  @ApiOperation({ summary: 'Login with Auth0' })
  @ApiResponse({ status: 200, description: 'Redirect to Auth0 login page' })
  login(@Req() req, @Res() res) {
    const plaform = req.query.platform;
    res.redirect(this.authService.Redirect(plaform));
  }

  @Get('custom-login')
  @ApiOperation({ summary: 'Login with custom connection' })
  @ApiResponse({ status: 200, description: 'Redirect to custom login page' })
  custom(@Req() req, @Res() res) {
    // const connection = 'github';
    // const access_token = '';
    const access_token = req.query.token;
    const connection = req.query.connection;
    res.redirect(this.authService.Customredirect(connection, access_token));
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback from Auth0' })
  @ApiResponse({ status: 200, description: 'Redirect to the app with the access token' })
  async callback(@Req() req, @Res() res) {
    const code = req.query.code;
    const plaform = req.query.platform;
    try {
      const accessToken = await this.authService.handleCallback(code);
      if (plaform == 'app')
        res.redirect(`myapp://callback?access_token=${accessToken}`);
      else if (plaform == 'web')
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/#/callback?access_token=${accessToken}`,
        );
      else res.send('Invalid platform');
    } catch (error) {
      console.error('Error handling callback:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching token');
    }
  }

  @Get('callback-*')
  // @UseGuards(AuthGuard2)
  @ApiOperation({ summary: 'Callback from custom connection' })
  @ApiResponse({ status: 200, description: 'Linked the account' })
  async authGithub(@Req() req, @Res() res) {
    const code = req.query.code;
    const access_token = req.query.access_token;
    try {
      const newaccessToken = await this.authService.handleCallback(code);
      console.log('accessToken:', access_token);
      const decodedToken = jwt.decode(access_token);
      console.log('decoded :', decodedToken);
      const userId = decodedToken.sub;
      console.log('userId:', userId);
      console.log('newaccessToken:', newaccessToken);
      await this.authService.linkAccounts(userId as string, newaccessToken);
      res.send('Linked, Please close the window');
    } catch (error) {
      console.error('Error handling callback:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching token');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard2)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  async profile(@Req() req, @Res() res) {
    const userId = req.auth.sub;
    const userinfo = new UserInfos();
    const userInfo = await userinfo.fetchUserInfo(userId);
    res.json(userInfo);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Redirect to the home page' })
  async logout(@Req() req, @Res() res) {
    const platform = req.query.platform;
    const returnTo = platform === 'app' ? 'myapp://home' : `${process.env.FRONT_REDIRECT_URL}/`;
    const auth0LogoutUrl = `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;

    req.logout((err) => {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error logging out');
      }
      res.redirect(auth0LogoutUrl);
    });
  }

  @Delete('unlink')
  @UseGuards(AuthGuard2)
  @ApiOperation({ summary: 'Unlink the account' })
  @ApiResponse({ status: 200, description: 'Unlinked the account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          example: 'github',
        },
      },
    },
  })
  async unlink(@Req() req, @Res() res) {
    const userId = req.auth.sub;
    const service_to_unlink = req.body.service;
    const result = await this.authService.UnlinkAccounts(userId, service_to_unlink);
    if (result == 'Unlinked') {
      res.send('Unlinked');
    } else {
      res.status(403).send("You can't unlink your main account");
    }
  }

  @Get()
  @ApiOperation({ summary: 'Check if the user is logged in' })
  @ApiResponse({ status: 200, description: 'Return if the user is logged in' })
  index(@Req() req, @Res() res) {
    res.send(req.isAuthenticated() ? 'Logged in' : 'Logged out');
  }
}
