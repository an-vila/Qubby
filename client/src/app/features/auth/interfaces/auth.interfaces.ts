export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  user: string;
  email: string;
  password: string;
  password_again: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
  new_password_again: string;
}

export interface ActivateAccountRequest {
  token: string;
}
