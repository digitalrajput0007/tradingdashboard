import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase'; // Ensure this path is correct

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // Start with a loading state
  const [isValidCode, setIsValidCode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the oobCode from the URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');

    if (!code) {
      setError('Invalid or missing password reset code.');
      setLoading(false);
      return;
    }

    // Verify the code with Firebase before showing the password form
    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, code);
        setIsValidCode(true); // Code is valid, show the form
      } catch (err) {
        setError('The password reset link is invalid, expired, or has already been used.');
        setIsValidCode(false); // Code is not valid, show error
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Use the verified oobCode and the new password to reset the password
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('oobCode');
      await confirmPasswordReset(auth, code, newPassword);

      setMessage('Your password has been successfully reset.');
      // Redirect the user to the login page after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError('Failed to reset password. The link may have expired or been used.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
        
        {/* Display an error if the link is invalid */}
        {error && !isValidCode && (
          <div>
            <p className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</p>
            <p className="mt-4 text-center text-sm text-gray-400">
              <Link to="/forgot-password" className="font-medium text-cyan-500 hover:underline">
                Request a new password reset link.
              </Link>
            </p>
          </div>
        )}
        
        {/* Show success message and redirect link */}
        {message && (
          <div>
            <p className="bg-green-500 text-white p-3 rounded mb-4 text-center">{message}</p>
            <p className="mt-4 text-center text-sm text-gray-400">
              <Link to="/login" className="font-medium text-cyan-500 hover:underline">
                Click here to log in.
              </Link>
            </p>
          </div>
        )}

        {/* The main password reset form */}
        {isValidCode && !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Please enter and confirm your new password.
            </p>
            {error && <p className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</p>}
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
              minLength="6"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
              minLength="6"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:bg-gray-500"
            >
              {loading ? 'Saving...' : 'Set Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
