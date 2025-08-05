'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        afterSignUpUrl="/dashboard"
        signInUrl="/sign-in"
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
