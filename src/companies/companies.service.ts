import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto) {
    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        user_id: userId,
      },
    });

    return company;
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
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

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findByUserId(userId: string) {
    return this.prisma.company.findMany({
      where: { user_id: userId },
    });
  }

  async update(id: string, userId: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    if (company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this company');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    return updatedCompany;
  }

  async getQuota(companyId: string) {
    const company = await this.findOne(companyId);

    const jobCount = await this.prisma.job.count({
      where: { company_id: companyId },
    });

    return {
      free_job_post_limit: 2,
      job_posts_used: jobCount,
      job_posts_remaining: Math.max(0, 2 - jobCount),
    };
  }
}


