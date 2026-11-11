import Link from "next/link";
import { redirect } from "next/navigation";
import { adminAuthIsConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const { error } = await searchParams;
  const configured = adminAuthIsConfigured();

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <Link className="admin-login-logo" href="/" aria-label="The Item Box home">TIB</Link>
        <h1>Admin login</h1>
        {!configured && <p className="admin-login-error" role="alert">Add ADMIN_USERNAME and ADMIN_PASSWORD to your .env file first.</p>}
        {configured && error === "invalid" && <p className="admin-login-error" role="alert">Username or password is incorrect.</p>}
        <form action="/api/admin/login" method="post">
          <label><span>Username</span><input name="username" type="text" autoComplete="username" required autoFocus /></label>
          <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" disabled={!configured}>Sign in</button>
        </form>
        <Link className="admin-login-back" href="/">Back to store</Link>
      </section>
    </main>
  );
}
