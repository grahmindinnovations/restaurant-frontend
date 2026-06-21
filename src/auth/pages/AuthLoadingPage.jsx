export default function AuthLoadingPage({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      {message}
    </div>
  )
}
