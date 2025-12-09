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
    const { company_id, ...jobData } = createJobDto;

    // Verify company ownership
    const company = await this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to post jobs for this company');
    }

    // Check if company is approved
    if (!company.approved) {
      throw new ForbiddenException('Company must be approved before posting jobs');
    }

    // Check free post limit
    const jobCount = await this.prisma.job.count({
      where: { company_id },
    });

    if (jobCount >= 2) {
      throw new BadRequestException('Free job post limit (2 units) reached. Please contact support to unlock more postings.');
    }

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        company_id,
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
      status: 'open',
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

    return this.prisma.job.findMany({
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
      },
      orderBy: {
        created_at: 'desc',
      },
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
    return this.prisma.job.findMany({
      where: { company_id: companyId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async update(id: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id);

    // Verify company ownership
    const company = await this.prisma.company.findUnique({
      where: { id: job.company_id },
    });

    if (!company || company.user_id !== userId) {
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

    // Verify company ownership
    const company = await this.prisma.company.findUnique({
      where: { id: job.company_id },
    });

    if (!company || company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Job deleted successfully' };
  }
}


