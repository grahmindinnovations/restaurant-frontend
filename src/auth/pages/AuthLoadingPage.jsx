export default function AuthLoadingPage({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm">
      {message}
    </div>
  )
}
