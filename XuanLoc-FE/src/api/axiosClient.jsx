import axios from 'axios';
import { ENDPOINTS } from './endpoints.jsx';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Nhiều request 401/403 cùng lúc chỉ nên trigger 1 lần gọi refresh-token,
// các request còn lại chờ chung promise này thay vì tự gọi refresh riêng.
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Backend trả về 403 hoặc 401 khi token lỗi/hết hạn
    if (
      (error.response?.status === 403 || error.response?.status === 401) &&
      !originalRequest._retry &&
      originalRequest.url !== ENDPOINTS.LOGIN &&
      originalRequest.url !== ENDPOINTS.REFRESH_TOKEN
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosClient
            .post(ENDPOINTS.REFRESH_TOKEN)
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // /auth/me chỉ là request "dò" phiên đăng nhập lúc khởi động app (AuthGate) - để nó
        // reject bình thường cho Redux xử lý, không hard-redirect. Nếu không loại trừ, khách
        // chưa đăng nhập ghé trang chủ (hoặc /login) sẽ bị đưa vào vòng lặp reload vô hạn vì
        // /auth/me và /auth/refresh-token cùng 401 khi không có cookie nào cả.
        if (originalRequest.url !== ENDPOINTS.ME) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    const errorMessage =
      error.response?.data?.message || 'Có lỗi xảy ra từ máy chủ.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;