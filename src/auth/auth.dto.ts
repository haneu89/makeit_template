export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  uuid: string;
  fcm_token: string;
  platform?: string;
  domain?: string;
}

export class RegisterResponseDto {
  access_token: string;
  user_id: number;
}
