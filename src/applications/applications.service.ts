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
import { QueryApplicationsDto } from './dto/query-applications.dto';

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

  // Unified application methods
  async findAll(queryDto: QueryApplicationsDto, userId?: string, userRole?: string) {
    const { userId: filterUserId, jobId, tenderId } = queryDto;

    const applications: any[] = [];

    // Get job applications if jobId is specified or no specific filter
    if (!tenderId || jobId) {
      const jobWhere: any = {};
      if (jobId) jobWhere.job_id = jobId;
      if (filterUserId) jobWhere.user_id = filterUserId;
      if (!jobId && !filterUserId && userId && userRole !== 'admin') {
        // If no filters and not admin, only show user's own applications
        jobWhere.user_id = userId;
      }

      const jobApplications = await this.prisma.jobApplication.findMany({
        where: jobWhere,
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

      applications.push(
        ...jobApplications.map((app) => ({
          id: app.id,
          jobId: app.job_id,
          userId: app.user_id,
          status: app.status,
          coverLetter: app.cover_letter,
          resume: app.resume_url,
          createdAt: app.created_at.toISOString(),
          updatedAt: app.updated_at.toISOString(),
        })),
      );
    }

    // Get tender applications if tenderId is specified or no specific filter
    if (!jobId || tenderId) {
      const tenderWhere: any = {};
      if (tenderId) tenderWhere.tender_id = tenderId;
      if (filterUserId) tenderWhere.user_id = filterUserId;
      if (!tenderId && !filterUserId && userId && userRole !== 'admin') {
        // If no filters and not admin, only show user's own applications
        tenderWhere.user_id = userId;
      }

      const tenderApplications = await this.prisma.tenderApplication.findMany({
        where: tenderWhere,
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

      applications.push(
        ...tenderApplications.map((app) => ({
          id: app.id,
          tenderId: app.tender_id,
          userId: app.user_id,
          status: app.status,
          coverLetter: app.cover_letter,
          resume: app.resume_url,
          createdAt: app.created_at.toISOString(),
          updatedAt: app.updated_at.toISOString(),
        })),
      );
    }

    return applications;
  }

  async findOne(applicationId: string, userId?: string, userRole?: string) {
    // Try to find as job application first
    let application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (application) {
      // Check authorization
      if (userRole !== 'admin' && application.user_id !== userId && application.job.company.user_id !== userId) {
        throw new ForbiddenException('You do not have permission to view this application');
      }

      return {
        id: application.id,
        jobId: application.job_id,
        userId: application.user_id,
        status: application.status,
        coverLetter: application.cover_letter,
        resume: application.resume_url,
        createdAt: application.created_at.toISOString(),
        updatedAt: application.updated_at.toISOString(),
      };
    }

    // Try to find as tender application
    const tenderApp = await this.prisma.tenderApplication.findUnique({
      where: { id: applicationId },
      include: {
        tender: {
          include: {
            organization: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (tenderApp) {
      // Check authorization
      if (userRole !== 'admin' && tenderApp.user_id !== userId && tenderApp.tender.organization.user_id !== userId) {
        throw new ForbiddenException('You do not have permission to view this application');
      }

      return {
        id: tenderApp.id,
        tenderId: tenderApp.tender_id,
        userId: tenderApp.user_id,
        status: tenderApp.status,
        coverLetter: tenderApp.cover_letter,
        resume: tenderApp.resume_url,
        createdAt: tenderApp.created_at.toISOString(),
        updatedAt: tenderApp.updated_at.toISOString(),
      };
    }

    throw new NotFoundException('Application not found');
  }

  async delete(applicationId: string, userId: string, userRole: string) {
    // Try to find as job application first
    let application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (application) {
      // Check authorization: user can delete their own, or company owner/admin can delete
      if (
        application.user_id !== userId &&
        application.job.company.user_id !== userId &&
        userRole !== 'admin'
      ) {
        throw new ForbiddenException('You do not have permission to delete this application');
      }

      await this.prisma.jobApplication.delete({
        where: { id: applicationId },
      });
      return { success: true };
    }

    // Try to find as tender application
    const tenderApp = await this.prisma.tenderApplication.findUnique({
      where: { id: applicationId },
      include: {
        tender: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (tenderApp) {
      // Check authorization: user can delete their own, or organization owner/admin can delete
      if (
        tenderApp.user_id !== userId &&
        tenderApp.tender.organization.user_id !== userId &&
        userRole !== 'admin'
      ) {
        throw new ForbiddenException('You do not have permission to delete this application');
      }

      await this.prisma.tenderApplication.delete({
        where: { id: applicationId },
      });
      return { success: true };
    }

    throw new NotFoundException('Application not found');
  }
}


