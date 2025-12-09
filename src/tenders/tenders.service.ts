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
    const { organization_id, ...tenderData } = createTenderDto;

    // Verify organization ownership
    const organization = await this.prisma.organization.findUnique({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to post tenders for this organization');
    }

    // Check if organization is approved
    if (!organization.approved) {
      throw new ForbiddenException('Organization must be approved before posting tenders');
    }

    // Check free post limit
    const tenderCount = await this.prisma.tender.count({
      where: { organization_id },
    });

    if (tenderCount >= 2) {
      throw new BadRequestException('Free tender post limit (2 units) reached. Please contact support to unlock more tenders.');
    }

    const tender = await this.prisma.tender.create({
      data: {
        ...tenderData,
        organization_id,
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
    return this.prisma.tender.findMany({
      where: { organization_id: organizationId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async update(id: string, userId: string, updateTenderDto: UpdateTenderDto) {
    const tender = await this.findOne(id);

    // Verify organization ownership
    const organization = await this.prisma.organization.findUnique({
      where: { id: tender.organization_id },
    });

    if (!organization || organization.user_id !== userId) {
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

    // Verify organization ownership
    const organization = await this.prisma.organization.findUnique({
      where: { id: tender.organization_id },
    });

    if (!organization || organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this tender');
    }

    await this.prisma.tender.delete({
      where: { id },
    });

    return { message: 'Tender deleted successfully' };
  }
}


