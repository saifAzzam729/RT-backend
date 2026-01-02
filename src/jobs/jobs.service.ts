import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createJobDto: CreateJobDto) {
    const { userId: dtoUserId, ...jobData } = createJobDto;

    // Verify that the userId in DTO matches the authenticated user
    if (dtoUserId !== userId) {
      throw new ForbiddenException('You can only create jobs for yourself');
    }

    // Verify user exists
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check free post limit based on user_id
    const jobCount = await this.prisma.job.count({
      where: { user_id: userId },
    });

    if (jobCount >= 2) {
      throw new BadRequestException('Free job post limit (2 units) reached. Please contact support to unlock more postings.');
    }

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        user_id: userId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
    });

    return job;
  }

  async findAll(queryDto: QueryJobsDto) {
    const where: Prisma.JobWhereInput = {
      status: {
        in: ['open', 'active'],
      },
    };

    if (queryDto.search) {
      where.OR = [
        { title: { contains: queryDto.search, mode: 'insensitive' } },
        { description: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    if (queryDto.category) {
      where.category = queryDto.category;
    }

    if (queryDto.location) {
      where.location = { contains: queryDto.location, mode: 'insensitive' };
    }

    if (queryDto.userId) {
      where.user_id = queryDto.userId;
    }

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
        user: {
          include: {
            signup_request: {
              select: {
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Map the results to include the role from signup request
    return jobs.map((job) => {
      const { user, ...jobData } = job;
      return {
        ...jobData,
        user_role: user?.signup_request?.role || user?.role || null,
        user: user ? {
          id: user.id,
          email: user.email,
        } : null,
      };
    });
  }

  async findOne(id: string, incrementView = false) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
            description: true,
            website: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Increment view count if requested
    if (incrementView) {
      await this.prisma.job.update({
        where: { id },
        data: { views_count: { increment: 1 } },
      });
      job.views_count += 1;
    }

    return job;
  }

  async findByCompany(companyId: string) {
    // Get the company to find its user_id
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { user_id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.job.findMany({
      where: { user_id: company.user_id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.job.findMany({
      where: { user_id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async update(id: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id);

    // Verify user ownership
    if (job.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
    });

    return updatedJob;
  }

  async remove(id: string, userId: string) {
    const job = await this.findOne(id);

    // Verify user ownership
    if (job.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Job deleted successfully' };
  }
}


