import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email?: string; password?: string }) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Email and password are required.');
    }
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        statusCode: 401,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address is not yet verified. Please enter the 6-digit confirmation code.',
      });
    }

    return this.authService.login(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; password: string; name: string; orgName?: string },
  ) {
    if (!body.email || !body.password || !body.name) {
      throw new BadRequestException('Full name, email address, and password are required.');
    }
    return this.authService.register(body);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    if (!body?.email || !body?.otp) {
      throw new BadRequestException('Email address and 6-digit verification code are required.');
    }
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    if (!body?.token) {
      throw new BadRequestException('Verification token is required.');
    }
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: { email: string }) {
    if (!body?.email) {
      throw new BadRequestException('Email address is required.');
    }
    return this.authService.resendVerification(body.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    if (!body?.email) {
      throw new BadRequestException('Email address is required.');
    }
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; password: string }) {
    if (!body?.token || !body?.password) {
      throw new BadRequestException('Reset token and new password are required.');
    }
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('google-url')
  getGoogleUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  async googleCallback(@Body() body: { code: string }) {
    if (!body?.code) {
      throw new BadRequestException('Authorization code is required.');
    }
    return this.authService.handleGoogleCallback(body.code);
  }

  @Post('oauth')
  @HttpCode(HttpStatus.OK)
  async oauth(
    @Body() body: { provider: 'GOOGLE' | 'GITHUB' | 'CLERK'; profile: { email: string; name?: string; providerId: string } },
  ) {
    if (!body?.provider || !body?.profile?.email || !body?.profile?.providerId) {
      throw new BadRequestException('Valid provider and social profile data required.');
    }
    return this.authService.oauthLogin(body.provider, body.profile);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    return this.authService.logout(req.user?.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }
}
