'use client'
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

function ResetPasswordForm() {
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);
const router = useRouter();
const searchParams = useSearchParams();
const token = searchParams.get('token');

useEffect(() => {
    if (!token) {
    setError('Invalid reset link');
    }
}, [token]);3

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
    }

    if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
    }

    setLoading(true);
    setError(null);

    try {
    await axios.post('http://localhost:8000/auth/reset-password', {
        token,
        new_password: password
    });
    
    setSuccess(true);
    
      // Redirect to login after 2 seconds
    setTimeout(() => {
        router.push('/login');
    }, 2000);
    } catch (err: any) {
    setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
    setLoading(false);
    }
};

if (!token) {
    return (
    <div className="flex min-h-screen items-center justify-center bg-background-blue">
        <div className="text-center">
        <p className="text-red-500 text-lg">Invalid reset link</p>
        <button
            onClick={() => router.push('/forgot-password')}
            className="mt-4 text-yellow-components underline"
        >
            Request a new one
        </button>
        </div>
    </div>
    );
}

if (success) {
    return (
    <div className="flex min-h-screen w-full bg-background-blue items-center justify-center">
        <div className="max-w-md p-8 bg-lightblue-components rounded-lg text-center">
        <div className="mb-4 text-green-components text-4xl">✓</div>
        <h2 className="text-2xl font-bold text-white mb-4">Password Reset!</h2>
        <p className="text-gray-300 mb-6">
            Your password has been successfully reset. Redirecting to login...
        </p>
        </div>
    </div>
    );
}

return (
    <div className="flex min-h-screen w-full bg-background-blue">
    <div className="relative w-full lg:w-1/2">
        {/* Logo */}
        <div className="absolute left-8 top-6 p-2">
          <span className="text-xl font-bold tracking-tight text-yellow-components lowercase">.bet</span>
          <span className="text-xl font-bold tracking-tight text-custom-white-text-color lowercase">yetu</span>
        </div>

        {/* Form */}
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md p-8">
            <h2 className="mb-2 text-center text-2xl font-semibold text-custom-white-text-color">
              Reset Your Password
            </h2>
            <p className="mb-6 text-center text-sm text-gray-400">
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-custom-white-text-color">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full p-3 rounded-lg text-custom-white-text-color bg-lightblue-components border border-gray-600 focus:ring-yellow-components focus:outline-none focus:ring-1 placeholder:text-gray-400"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-custom-white-text-color">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full p-3 rounded-lg text-custom-white-text-color bg-lightblue-components border border-gray-600 focus:ring-yellow-components focus:outline-none focus:ring-1 placeholder:text-gray-400"
                />
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className={`w-full rounded-full py-3 text-sm font-bold transition-colors ${
                  loading || !password || !confirmPassword
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-components text-black hover:bg-yellow-400'
                }`}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side image */}
      <div className="hidden py-[3vh] pr-[3vh] lg:block lg:w-1/2">
        <div className="hidden h-full rounded-3xl bg-gradient-to-b from-indigo-100 via-purple-100 to-[#5960d7] lg:block">
          <div className="flex h-full flex-col p-12">
            <div className="flex h-full items-center justify-center">
              <Image
                src="/cod_actual.png"
                alt="Game illustration"
                width={500}
                height={500}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background-blue">
        <p className="text-white">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}