import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

// "/" — public login page.
// If the user is already authenticated, skip straight to their collection.
export default async function Page() {
  const session = await auth();
  if (session) redirect('/collection');
  return <LoginPage />;
}
