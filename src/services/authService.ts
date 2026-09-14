import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_AUTH_KEY = 'play_demo_auth_session';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export async function loginAdmin(email: string, password: string): Promise<{ user: AdminUser | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          role: 'admin',
        },
        error: null,
      };
    }
  }

  // Fallback / Demo credentials authentication
  if ((email === 'admin@example.com' && password === 'admin123') || (email && password.length >= 6)) {
    const user: AdminUser = {
      id: 'demo-admin-id',
      email: email || 'admin@example.com',
      role: 'admin',
    };
    localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
    return { user, error: null };
  }

  return { user: null, error: 'Invalid credentials. For demo access use admin@example.com / admin123' };
}

export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(DEMO_AUTH_KEY);
}

export async function getAdminSession(): Promise<AdminUser | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      return {
        id: data.session.user.id,
        email: data.session.user.email || '',
        role: 'admin',
      };
    }
  }

  const saved = localStorage.getItem(DEMO_AUTH_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  return null;
}
