"use client";
import Link from "next/link";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <div
                className="text-4xl font-normal"
                style={{ fontFamily: "Matemasie, sans-serif" }}
              >
                <span className="text-blue-500">Chat</span>
                <span className="text-yellow-400">Chick</span>
              </div>
            </div>

            <div className="flex items-center">
              <Link
                href="/login"
                className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 "
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
          {/* Left Side (Text Content) */}
          <div className="relative z-10 flex flex-col justify-center px-4 sm:px-6 lg:px-8 lg:max-w-2xl w-full py-16 lg:py-24">
            <main className="mx-auto w-full max-w-2xl lg:mx-0">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Connect with friends</span>
                  <span className="block text-indigo-600">
                    in real-time chat
                  </span>
                </h1>
                <p className="mt-4 text-base text-gray-500 sm:mt-6 sm:text-lg md:mt-8 md:text-xl">
                  Join our community and experience seamless communication with
                  friends and family. Start chatting instantly with our
                  user-friendly platform.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 shadow"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </main>
          </div>

          {/* Right Side (Image) */}
          <div className="relative w-full lg:w-1/2 h-64 sm:h-96 lg:h-auto bg-amber-400"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Better way to communicate
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-white text-sm">
              &copy; {new Date().getFullYear()} ChatChick. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/#" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
