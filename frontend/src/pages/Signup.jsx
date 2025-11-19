import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleSignup = (formData) => {
    // Simulate registration - in real app, this would be an API call
    onLogin({
      name: formData.name,
      email: formData.email,
      id: '1'
    });
    navigate('/dashboard');
  };

  return <AuthForm type="signup" onSubmit={handleSignup} />;
};

export default Signup;