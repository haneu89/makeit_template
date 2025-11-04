import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await createAdmin()
  await createPages()
  console.log('Seed 실행 완료!')
}

async function createPages() {
  // 이용약관 페이지 생성 또는 업데이트
  await prisma.page.upsert({
    where: {
      route_domain: {
        route: 'terms',
        domain: 'default'
      }
    },
    update: {},
    create: {
      route: 'terms',
      domain: 'default',
      title: '이용약관',
      content: '<h1>이용약관</h1>',
    },
  });

  // 개인정보처리방침 페이지 생성 또는 업데이트
  await prisma.page.upsert({
    where: {
      route_domain: {
        route: 'privacy',
        domain: 'default'
      }
    },
    update: {},
    create: {
      route: 'privacy',
      domain: 'default',
      title: '개인정보처리방침',
      content: '<h1>개인정보처리방침</h1>',
    },
  });
  console.log('기본 페이지 생성 완료')
}

async function createAdmin() {
  try {
    // 관리자 계정 생성
    const adminAccount = process.env.ADMIN_ACCOUNT || 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
    const loginMethod = process.env.NEXT_PUBLIC_LOGIN_METHOD || 'email';

    console.log(`관리자 계정 설정: ${adminAccount} (암호는 보안상 표시하지 않음)`);
    
    // 안전한 솔트 값으로 해시 생성 (서버 환경 차이 최소화)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // 로그인 방식에 따라 기존 관리자 찾기
    const existingAdmin = loginMethod === 'username'
      ? await prisma.user.findUnique({ where: { username: adminAccount } })
      : await prisma.user.findUnique({ where: { email: adminAccount } });

    if (!existingAdmin) {
      const adminData = {
        password: hashedPassword,
        name: '관리자',
        role: 'ADMIN',
      };

      // 로그인 방식에 따라 email 또는 username 설정
      if (loginMethod === 'username') {
        adminData.username = adminAccount;
      } else {
        adminData.email = adminAccount;
      }

      const adminUser = await prisma.user.create({ data: adminData });
      console.log(`관리자 계정이 생성되었습니다. ID: ${adminUser.id}`);
      return adminUser;
    } else {
      // 기존 관리자가 있다면 비밀번호 업데이트
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      });
      console.log(`기존 관리자 계정을 업데이트했습니다. ID: ${updatedAdmin.id}`);
      return updatedAdmin;
    }
  } catch (error) {
    console.error('관리자 계정 생성 중 오류 발생:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Seed 실행 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });