import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { FooterContentDto } from './dto/footer-content.dto';
import { FormConfigDto } from './dto/form-config.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(section?: string, language?: string) {
    const where: any = {};
    if (section) {
      where.section = section;
    }
    if (language) {
      where.language = language;
    }

    const contents = await this.prisma.content.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return contents.map((content) => ({
      id: content.id,
      key: content.key,
      section: content.section,
      language: content.language,
      value: content.value,
      type: content.type,
      createdAt: content.created_at.toISOString(),
      updatedAt: content.updated_at.toISOString(),
    }));
  }

  async findByKey(key: string, language: string = 'en') {
    const content = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Content with key "${key}" and language "${language}" not found`);
    }

    return {
      id: content.id,
      key: content.key,
      section: content.section,
      language: content.language,
      value: content.value,
      type: content.type,
      createdAt: content.created_at.toISOString(),
      updatedAt: content.updated_at.toISOString(),
    };
  }

  async create(createContentDto: CreateContentDto) {
    const { key, section, language = 'en', value, type = 'text' } = createContentDto;

    // Check if content with same key and language already exists
    const existing = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Content with key "${key}" and language "${language}" already exists`);
    }

    const content = await this.prisma.content.create({
      data: {
        key,
        section,
        language,
        value: value as any,
        type,
      },
    });

    return {
      id: content.id,
      key: content.key,
      section: content.section,
      language: content.language,
      value: content.value,
      type: content.type,
      createdAt: content.created_at.toISOString(),
      updatedAt: content.updated_at.toISOString(),
    };
  }

  async update(key: string, language: string, updateContentDto: UpdateContentDto) {
    const content = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Content with key "${key}" and language "${language}" not found`);
    }

    const updated = await this.prisma.content.update({
      where: {
        id: content.id,
      },
      data: {
        ...(updateContentDto.section && { section: updateContentDto.section }),
        ...(updateContentDto.value !== undefined && { value: updateContentDto.value as any }),
        ...(updateContentDto.type && { type: updateContentDto.type }),
      },
    });

    return {
      id: updated.id,
      key: updated.key,
      section: updated.section,
      language: updated.language,
      value: updated.value,
      type: updated.type,
      createdAt: updated.created_at.toISOString(),
      updatedAt: updated.updated_at.toISOString(),
    };
  }

  async delete(key: string, language: string) {
    const content = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Content with key "${key}" and language "${language}" not found`);
    }

    await this.prisma.content.delete({
      where: {
        id: content.id,
      },
    });

    return { success: true };
  }

  async getFooterContent(language: string = 'en') {
    // Footer content is stored as a single JSON object with key 'footer' and specific language
    try {
      const content = await this.prisma.content.findUnique({
        where: {
          key_language: {
            key: 'footer',
            language,
          },
        },
      });

      if (!content || content.section !== 'footer') {
        // Return default structure if not found
        return this.getDefaultFooterContent();
      }

      return content.value as any;
    } catch (error) {
      return this.getDefaultFooterContent();
    }
  }

  async updateFooterContent(language: string, footerContentDto: FooterContentDto) {
    // Check if footer content exists
    const existing = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key: 'footer',
          language,
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.content.update({
        where: {
          id: existing.id,
        },
        data: {
          value: footerContentDto as any,
          section: 'footer',
        },
      });
      return updated.value as any;
    } else {
      const created = await this.prisma.content.create({
        data: {
          key: 'footer',
          section: 'footer',
          language,
          value: footerContentDto as any,
          type: 'json',
        },
      });
      return created.value as any;
    }
  }

  async getFormConfig(formType: string, language: string = 'en') {
    const key = `form.${formType}`;

    try {
      const content = await this.prisma.content.findUnique({
        where: {
          key_language: {
            key,
            language,
          },
        },
      });

      if (!content || content.section !== 'form') {
        throw new NotFoundException(`Form configuration for "${formType}" with language "${language}" not found`);
      }

      return content.value as any;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Form configuration for "${formType}" with language "${language}" not found`);
    }
  }

  async updateFormConfig(formType: string, language: string, formConfigDto: FormConfigDto) {
    const key = `form.${formType}`;

    // Validate formType matches
    if (formConfigDto.formType !== formType) {
      throw new BadRequestException('Form type mismatch');
    }

    const existing = await this.prisma.content.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.content.update({
        where: {
          id: existing.id,
        },
        data: {
          value: formConfigDto as any,
          section: 'form',
        },
      });
      return updated.value as any;
    } else {
      const created = await this.prisma.content.create({
        data: {
          key,
          section: 'form',
          language,
          value: formConfigDto as any,
          type: 'json',
        },
      });
      return created.value as any;
    }
  }

  private getDefaultFooterContent() {
    return {
      description: '',
      contactEmail: '',
      contactLocation: '',
      socialLinks: {},
      platformLinks: [],
      supportLinks: [],
      copyright: '',
      hashtags: {
        jobs: '',
        tenders: '',
      },
    };
  }
}
