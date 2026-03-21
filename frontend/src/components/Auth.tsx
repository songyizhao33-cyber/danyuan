import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../services/api';

// 验证模式
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').refine((email) => {
    return email.endsWith('@fudan.edu.cn') || email.endsWith('@m.fudan.edu.cn');
  }, '请输入复旦大学邮箱（@fudan.edu.cn 或 @m.fudan.edu.cn）'),
  password: z.string().min(6, '密码至少6位'),
});

const verifyCodeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').refine((email) => {
    return email.endsWith('@fudan.edu.cn') || email.endsWith('@m.fudan.edu.cn');
  }, '请输入复旦大学邮箱（@fudan.edu.cn 或 @m.fudan.edu.cn）'),
  code: z.string().length(6, '验证码为6位数字'),
  password: z.string().min(6, '密码至少6位').optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'verify'>('verify');
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
    if (!email || (!email.endsWith('@fudan.edu.cn') && !email.endsWith('@m.fudan.edu.cn'))) {
      setError('请输入有效的复旦大学邮箱');
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
    <div className="min-h-screen flex flex-col">
      {/* 英雄区域 */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Fudan%20University%20campus%20with%20cherry%20blossoms%20in%20spring%2C%20soft%20blue%20sky%2C%20romantic%20atmosphere%2C%20soft%20focus&image_size=landscape_16_9" 
            alt="复旦大学樱花" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-800">旦缘</h1>
              <p className="text-gray-600 mt-2">复旦大学学生恋爱匹配平台</p>
            </div>

            {/* 用户说明 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>首次登录</strong>：请使用邮箱验证码登录，并设置密码
              </p>
              <p className="text-blue-800 text-sm mt-1">
                <strong>后续登录</strong>：可直接使用密码登录
              </p>
            </div>

            {/* 标签切换 */}
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 px-4 text-center rounded-t-lg ${activeTab === 'login' ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('login')}
              >
                密码登录
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center rounded-t-lg ${activeTab === 'verify' ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'}`}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    {...loginRegister('password')}
                  />
                  {loginErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{loginErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
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
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      {...verifyRegister('email')}
                    />
                    <button
                      type="button"
                      className="bg-blue-800 text-white py-3 px-4 rounded-r-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    {...verifyRegister('code')}
                  />
                  {verifyErrors.code && (
                    <p className="text-red-500 text-sm mt-1">{verifyErrors.code.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">设置密码</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="设置密码后下次可直接登录"
                    {...verifyRegister('password')}
                  />
                  {verifyErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{verifyErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
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
      </div>
    </div>
  );
};

export default Auth;