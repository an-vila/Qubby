export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    activated: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface ActivateAccountRequest {
  token: string;
}
