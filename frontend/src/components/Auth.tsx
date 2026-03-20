import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../services/api';

// 验证模式
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').endsWith('@edu.cn', '请输入教育邮箱（后缀为edu.cn）'),
  password: z.string().min(6, '密码至少6位'),
});

const verifyCodeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').endsWith('@edu.cn', '请输入教育邮箱（后缀为edu.cn）'),
  code: z.string().length(6, '验证码为6位数字'),
  password: z.string().min(6, '密码至少6位').optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'verify'>('login');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 登录表单
  const { register: loginRegister, handleSubmit: loginHandleSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 验证码表单
  const { register: verifyRegister, handleSubmit: verifyHandleSubmit, formState: { errors: verifyErrors } } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  // 发送验证码
  const handleSendCode = async (email: string) => {
    if (!email || !email.endsWith('@edu.cn')) {
      setError('请输入有效的教育邮箱');
      return;
    }

    setIsSendingCode(true);
    setError('');
    
    try {
      await authApi.sendVerificationCode(email);
      setSuccess('验证码已发送');
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError((err as Error).message || '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 密码登录
  const onLoginSubmit = async (data: LoginFormData) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await authApi.passwordLogin(data.email, data.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.href = '/';
    } catch (err) {
      setError((err as Error).message || '登录失败');
    }
  };

  // 验证码登录/注册
  const onVerifySubmit = async (data: VerifyCodeFormData) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await authApi.verifyCodeLogin(data.email, data.code, data.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.href = '/';
    } catch (err) {
      setError((err as Error).message || '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-oxford-light p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-oxford-blue">旦缘</h1>
          <p className="text-gray-600 mt-2">复旦大学学生恋爱匹配平台</p>
        </div>

        {/* 标签切换 */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center rounded-t-lg ${activeTab === 'login' ? 'bg-oxford-blue text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('login')}
          >
            密码登录
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center rounded-t-lg ${activeTab === 'verify' ? 'bg-oxford-blue text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('verify')}
          >
            验证码登录/注册
          </button>
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
        {activeTab === 'login' && (
          <form onSubmit={loginHandleSubmit(onLoginSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
                {...loginRegister('email')}
              />
              {loginErrors.email && (
                <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">密码</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
                {...loginRegister('password')}
              />
              {loginErrors.password && (
                <p className="text-red-500 text-sm mt-1">{loginErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-oxford-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition"
            >
              登录
            </button>
          </form>
        )}

        {/* 验证码表单 */}
        {activeTab === 'verify' && (
          <form onSubmit={verifyHandleSubmit(onVerifySubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">邮箱</label>
              <div className="flex">
                <input
                  type="email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
                  {...verifyRegister('email')}
                />
                <button
                  type="button"
                  className="bg-oxford-blue text-white py-2 px-4 rounded-r-md hover:bg-opacity-90 transition disabled:bg-gray-400"
                  onClick={() => {
                    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                    if (emailInput) {
                      handleSendCode(emailInput.value);
                    }
                  }}
                  disabled={isSendingCode || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
              {verifyErrors.email && (
                <p className="text-red-500 text-sm mt-1">{verifyErrors.email.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">验证码</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
                {...verifyRegister('code')}
              />
              {verifyErrors.code && (
                <p className="text-red-500 text-sm mt-1">{verifyErrors.code.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">设置密码（可选）</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue"
                placeholder="设置密码后下次可直接登录"
                {...verifyRegister('password')}
              />
              {verifyErrors.password && (
                <p className="text-red-500 text-sm mt-1">{verifyErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-oxford-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition"
            >
              登录/注册
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>© 2026 旦缘 - 复旦大学学生恋爱匹配平台</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;