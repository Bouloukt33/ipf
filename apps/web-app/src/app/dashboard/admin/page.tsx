import { redirect } from 'next/navigation';

const ADMIN_DASHBOARD_URL =
  process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  'http://localhost:5173/admin/dashboard';

export default function AdminRedirectPage() {
  redirect(ADMIN_DASHBOARD_URL);
}
