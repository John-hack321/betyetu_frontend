'use client'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:8000/auth/forgot-password', 
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full bg-background-blue items-center justify-center">
        <div className="max-w-md p-8 bg-lightblue-components rounded-lg text-center">
          <div className="mb-4 text-green-components text-4xl">✓</div>
          <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
          <p className="text-gray-300 mb-6">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-yellow-components text-black font-bold py-3 rounded-lg"
          >
            Back to Login
          </button>
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
              Forgot Password?
            </h2>
            <p className="mb-6 text-center text-sm text-gray-400">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-custom-white-text-color">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="w-full p-3 rounded-lg text-custom-white-text-color bg-lightblue-components border border-gray-600 focus:ring-yellow-components focus:outline-none focus:ring-1 placeholder:text-gray-400"
                />
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full rounded-full py-3 text-sm font-bold transition-colors ${
                  loading || !email
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-components text-black hover:bg-yellow-400'
                }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-sm text-gray-400 hover:text-white underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side image - same as login/signup */}
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