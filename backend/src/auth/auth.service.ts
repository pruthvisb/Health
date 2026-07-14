import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(email: string, passwordHash: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash, // in production, hash with bcrypt/argon2
      },
    });

    // Create default profile
    await this.prisma.profile.create({
      data: {
        userId: user.id,
        age: 30,
        gender: 'Male',
        height: 175,
        currentWeight: 80,
        goalWeight: 75,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        activityLevel: 'MODERATELY_ACTIVE',
        country: 'US',
        timezone: 'EST',
        units: 'METRIC',
      },
    });

    // Create default stats
    await this.prisma.userStats.create({
      data: {
        userId: user.id,
        xp: 0,
        level: 1,
      },
    });

    return this.login(user);
  }

  async signIn(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== pass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.login(user);
  }

  async googleLogin(googleToken: string) {
    // Mock SSO validation
    let email = `google-user-${Date.now()}@gmail.com`;
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId: `google-${Date.now()}`,
        },
      });
      // create stats, profiles
    }
    return this.login(user);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
