import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveEntityDto } from './dto/approve-entity.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { ApproveSignUpRequestDto } from './dto/approve-signup-request.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../auth/email.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async approveEntity(approveDto: ApproveEntityDto) {
    const { entityType, entityId, approved } = approveDto;

    if (entityType === 'organization') {
      const organization = await this.prisma.organization.findUnique({
        where: { id: entityId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      await this.prisma.organization.update({
        where: { id: entityId },
        data: { approved },
      });

      return {
        message: `Organization ${approved ? 'approved' : 'unapproved'} successfully`,
      };
    } else if (entityType === 'company') {
      const company = await this.prisma.company.findUnique({
        where: { id: entityId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      await this.prisma.company.update({
        where: { id: entityId },
        data: { approved },
      });

      return {
        message: `Company ${approved ? 'approved' : 'unapproved'} successfully`,
      };
    }

    throw new BadRequestException('Invalid entity type');
  }

  async getPendingApprovals() {
    const [pendingOrganizations, pendingCompanies] = await Promise.all([
      this.prisma.organization.findMany({
        where: { approved: false },
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
      }),
      this.prisma.company.findMany({
        where: { approved: false },
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
      }),
    ]);

    return {
      organizations: pendingOrganizations,
      companies: pendingCompanies,
    };
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalOrganizations,
      totalCompanies,
      totalJobs,
      totalTenders,
      totalJobApplications,
      totalTenderApplications,
      recentActivity,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.organization.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.tender.count(),
      this.prisma.jobApplication.count(),
      this.prisma.tenderApplication.count(),
      this.prisma.analytics.findMany({
        take: 50,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      }),
    ]);

    return {
      totals: {
        users: totalUsers,
        organizations: totalOrganizations,
        companies: totalCompanies,
        jobs: totalJobs,
        tenders: totalTenders,
        jobApplications: totalJobApplications,
        tenderApplications: totalTenderApplications,
      },
      recentActivity,
    };
  }

  async getPricingPlan(planId: string) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { plan_id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${planId} not found`);
    }

    return plan;
  }

  async getAllPricingPlans() {
    return this.prisma.pricingPlan.findMany({
      orderBy: [
        { plan_type: 'asc' },
        { created_at: 'asc' },
      ],
    });
  }

  async createPricingPlan(createDto: CreatePricingPlanDto) {
    // Check if plan_id already exists
    const existing = await this.prisma.pricingPlan.findUnique({
      where: { plan_id: createDto.plan_id },
    });

    if (existing) {
      throw new BadRequestException(`Pricing plan with ID ${createDto.plan_id} already exists`);
    }

    const plan = await this.prisma.pricingPlan.create({
      data: {
        plan_id: createDto.plan_id,
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
        currency: createDto.currency || 'USD',
        period: createDto.period,
        plan_type: createDto.plan_type,
        features: createDto.features || [],
      },
    });

    return {
      message: 'Pricing plan created successfully',
      plan,
    };
  }

  async updatePricingPlan(planId: string, updateDto: UpdatePricingPlanDto) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { plan_id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${planId} not found`);
    }

    const updatedPlan = await this.prisma.pricingPlan.update({
      where: { plan_id: planId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description && { description: updateDto.description }),
        ...(updateDto.price !== undefined && { price: updateDto.price }),
        ...(updateDto.currency && { currency: updateDto.currency }),
        ...(updateDto.period && { period: updateDto.period }),
        ...(updateDto.plan_type && { plan_type: updateDto.plan_type }),
        ...(updateDto.features && { features: updateDto.features }),
      },
    });

    return {
      message: 'Pricing plan updated successfully',
      plan: updatedPlan,
    };
  }

  async deletePricingPlan(planId: string) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { plan_id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${planId} not found`);
    }

    await this.prisma.pricingPlan.delete({
      where: { plan_id: planId },
    });

    return {
      message: 'Pricing plan deleted successfully',
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { full_name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          phone: true,
          avatar_url: true,
          bio: true,
          email_verified: true,
          plan_status: true,
          plan_id: true,
          plan_expires_at: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        plan_id: true,
        plan_expires_at: true,
        created_at: true,
        updated_at: true,
        organizations: {
          select: {
            id: true,
            name: true,
            approved: true,
          },
        },
        companies: {
          select: {
            id: true,
            name: true,
            approved: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.prisma.profile.findUnique({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }
    }

    // Check if phone is being updated and if it's already taken
    if (updateDto.phone && updateDto.phone !== user.phone) {
      const existingUser = await this.prisma.profile.findFirst({
        where: { phone: updateDto.phone },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Phone number is already in use');
      }
    }

    const updatedUser = await this.prisma.profile.update({
      where: { id: userId },
      data: {
        ...(updateDto.email && { email: updateDto.email }),
        ...(updateDto.full_name !== undefined && { full_name: updateDto.full_name }),
        ...(updateDto.phone !== undefined && { phone: updateDto.phone }),
        ...(updateDto.role && { role: updateDto.role }),
        ...(updateDto.avatar_url !== undefined && { avatar_url: updateDto.avatar_url }),
        ...(updateDto.bio !== undefined && { bio: updateDto.bio }),
        ...(updateDto.email_verified !== undefined && { email_verified: updateDto.email_verified }),
        ...(updateDto.plan_status && { plan_status: updateDto.plan_status }),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        plan_id: true,
        plan_expires_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      throw new BadRequestException('Cannot delete admin users');
    }

    await this.prisma.profile.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  async updateUserPlan(userId: string, updatePlanDto: UpdateUserPlanDto) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate plan_id if provided
    if (updatePlanDto.plan_id) {
      const plan = await this.prisma.pricingPlan.findUnique({
        where: { plan_id: updatePlanDto.plan_id },
      });

      if (!plan) {
        throw new BadRequestException(`Pricing plan with ID ${updatePlanDto.plan_id} not found`);
      }
    }

    const updatedUser = await this.prisma.profile.update({
      where: { id: userId },
      data: {
        ...(updatePlanDto.plan_id !== undefined && { plan_id: updatePlanDto.plan_id }),
        ...(updatePlanDto.plan_status && { plan_status: updatePlanDto.plan_status }),
        ...(updatePlanDto.plan_expires_at && { 
          plan_expires_at: updatePlanDto.plan_expires_at ? new Date(updatePlanDto.plan_expires_at) : null 
        }),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone: true,
        avatar_url: true,
        bio: true,
        email_verified: true,
        plan_status: true,
        plan_id: true,
        plan_expires_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      message: 'User plan updated successfully',
      user: updatedUser,
    };
  }

  async getAllSignUpRequests(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [requests, total] = await Promise.all([
      this.prisma.signUpRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          reviewed_by: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      }),
      this.prisma.signUpRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSignUpRequestById(requestId: string) {
    const request = await this.prisma.signUpRequest.findUnique({
      where: { id: requestId },
      include: {
        reviewed_by: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Signup request with ID ${requestId} not found`);
    }

    return request;
  }

  async approveSignUpRequest(requestId: string, approveDto: ApproveSignUpRequestDto, adminId: string) {
    const { status, reason_note } = approveDto;

    const request = await this.prisma.signUpRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Signup request with ID ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(`Signup request is already ${request.status}`);
    }

    // Validate reason_note for rejected and need_more_info
    if ((status === 'rejected' || status === 'need_more_info') && !reason_note) {
      throw new BadRequestException('Reason note is required for rejected or need_more_info status');
    }

    if (status === 'approved') {
      // Check if user already exists
      const existingUser = await this.prisma.profile.findUnique({
        where: { email: request.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Generate OTP
      const otp = this.emailService.generateOTP();
      const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Create user
      const user = await this.prisma.profile.create({
        data: {
          email: request.email,
          password_hash: request.password_hash,
          full_name: request.full_name,
          role: request.role,
          phone: request.phone,
          email_verification_otp: otp,
          otp_expires_at,
          email_verified: false,
        },
      });

      // Update signup request with user_id and status
      await this.prisma.signUpRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          user_id: user.id,
          reviewed_by_id: adminId,
          reviewed_at: new Date(),
          reason_note: reason_note || null,
        },
      });

      // Send OTP email
      await this.emailService.sendOTP(request.email, otp, request.full_name || undefined);

      return {
        message: 'Signup request approved and user created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } else {
      // Update status for rejected or need_more_info
      await this.prisma.signUpRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewed_by_id: adminId,
          reviewed_at: new Date(),
          reason_note: reason_note || null,
        },
      });

      return {
        message: `Signup request ${status} successfully`,
      };
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, full_name, role, phone } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if phone number is already in use (if provided)
    if (phone) {
      const existingPhoneUser = await this.prisma.profile.findFirst({
        where: { phone },
      });

      if (existingPhoneUser) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = this.emailService.generateOTP();
    const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await this.prisma.profile.create({
      data: {
        email,
        password_hash,
        full_name,
        role,
        phone,
        email_verification_otp: otp,
        otp_expires_at,
        email_verified: false,
      },
    });

    // Send OTP email
    await this.emailService.sendOTP(email, otp, full_name);

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
    };
  }
}


