'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ACCESS_TOKEN_KEY = 'ln_access_token';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('auth');

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (data: LoginInput) => {
    login.mutate(data);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span
              className="text-2xl font-semibold text-[hsl(var(--primary))]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Lovely Nails
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('title')}</p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('emailLabel')}</label>
            <Input
              type="email"
              autoComplete="email"
              {...form.register('email')}
              placeholder={t('emailPlaceholder')}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('passwordLabel')}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...form.register('password')}
                placeholder={t('passwordPlaceholder')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {login.isError && (
            <p className="text-sm text-[hsl(var(--destructive))]">
              {login.error instanceof Error ? login.error.message : t('invalidCredentials')}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? t('signingIn') : t('signIn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
