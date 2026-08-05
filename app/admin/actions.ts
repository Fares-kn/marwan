'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password');
  const correctPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!correctPassword || !sessionSecret) {
    throw new Error('Admin auth is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.');
  }

  if (password !== correctPassword) {
    redirect('/admin?error=1');
  }

  cookies().set('admin_session', sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  redirect('/admin');
}

export async function logout() {
  cookies().delete('admin_session');
  redirect('/admin');
}
