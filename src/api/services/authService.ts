import axiosInstance, {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken,
} from '../axiosInstance';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, User, AuthTokens } from '../types';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      { name, email, password }
    );
    setAccessToken(data.data.tokens.accessToken);
    setRefreshToken(data.data.tokens.refreshToken);
    return data;
  },

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    setAccessToken(data.data.tokens.accessToken);
    setRefreshToken(data.data.tokens.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await axiosInstance
        .post(ENDPOINTS.AUTH.LOGOUT, { refreshToken })
        .catch(() => {});
    }
    clearTokens();
  },

  async googleAuth(credential: string): Promise<ApiResponse<AuthResponse>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/auth/google',
      { credential }
    );
    setAccessToken(data.data.tokens.accessToken);
    setRefreshToken(data.data.tokens.refreshToken);
    return data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await axiosInstance.get<ApiResponse<User>>(
      ENDPOINTS.AUTH.ME
    );
    return data;
  },
};

export default authService;
