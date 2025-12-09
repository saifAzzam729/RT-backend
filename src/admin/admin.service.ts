import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveEntityDto } from './dto/approve-entity.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async approveEntity(approveDto: ApproveEntityDto) {
    const { entityType, entityId, approved } = approveDto;

    if (entityType === 'organization') {
      const organization = await this.prisma.organization.findUnique({
        where: { id: entityId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      await this.prisma.organization.update({
        where: { id: entityId },
        data: { approved },
      });

      return {
        message: `Organization ${approved ? 'approved' : 'unapproved'} successfully`,
      };
    } else if (entityType === 'company') {
      const company = await this.prisma.company.findUnique({
        where: { id: entityId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      await this.prisma.company.update({
        where: { id: entityId },
        data: { approved },
      });

      return {
        message: `Company ${approved ? 'approved' : 'unapproved'} successfully`,
      };
    }

    throw new BadRequestException('Invalid entity type');
  }

  async getPendingApprovals() {
    const [pendingOrganizations, pendingCompanies] = await Promise.all([
      this.prisma.organization.findMany({
        where: { approved: false },
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
      }),
      this.prisma.company.findMany({
        where: { approved: false },
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
      }),
    ]);

    return {
      organizations: pendingOrganizations,
      companies: pendingCompanies,
    };
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalOrganizations,
      totalCompanies,
      totalJobs,
      totalTenders,
      totalJobApplications,
      totalTenderApplications,
      recentActivity,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.organization.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.tender.count(),
      this.prisma.jobApplication.count(),
      this.prisma.tenderApplication.count(),
      this.prisma.analytics.findMany({
        take: 50,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      }),
    ]);

    return {
      totals: {
        users: totalUsers,
        organizations: totalOrganizations,
        companies: totalCompanies,
        jobs: totalJobs,
        tenders: totalTenders,
        jobApplications: totalJobApplications,
        tenderApplications: totalTenderApplications,
      },
      recentActivity,
    };
  }
}


