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

  // 加载匹配状态
  React.useEffect(() => {
    const loadMatchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await matchApi.getMatchStatus();
        setMatchStatus(response);
      } catch (err) {
        console.error('获取匹配状态失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchStatus();
  }, []);

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
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <div className="mb-6">
            <span className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm font-medium">
              Join {isLoading ? '...' : matchStatus.participantCount} students
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">让一段缘分<br />值得等待。</h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            只需填写一份深度问卷，每周二晚九点，<br />您将收到匹配结果，并附上我们认为你们会合拍的理由。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-white text-blue-800 px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition duration-300"
              onClick={() => window.location.href = '/questionnaire'}
            >
              开始填写问卷
            </button>
            <button 
              className="border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-blue-800 transition duration-300"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth';
              }}
            >
              退出登录
            </button>
          </div>
        </div>
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