import { redirect } from 'next/navigation';

// Temporarily skip login for UI inspection
export default function Page() {
  redirect('/collection');
}
