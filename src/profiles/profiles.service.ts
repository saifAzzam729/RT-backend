import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async getAllUsers() {
    const profiles = await this.prisma.profile.findMany({
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
        companies: {
          select: {
            id: true,
          },
          take: 1,
        },
        organizations: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return profiles.map((profile) => this.transformUserResponse(profile));
  }

  async getUserById(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        companies: {
          select: {
            id: true,
          },
          take: 1,
        },
        organizations: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return this.transformUserResponse(profile);
  }

  async updateUser(userId: string, currentUserId: string, currentUserRole: string, updateProfileDto: UpdateProfileDto) {
    // Check if user exists
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    // Check authorization: user can update themselves or admin can update anyone
    if (userId !== currentUserId && currentUserRole !== 'admin') {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    const updated = await this.prisma.profile.update({
      where: { id: userId },
      data: updateProfileDto,
      include: {
        companies: {
          select: {
            id: true,
          },
          take: 1,
        },
        organizations: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    return this.transformUserResponse(updated);
  }

  async deleteUser(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.profile.delete({
      where: { id: userId },
    });

    return { success: true };
  }

  private transformUserResponse(profile: any) {
    // Map role to match requirements: user -> job_seeker
    let type: 'job_seeker' | 'company' | 'organization' | 'admin' = 'job_seeker';
    if (profile.role === 'admin') {
      type = 'admin';
    } else if (profile.role === 'company') {
      type = 'company';
    } else if (profile.role === 'organization') {
      type = 'organization';
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name || '',
      type,
      emailVerified: profile.email_verified,
      companyId: profile.companies && profile.companies.length > 0 ? profile.companies[0].id : undefined,
      organizationId: profile.organizations && profile.organizations.length > 0 ? profile.organizations[0].id : undefined,
      createdAt: profile.created_at.toISOString(),
      updatedAt: profile.updated_at.toISOString(),
    };
  }
}


