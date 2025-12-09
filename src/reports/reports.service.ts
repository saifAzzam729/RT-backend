import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, userId?: string) {
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        reporter_id: userId || null,
      },
    });

    // Create notification
    await this.prisma.reportNotification.create({
      data: {
        report_id: report.id,
        metadata: {
          report_topic: createReportDto.report_topic,
          listing_type: createReportDto.listing_type,
          listing_url: createReportDto.listing_url,
        },
      },
    });

    return {
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        created_at: report.created_at,
      },
    };
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        notifications: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        notifications: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updateStatus(id: string, updateDto: UpdateReportStatusDto) {
    const report = await this.findOne(id);

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: { status: updateDto.status },
    });

    // Update notification status
    const notificationStatus = updateDto.status === 'resolved' ? 'read' : 'new';
    const read_at = notificationStatus === 'read' ? new Date() : null;

    await this.prisma.reportNotification.updateMany({
      where: { report_id: id },
      data: {
        status: notificationStatus,
        read_at,
      },
    });

    return updatedReport;
  }

  async getNotifications() {
    return this.prisma.reportNotification.findMany({
      where: {
        status: 'new',
      },
      include: {
        report: {
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}


