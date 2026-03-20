import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [runMatchingSuccess, setRunMatchingSuccess] = useState('');

  // 检查是否登录
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      window.location.href = '/admin/login';
    }
  }, []);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 并行加载用户列表和匹配统计
      const [usersResponse, statsResponse] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getMatchStats()
      ]);
      setUsers(usersResponse.users);
      setStats(statsResponse.stats);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 手动执行匹配任务
  const handleRunMatching = async () => {
    setIsLoading(true);
    setError('');
    setRunMatchingSuccess('');
    try {
      await adminApi.runMatchingTask();
      setRunMatchingSuccess('匹配任务执行成功');
      // 重新加载数据
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (err) {
      setError('执行匹配任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/admin/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-oxford-light">
        <div className="text-center">
          <p className="text-oxford-blue font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oxford-light p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-oxford-blue text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">旦缘 - 管理员面板</h1>
            <button 
              className="bg-white text-oxford-blue px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        </header>
        
        <main className="bg-white p-6 rounded-b-lg shadow-lg">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* 成功提示 */}
          {runMatchingSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {runMatchingSuccess}
            </div>
          )}

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">总用户数</h3>
              <p className="text-2xl font-bold text-oxford-blue">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">已完成问卷</h3>
              <p className="text-2xl font-bold text-oxford-blue">{stats?.completedUsers || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">总匹配数</h3>
              <p className="text-2xl font-bold text-oxford-blue">{stats?.totalMatches || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">当前轮次</h3>
              <p className="text-2xl font-bold text-oxford-blue">{stats?.currentRound || 0}</p>
            </div>
          </div>

          {/* 匹配统计 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">匹配统计</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">轮次</th>
                    <th className="py-2 px-4 border-b">匹配数</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.roundStats?.map((round: any) => (
                    <tr key={round.round}>
                      <td className="py-2 px-4 border-b">{round.round}</td>
                      <td className="py-2 px-4 border-b">{round.matchCount}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td className="py-2 px-4 border-b text-center" colSpan={2}>暂无数据</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 手动执行匹配任务 */}
          <div className="mb-8">
            <button
              className="bg-oxford-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition"
              onClick={handleRunMatching}
              disabled={isLoading}
            >
              手动执行匹配任务
            </button>
          </div>

          {/* 用户列表 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">用户列表</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">邮箱</th>
                    <th className="py-2 px-4 border-b">注册时间</th>
                    <th className="py-2 px-4 border-b">问卷状态</th>
                    <th className="py-2 px-4 border-b">上次登录</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="py-2 px-4 border-b">{user.email}</td>
                      <td className="py-2 px-4 border-b">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b">
                        {user.questionnaireCompleted ? (
                          <span className="text-green-600">已完成</span>
                        ) : (
                          <span className="text-red-600">未完成</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">{new Date(user.lastLoginAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;