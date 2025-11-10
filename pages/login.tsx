import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '@/components/common/AuthLayout';

const Login = () => {
  const [email, setUsermail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const loginMethod = (process.env.NEXT_PUBLIC_LOGIN_METHOD || 'email') as 'email' | 'username';
  const router = useRouter();
  const { returnUrl } = router.query;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'InvalidCredentials' || data.error === 'Email or password does not match.') {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (data.error === 'EmailAlreadyExists') {
          setError('이미 등록된 이메일입니다.');
        } else {
          setError(data.message || data.error || '로그인에 실패했습니다.');
        }
        return;
      }

      if (data.access_token) {
        console.log('로그인 성공: 서버에서 쿠키 설정됨', {
          token: data.access_token ? '토큰 존재함' : '토큰 없음',
          environment: process.env.NODE_ENV
        });
        
        const tokenParts = data.access_token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));

        // Remember Me 체크 시 이메일만 저장 (자동 완성용)
        // 토큰 관리는 서버의 쿠키 설정으로 자동 처리됨
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log('페이지 이동 시작...');

        if (returnUrl) {
          console.log('리다이렉트 대상:', decodeURIComponent(returnUrl as string));
          await router.replace(decodeURIComponent(returnUrl as string));
        } else {
          if (payload.role === 'ADMIN') {
            console.log('관리자 페이지로 이동');
            await router.replace('/admin');
          } else {
            console.log('메인 페이지로 이동');
            await router.replace('/');
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.');
      } else {
        setError('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe) {
      setRememberMe(true);
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setUsermail(savedEmail);
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/login';
  };

  return (
    <AuthLayout
      formPosition="left"
      title="Welcome back"
      subtitle={
        <>
          Start your website in seconds. Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--main-color)]">Sign up</Link>
        </>
      }
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {loginMethod === 'username' ? 'Username' : 'Email'}
          </label>
          <input
            type={loginMethod === 'username' ? 'text' : 'email'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] focus:border-[var(--main-color)] transition-colors"
            placeholder={loginMethod === 'username' ? 'username' : 'name@company.com'}
            value={email}
            onChange={(e) => setUsermail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] focus:border-[var(--main-color)] transition-colors"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--main-color)] text-white py-2 rounded-lg hover:bg-[var(--main-color)]/90 mb-4 transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in to your account'}
        </button>

        {/* <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-3 border rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" fill="currentColor">
            <path d="..."/>
          </svg>
          Sign in with Google
        </button> */}

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot/password" className="text-sm text-[var(--main-color)] hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;