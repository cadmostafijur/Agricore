import SignupForm from '@/components/forms/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create Account — AgriCore' };

export default function SignupPage() {
  return <SignupForm />;
}
