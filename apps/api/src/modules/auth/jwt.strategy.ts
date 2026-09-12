import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'onboardflow-super-secret-jwt-key-change-in-production',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return user;
  }
}
