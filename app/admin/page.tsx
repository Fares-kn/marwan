import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const cookieStore = cookies();
  const isAuthed = cookieStore.get('admin_session')?.value === process.env.ADMIN_SESSION_SECRET;

  if (!isAuthed) {
    return <LoginForm error={searchParams.error === '1'} />;
  }

  // Uses the service role key server-side only - this is what actually lets
  // the admin see every message despite guests having no read access.
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('messages')
    .select('id, guest_name, message_content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-parchment px-4">
        <p className="text-red-600">Failed to load messages: {error.message}</p>
      </main>
    );
  }

  return <AdminDashboard messages={data ?? []} />;
}
