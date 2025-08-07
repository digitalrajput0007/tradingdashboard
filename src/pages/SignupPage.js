import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase'; // Import db
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        createdAt: new Date()
      });

      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox to verify your account.");

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
        {error && <p className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text" name="firstName" placeholder="First Name"
              value={formData.firstName} onChange={handleChange}
              className="w-1/2 p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
            <input
              type="text" name="lastName" placeholder="Last Name"
              value={formData.lastName} onChange={handleChange}
              className="w-1/2 p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <input
            type="email" name="email" placeholder="Email"
            value={formData.email} onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <input
            type="tel" name="phone" placeholder="Phone Number"
            value={formData.phone} onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <input
            type="text" name="country" placeholder="Country"
            value={formData.country} onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <input
            type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <input
            type="password" name="confirmPassword" placeholder="Confirm Password"
            value={formData.confirmPassword} onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <div className="flex items-center">
            <input
              type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="agree" className="ml-2 block text-sm text-gray-400">
              I agree to the Terms and Conditions
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:bg-gray-500"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;