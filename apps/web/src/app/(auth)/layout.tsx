import { Navbar } from '@/components/layout/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <Navbar />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">MatchUp</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Find sports games near you</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
