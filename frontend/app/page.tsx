import { redirect } from 'next/navigation';

/** Shell bounces a signed-out visitor from here to /login. */
export default function Home() {
  redirect('/dashboard');
}
