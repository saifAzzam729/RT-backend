import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { QueryTendersDto } from './dto/query-tenders.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TendersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTenderDto: CreateTenderDto) {
    const { userId: dtoUserId, ...tenderData } = createTenderDto;

    // Verify that the userId in DTO matches the authenticated user
    if (dtoUserId !== userId) {
      throw new ForbiddenException('You can only create tenders for yourself');
    }

    // Verify user exists
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check free post limit based on user_id
    const tenderCount = await this.prisma.tender.count({
      where: { user_id: userId },
    });

    if (tenderCount >= 2) {
      throw new BadRequestException('Free tender post limit (2 units) reached. Please contact support to unlock more tenders.');
    }

    const tender = await this.prisma.tender.create({
      data: {
        ...tenderData,
        user_id: userId,
        deadline: tenderData.deadline ? new Date(tenderData.deadline) : null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
    });

    return tender;
  }

  async findAll(queryDto: QueryTendersDto) {
    const where: Prisma.TenderWhereInput = {
      status: {
        in: ['open', 'active', 'closing_soon'],
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

    return this.prisma.tender.findMany({
      where,
      include: {
        organization: {
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
    const tender = await this.prisma.tender.findUnique({
      where: { id },
      include: {
        organization: {
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

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    // Increment view count if requested
    if (incrementView) {
      await this.prisma.tender.update({
        where: { id },
        data: { views_count: { increment: 1 } },
      });
      tender.views_count += 1;
    }

    return tender;
  }

  async findByOrganization(organizationId: string) {
    // Get the organization to find its user_id
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { user_id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.tender.findMany({
      where: { user_id: organization.user_id },
      include: {
        organization: {
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
    return this.prisma.tender.findMany({
      where: { user_id: userId },
      include: {
        organization: {
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

  async update(id: string, userId: string, updateTenderDto: UpdateTenderDto) {
    const tender = await this.findOne(id);

    // Verify user ownership
    if (tender.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this tender');
    }

    const updateData: any = { ...updateTenderDto };
    if (updateTenderDto.deadline !== undefined) {
      updateData.deadline = updateTenderDto.deadline ? new Date(updateTenderDto.deadline) : null;
    }

    const updatedTender = await this.prisma.tender.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            location: true,
          },
        },
      },
    });

    return updatedTender;
  }

  async remove(id: string, userId: string) {
    const tender = await this.findOne(id);

    // Verify user ownership
    if (tender.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this tender');
    }

    await this.prisma.tender.delete({
      where: { id },
    });

    return { message: 'Tender deleted successfully' };
  }
}


