import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return profile;
  }

  async updatePlanStatus(userId: string, updatePlanStatusDto: UpdatePlanStatusDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id: userId },
      data: {
        plan_status: updatePlanStatusDto.plan_status,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      message: 'Plan status updated successfully',
      profile: updatedProfile,
    };
  }
}


