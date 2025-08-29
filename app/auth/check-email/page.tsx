import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-university-blue-50 to-university-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-university-blue-900">Check Your Email</CardTitle>
            <CardDescription className="text-university-gray-600">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-university-gray-600">
              Please check your email and click the confirmation link to activate your account.
            </p>
            <p className="text-sm text-university-gray-600">
              Once confirmed, you can{" "}
              <Link href="/auth/login" className="font-medium text-university-blue-600 hover:text-university-blue-700">
                sign in to your account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
