export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
  [key: string]: any;
}

export interface Campus {
  id: number;
  name: string;
}

export interface UserAPIResponse {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  displayname: string;
  phone: 'hidden' | string;
  kind: 'student';
  campus: [Campus];
}

export interface FTRequest {
  url: string;
  access_token: string;
  data?: any;
  params?: {
    [key: string]: string;
  };
  user?: any;
}
