import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UpdateUserDto, CreateUserDto } from './user.dto';
import { Role } from '../../types/role';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 회원 목록 조회 (DataGrid용)
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        socialAccounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            attachments: true,
          },
        },
      },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // OAuth 제공자 목록
        providers: user.socialAccounts.map((sa) => sa.provider),
        // 첫 로그인 날짜 (첫 번째 소셜 계정 생성일)
        firstLoginAt: user.socialAccounts.length > 0
          ? user.socialAccounts
              .filter((sa) => sa.createdAt !== null)
              .sort((a, b) => (a.createdAt!.getTime() - b.createdAt!.getTime()))[0]?.createdAt || null
          : null,
        // 업로드한 파일 수
        fileCount: user._count.attachments,
      })),
    };
  }

  /**
   * 회원 상세 조회
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        socialAccounts: {
          select: {
            provider: true,
            providerUserId: true,
            createdAt: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  /**
   * 회원 생성 (관리자)
   */
  async create(dto: CreateUserDto) {
    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
        password: hashedPassword,
        mustChangePassword: dto.mustChangePassword ?? true, // 기본값 true
        isActive: true,
      },
    });

    return user;
  }

  /**
   * 회원 정보 수정 (관리자)
   * @param currentUserRole 현재 수정하는 사용자의 역할 (MANAGER는 ADMIN 역할 설정 불가)
   */
  async update(id: number, dto: UpdateUserDto, currentUserRole?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // MANAGER는 ADMIN 역할을 설정할 수 없음
    if (currentUserRole === 'MANAGER' && dto.role === 'ADMIN') {
      throw new BadRequestException('일반관리자는 시스템관리자 역할을 설정할 수 없습니다.');
    }

    // 이메일 중복 체크 (다른 사용자가 사용 중인지)
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('이미 사용 중인 이메일입니다.');
      }
    }

    // 비밀번호 변경 시 해시화
    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        role: dto.role,
        isActive: dto.isActive,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return updated;
  }

  /**
   * 회원 삭제 (관리자)
   */
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 업로드한 파일이 있는지 체크
    const fileCount = await this.prisma.attachment.count({
      where: { userId: id },
    });

    if (fileCount > 0) {
      throw new BadRequestException(
        `사용자가 업로드한 파일이 ${fileCount}개 있습니다. 파일을 먼저 삭제해주세요.`,
      );
    }

    // SocialAccount는 CASCADE로 자동 삭제됨
    await this.prisma.user.delete({ where: { id } });

    return { message: '사용자가 삭제되었습니다.' };
  }

  /**
   * 통계 정보
   */
  async getStats() {
    const [totalUsers, activeUsers, adminCount, usersByRole] = await Promise.all([
      // 전체 회원 수
      this.prisma.user.count(),
      // 활성 회원 수
      this.prisma.user.count({ where: { isActive: true } }),
      // 관리자 수
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      // 역할별 회원 수
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminCount,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }
}
