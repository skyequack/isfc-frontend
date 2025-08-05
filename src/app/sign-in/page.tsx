'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        afterSignInUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-orange-600 hover:bg-orange-700',
            footerActionLink: 'text-orange-600 hover:text-orange-700'
          }
        }}
      />
    </div>
  )
}
