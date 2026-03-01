import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubjectView from './pages/SubjectView';
import TopicView from './pages/TopicView';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/subjects/:id" 
          element={token ? <SubjectView user={user} logout={logout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/topics/:id" 
          element={token ? <TopicView user={user} logout={logout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={token && user?.role === 'admin' ? <AdminDashboard user={user} logout={logout} /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </Router>
  );
}
