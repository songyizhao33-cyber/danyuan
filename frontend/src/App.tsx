import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Questionnaire from './components/Questionnaire';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { matchApi } from './services/api';

// 检查用户是否登录
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// 受保护的路由
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  return children;
};

// 主界面组件
const Home: React.FC = () => {
  const [matchStatus, setMatchStatus] = React.useState({ countdown: 0, participantCount: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // 加载匹配状态
  React.useEffect(() => {
    const loadMatchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await matchApi.getMatchStatus();
        setMatchStatus(response);
      } catch (err) {
        setError('获取匹配状态失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-oxford-light p-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-oxford-blue text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">旦缘</h1>
            <button 
              className="bg-white text-oxford-blue px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth';
              }}
            >
              退出登录
            </button>
          </div>
        </header>
        
        <main className="bg-white p-6 rounded-b-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">欢迎使用旦缘</h2>
          <p className="mb-6">请完成问卷以参与匹配</p>
          
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">距离下一轮匹配</h3>
              <p className="text-2xl font-bold text-oxford-blue">
                {isLoading ? '加载中...' : `${matchStatus.countdown} 天`}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">已参与匹配人数</h3>
              <p className="text-2xl font-bold text-oxford-blue">
                {isLoading ? '加载中...' : matchStatus.participantCount}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="bg-oxford-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition w-full"
              onClick={() => window.location.href = '/questionnaire'}
            >
              开始填写问卷
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/questionnaire" element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;