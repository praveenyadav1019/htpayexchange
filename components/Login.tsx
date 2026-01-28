const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    // 1. Prefix the endpoint correctly to match your server index.js routes
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { name, email, password };
    
    console.log(`Attempting ${isLogin ? 'Login' : 'Signup'}...`);
    
    // 2. Call the API
    const data = await api.user.post(endpoint, body);
    
    // 3. CRITICAL SECURITY CHECK: 
    // Ensure the data actually contains a token and a user
    if (data && data.token && data.user) {
      console.log('Login successful, role:', data.user.role);
      
      // Save data before calling success
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLoginSuccess(data);
    } else {
      // If the server sent data but no token, it's a failed login
      setError(data.message || 'Invalid email or password');
    }

  } catch (err: any) {
    // If the API service throws an error (401, 500, etc.)
    setError(err.response?.data?.message || err.message || 'Authentication failed');
    console.error('Login Error:', err);
  } finally {
    setLoading(false);
  }
};