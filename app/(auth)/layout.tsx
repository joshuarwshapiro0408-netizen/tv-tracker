export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">TVTracker</h1>
          <p className="text-gray-400 mt-2">Track every show. Share every take.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
