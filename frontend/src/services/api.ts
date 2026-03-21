const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '请求失败');
  }
  
  return response.json();
}

// 认证相关API
export const authApi = {
  // 发送验证码
  sendVerificationCode: (email: string) => {
    return request('/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  // 验证码登录/注册
  verifyCodeLogin: (email: string, code: string, password?: string) => {
    return request<{ token: string; user: any }>('/auth/verify-code-login', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    });
  },
  
  // 密码登录
  passwordLogin: (email: string, password: string) => {
    return request<{ token: string; user: any }>('/auth/password-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return request<{ user: any }>('/auth/me');
  },
};

// 问卷相关API
export const questionnaireApi = {
  // 获取问卷
  getQuestionnaire: () => {
    return request<{ questionnaire: any }>('/questionnaire');
  },
  
  // 保存问卷
  saveQuestionnaire: (data: any) => {
    return request('/questionnaire/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 提交问卷
  submitQuestionnaire: (data: any) => {
    return request('/questionnaire/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 匹配相关API
export const matchApi = {
  // 获取匹配状态
  getMatchStatus: () => {
    return request<{ countdown: number; participantCount: number }>('/match/status');
  },
  
  // 获取匹配结果
  getMatchResults: () => {
    return request<{ matches: any[] }>('/match/results');
  },
};

// 管理员相关API
export const adminApi = {
  // 管理员登录
  login: (username: string, password: string) => {
    return request<{ token: string; admin: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  // 获取用户列表
  getUsers: () => {
    return request<{ users: any[] }>('/admin/users');
  },
  
  // 获取匹配统计
  getMatchStats: () => {
    return request<{ stats: any }>('/admin/match-stats');
  },
  
  // 手动执行匹配任务
  runMatchingTask: () => {
    return request<{ message: string; matches: any[] }>('/admin/run-matching', {
      method: 'POST',
    });
  },
};