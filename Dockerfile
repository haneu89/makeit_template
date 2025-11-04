FROM node:24-alpine
WORKDIR /usr/src/app

# Alpine Linux에 필요한 빌드 도구 및 런타임 라이브러리 설치
RUN apk add --no-cache python3 make g++ libc6-compat

# 의존성 파일 복사
COPY package*.json ./

# 모든 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN [ -d "./prisma" ] && npx prisma generate || echo "No prisma directory, skipping generate"

# 애플리케이션 빌드
RUN npm run build

# 개발 의존성 제거 (프로덕션 최적화)
RUN npm prune --production

# 환경 변수 설정
ENV NODE_ENV=production

# 애플리케이션 실행
CMD ["npm", "start"]