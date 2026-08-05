import { login } from './actions';

export default function LoginForm({ error }: { error?: boolean }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <form action={login} className="w-full max-w-sm bg-white rounded-2xl border border-line shadow-sm px-8 py-10">
        <h1 className="font-display text-2xl text-navy mb-1 text-center">Admin Access</h1>
        <p className="text-sm text-ink/60 text-center mb-6">Enter the password to view the guestbook.</p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="w-full rounded-lg border border-line px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
        />
        {error && <p className="text-sm text-red-600 mb-4">Incorrect password. Try again.</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-navy text-white font-medium py-3 hover:bg-navydark transition"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
