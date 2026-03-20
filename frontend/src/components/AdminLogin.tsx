import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../services/api';

// 验证模式
const loginSchema = z.object({
  username: z.string().nonempty('请输入用户名'),
  password: z.string().nonempty('请输入密码'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 登录
  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await adminApi.login(data.username, data.password);
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('admin', JSON.stringify(response.admin));
      window.location.href = '/admin';
    } catch (err) {
      setError((err as Error).message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-oxford-light p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-oxford-blue">旦缘 - 管理员登录</h1>
        </div>

        {/* 错误和成功提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">用户名</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-oxford-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>© 2026 旦缘 - 复旦大学学生恋爱匹配平台</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;