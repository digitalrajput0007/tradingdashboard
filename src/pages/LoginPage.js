import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure this path is correct

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox for a verification link.");
        setLoading(false);
        // Optionally sign the user out again if you want to strictly enforce verification
        // await auth.signOut(); 
        return;
      }

      navigate('/'); // Redirect to dashboard on successful login
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        {error && <p className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:bg-gray-500"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link to="/forgot-password" className="hover:underline"> {/* We will build this later */}
            Forgot Password?
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-cyan-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;