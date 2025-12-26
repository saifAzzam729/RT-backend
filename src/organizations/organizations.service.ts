import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        user_id: userId,
        profile_complete: this.isProfileComplete(createOrganizationDto),
      },
    });

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      location: organization.location,
      website: organization.website,
      logo: organization.logo_url,
      verified: organization.approved,
      userId: organization.user_id,
      createdAt: organization.created_at.toISOString(),
      updatedAt: organization.updated_at.toISOString(),
    };
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      location: organization.location,
      website: organization.website,
      logo: organization.logo_url,
      verified: organization.approved,
      userId: organization.user_id,
      createdAt: organization.created_at.toISOString(),
      updatedAt: organization.updated_at.toISOString(),
    };
  }

  async findByUserId(userId: string) {
    return this.prisma.organization.findMany({
      where: { user_id: userId },
    });
  }

  async update(id: string, userId: string, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this organization');
    }

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: {
        ...updateOrganizationDto,
        profile_complete: this.isProfileComplete({
          license_number: updateOrganizationDto.license_number ?? organization.license_number ?? undefined,
          license_file_url: updateOrganizationDto.license_file_url ?? organization.license_file_url ?? undefined,
          work_sectors: updateOrganizationDto.work_sectors ?? organization.work_sectors ?? undefined,
        }),
      },
    });

    return {
      id: updatedOrganization.id,
      name: updatedOrganization.name,
      description: updatedOrganization.description,
      location: updatedOrganization.location,
      website: updatedOrganization.website,
      logo: updatedOrganization.logo_url,
      verified: updatedOrganization.approved,
      userId: updatedOrganization.user_id,
      createdAt: updatedOrganization.created_at.toISOString(),
      updatedAt: updatedOrganization.updated_at.toISOString(),
    };
  }

  async findAll() {
    const organizations = await this.prisma.organization.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      description: org.description,
      location: org.location,
      website: org.website,
      logo: org.logo_url,
      verified: org.approved,
      userId: org.user_id,
      createdAt: org.created_at.toISOString(),
      updatedAt: org.updated_at.toISOString(),
    }));
  }

  async delete(id: string, userId: string, userRole: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Admin can delete any organization, otherwise only owner can delete
    if (organization.user_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this organization');
    }

    await this.prisma.organization.delete({
      where: { id },
    });

    return { success: true };
  }

  async getQuota(organizationId: string) {
    const organization = await this.findOne(organizationId);

    const tenderCount = await this.prisma.tender.count({
      where: { organization_id: organizationId },
    });

    return {
      free_tender_post_limit: 2,
      tender_posts_used: tenderCount,
      tender_posts_remaining: Math.max(0, 2 - tenderCount),
    };
  }

  // Secondary accounts
  async inviteSecondaryAccount(organizationId: string, userId: string, email: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to invite users to this organization');
    }

    // Check if already invited
    const existing = await this.prisma.organizationSecondaryAccount.findFirst({
      where: {
        organization_id: organizationId,
        email,
      },
    });

    if (existing) {
      throw new ConflictException('This email has already been invited');
    }

    // Generate invitation token
    const invitation_token = crypto.randomBytes(32).toString('hex');

    const invitation = await this.prisma.organizationSecondaryAccount.create({
      data: {
        organization_id: organizationId,
        email,
        invited_by: userId,
        invitation_token,
      },
    });

    // TODO: Send invitation email

    return {
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
      },
    };
  }

  async getSecondaryAccounts(organizationId: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to view invitations for this organization');
    }

    return this.prisma.organizationSecondaryAccount.findMany({
      where: { organization_id: organizationId },
      include: {
        inviter: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.organizationSecondaryAccount.findUnique({
      where: { invitation_token: token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been processed');
    }

    // Get user email
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('This invitation is not for your email address');
    }

    await this.prisma.organizationSecondaryAccount.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        user_id: userId,
        accepted_at: new Date(),
      },
    });

    return {
      message: 'Invitation accepted successfully',
    };
  }

  private isProfileComplete(data: Partial<CreateOrganizationDto>): boolean {
    return !!(
      data.license_number &&
      data.license_file_url &&
      data.work_sectors &&
      data.work_sectors.length > 0
    );
  }
}


