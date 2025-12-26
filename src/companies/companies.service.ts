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

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      location: company.location,
      website: company.website,
      logo: company.logo_url,
      verified: company.approved,
      userId: company.user_id,
      createdAt: company.created_at.toISOString(),
      updatedAt: company.updated_at.toISOString(),
    };
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

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      location: company.location,
      website: company.website,
      logo: company.logo_url,
      verified: company.approved,
      userId: company.user_id,
      createdAt: company.created_at.toISOString(),
      updatedAt: company.updated_at.toISOString(),
    };
  }

  async findByUserId(userId: string) {
    return this.prisma.company.findMany({
      where: { user_id: userId },
    });
  }

  async update(id: string, userId: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this company');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    return {
      id: updatedCompany.id,
      name: updatedCompany.name,
      description: updatedCompany.description,
      location: updatedCompany.location,
      website: updatedCompany.website,
      logo: updatedCompany.logo_url,
      verified: updatedCompany.approved,
      userId: updatedCompany.user_id,
      createdAt: updatedCompany.created_at.toISOString(),
      updatedAt: updatedCompany.updated_at.toISOString(),
    };
  }

  async findAll() {
    const companies = await this.prisma.company.findMany({
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

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      description: company.description,
      location: company.location,
      website: company.website,
      logo: company.logo_url,
      verified: company.approved,
      userId: company.user_id,
      createdAt: company.created_at.toISOString(),
      updatedAt: company.updated_at.toISOString(),
    }));
  }

  async delete(id: string, userId: string, userRole: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Admin can delete any company, otherwise only owner can delete
    if (company.user_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this company');
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { success: true };
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


