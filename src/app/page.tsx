import { redirect } from 'next/navigation';
export const runtime = 'edge';
export default async function Page() {
  redirect('/dashboard/table');
}
