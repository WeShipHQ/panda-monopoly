import React from 'react';
import { OnboardingScreen } from '@/components/onboarding';
import { useRouter } from 'expo-router';

export default function OnboardingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to the main app or next onboarding step
    router.push('/home');
  };

  return <OnboardingScreen onGetStarted={handleGetStarted} />;
}
