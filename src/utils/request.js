// src/utils/request.js
import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = ''; 

export const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

// ===================================
// 1. 请求拦截器：带上你的“通行证”
// ===================================
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, 
  error => Promise.reject(error)
);

// ===================================
// 2. 响应拦截器：统一处理回执
// ===================================
service.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob' || response.config.url.includes('/upload')) {
        return response; 
    }
    return response.data; 
  },
  (error) => {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.message || '网络好像开小差了...';
    const url = error.config?.url; // 获取请求的 URL

    if (status === 401) {
      // ✨ 增加判断：如果当前是在请求登录接口，直接显示后端的错误信息（账号密码错误）
      if (url.includes('/api/auth/login')) {
        message.error(errorMsg); 
      } else {
        // 如果是其他接口返回 401，说明是真的登录过期了
        message.error('登录状态已失效，请重新登录哦~');
        localStorage.clear();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      message.error(errorMsg || '权限不足哦！');
    } else {
      // 这里的 errorMsg 就会显示后端返回的“账号或密码写错啦~”
      message.error(errorMsg);
    }

    return Promise.reject(error);
  }
);

// ===================================
// 3. 基础请求工具封装
// ===================================
const request = {
    get: (url, params) => service.get(url, { params }),
    post: (url, data, config) => service.post(url, data, config),
    put: (url, data) => service.put(url, data),
    delete: (url, data) => service.delete(url, { data }), // 统一用 data 传参
};

// ===================================
// 4. 业务 API 函数 (全部改用 service 或封装后的 request)
// ===================================

// --- 认证 ---
export const loginApi = (data) => request.post('/api/auth/login', data);
export const registerApi = (data) => request.post('/api/auth/register', data);

// --- 球队与比赛 ---
export const getTeams = () => request.get('/teams/query_all');
export const addTeam = (data) => request.post('/teams/insert_team', data);
export const updateTeam = (data) => request.put('/teams/update_team', data);
export const deleteTeam = (name) => request.delete(`/teams/delete_team/${name}`); 

export const getMatches = () => request.get('/matches/query_all');
export const addMatch = (data) => request.post('/matches/insert_match', data); 
export const updateMatch = (data) => request.put('/matches/update_match', data); 
export const deleteMatch = (id) => request.delete(`/matches/delete_match/${id}`);
export const deleteMatches = (ids) => request.delete('/matches/batch_delete', { ids });

// 🚨 修正这个函数，改用 service 确保带上 Token
export const getMatchesByTeam = (teamName) => request.get(`/matches/query_by_team/${teamName}`);

// --- 留言板 ---
export const getMessages = () => request.get('/query_guestbook');
export const addMessage = (content) => request.post('/insert_message', { content });
export const delMessage = (uuid) => request.delete(`/delete_message/${uuid}`);
export const likeMessage = (uuid) => request.post(`/like_message/${uuid}`);

// --- 相册回忆 ---
export const getPhotos = () => request.get('/get_photos');
export const uploadPhoto = (formData) => request.post('/upload_photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePhoto = (id) => request.delete(`/delete_photo/${id}`);

// --- 用户管理 API ---
export const getAllUsers = () => request.get('/api/users/all');
export const updateUserRole = (id, role) => request.put(`/api/users/update_role/${id}`, { role });
export const deleteUser = (id) => request.delete(`/api/users/delete/${id}`);

// --- 聊天 API ---
export const getChatHistory = (targetId) => service.get(`/api/chat/history/${targetId}`);
export const sendChatMessage = (data) => service.post('/api/chat/send', data);
export const clearChatHistory = (targetId) => service.delete(`/api/chat/clear/${targetId}`);
export const getChatUsers = () => service.get('/api/users/all');