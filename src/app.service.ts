import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [
      activeJobs,
      activeTenders,
      totalUsers,
      totalCompanies,
      totalOrganizations,
    ] = await Promise.all([
      this.prisma.job.count({
        where: { status: 'open' },
      }),
      this.prisma.tender.count({
        where: { status: 'open' },
      }),
      this.prisma.profile.count(),
      this.prisma.company.count({
        where: { approved: true },
      }),
      this.prisma.organization.count({
        where: { approved: true },
      }),
    ]);

    return {
      activeOpportunities: activeJobs + activeTenders,
      registeredUsers: totalUsers,
      companiesAndOrganizations: totalCompanies + totalOrganizations,
      breakdown: {
        activeJobs,
        activeTenders,
        totalCompanies,
        totalOrganizations,
      },
    };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        jobs: [],
        tenders: [],
        total: 0,
      };
    }

    const searchTerm = `%${query.trim()}%`;

    const [jobs, tenders] = await Promise.all([
      this.prisma.job.findMany({
        where: {
          status: 'open',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 20,
      }),
      this.prisma.tender.findMany({
        where: {
          status: 'open',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 20,
      }),
    ]);

    return {
      jobs,
      tenders,
      total: jobs.length + tenders.length,
    };
  }
}
