import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = (formData) => {
    // Simulate login - in real app, this would be an API call
    onLogin({
      name: 'John Smith', // In real app, this would come from backend
      email: formData.email,
      id: '1'
    });
    navigate('/dashboard');
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
};

export default Login;