import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyToJobDto } from './dto/apply-to-job.dto';
import { ApplyToTenderDto } from './dto/apply-to-tender.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  // Job Applications
  async applyToJob(userId: string, jobId: string, applyDto: ApplyToJobDto) {
    // Check if job exists and is open
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'open') {
      throw new ForbiddenException('This job is not accepting applications');
    }

    // Check if already applied
    const existing = await this.prisma.jobApplication.findUnique({
      where: {
        job_id_user_id: {
          job_id: jobId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // Create application
    const application = await this.prisma.jobApplication.create({
      data: {
        job_id: jobId,
        user_id: userId,
        ...applyDto,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Track analytics
    await this.prisma.analytics.create({
      data: {
        user_id: userId,
        event_type: 'job_application',
        entity_type: 'job',
        entity_id: jobId,
      },
    });

    return application;
  }

  async getMyJobApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { user_id: userId },
      include: {
        job: {
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getJobApplicationsForCompany(companyId: string, userId: string) {
    // Verify company ownership
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to view applications for this company');
    }

    return this.prisma.jobApplication.findMany({
      where: {
        job: {
          company_id: companyId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateJobApplicationStatus(
    applicationId: string,
    userId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify company ownership
    if (application.job.company.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: updateDto.status },
    });
  }

  // Tender Applications
  async applyToTender(userId: string, tenderId: string, applyDto: ApplyToTenderDto) {
    // Check if tender exists and is open
    const tender = await this.prisma.tender.findUnique({
      where: { id: tenderId },
    });

    if (!tender) {
      throw new NotFoundException('Tender not found');
    }

    if (tender.status !== 'open') {
      throw new ForbiddenException('This tender is not accepting applications');
    }

    // Check if already applied
    const existing = await this.prisma.tenderApplication.findUnique({
      where: {
        tender_id_user_id: {
          tender_id: tenderId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this tender');
    }

    // Create application
    const application = await this.prisma.tenderApplication.create({
      data: {
        tender_id: tenderId,
        user_id: userId,
        ...applyDto,
      },
      include: {
        tender: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Track analytics
    await this.prisma.analytics.create({
      data: {
        user_id: userId,
        event_type: 'tender_application',
        entity_type: 'tender',
        entity_id: tenderId,
      },
    });

    return application;
  }

  async getMyTenderApplications(userId: string) {
    return this.prisma.tenderApplication.findMany({
      where: { user_id: userId },
      include: {
        tender: {
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getTenderApplicationsForOrganization(organizationId: string, userId: string) {
    // Verify organization ownership
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to view applications for this organization');
    }

    return this.prisma.tenderApplication.findMany({
      where: {
        tender: {
          organization_id: organizationId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
          },
        },
        tender: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateTenderApplicationStatus(
    applicationId: string,
    userId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.tenderApplication.findUnique({
      where: { id: applicationId },
      include: {
        tender: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify organization ownership
    if (application.tender.organization.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    return this.prisma.tenderApplication.update({
      where: { id: applicationId },
      data: { status: updateDto.status },
    });
  }
}


