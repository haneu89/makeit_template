import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "dist/**",
  ]),
  // Custom rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 'any' 타입의 명시적 사용을 허용합니다.
      "@typescript-eslint/no-unused-vars": "off", // 사용하지 않은 변수에 대한 경고를 비활성화합니다.
      "@next/next/no-assign-module-variable": "off", // 모듈 변수에 대한 할당을 비허용합니다.
      "@typescript-eslint/no-unsafe-function-type": "off", // 함수 타입에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-unsafe-member-access": "off", // 멤버 접근에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-unsafe-call": "off", // 함수 호출에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-unsafe-argument": "off", // 인자에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-unsafe-return": "off", // 반환 값에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-empty-object-type": "off", // 빈 객체 타입에 대한 경고를 비활성화합니다.
      "@typescript-eslint/no-implicit-any-catch": "off", // 암시적 any 타입에 대한 경고를 비활성화합니다.
      "prefer-const": "off",
    },
  },
]);

export default eslintConfig;
