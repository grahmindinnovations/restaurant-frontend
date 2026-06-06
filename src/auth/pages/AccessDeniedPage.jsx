import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { useAuth } from '../context/useAuth'
import { ACCESS_AREAS } from '../config/routeConfig'

export default function AccessDeniedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { allowedRoles, defaultHome } = useAuth()
  const from = location.state?.from

  const yourAreas = Object.values(ACCESS_AREAS).filter((area) =>
    area.roles.some((r) => allowedRoles.includes(r)),
  )

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <h1 className="text-lg font-semibold text-neutral-900 text-center">Access not allowed</h1>
        <p className="text-sm text-neutral-600 text-center">
          Your account cannot open
          {from ? (
            <>
              {' '}
              <span className="font-mono text-xs">{from}</span>
            </>
          ) : (
            ' this page'
          )}
          . Each role only sees its own station.
        </p>

        {yourAreas.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
            <p className="text-[11px] font-medium text-neutral-700 mb-1">You can access:</p>
            <ul className="text-xs text-neutral-600 space-y-0.5">
              {yourAreas.map((a) => (
                <li key={a.label}>• {a.label}</li>
              ))}
            </ul>
          </div>
        )}

        {allowedRoles.length > 1 ? (
          <Button variant="outline" className="w-full" onClick={() => navigate('/select-role')}>
            Switch role
          </Button>
        ) : null}
        <Button className="w-full" onClick={() => navigate(defaultHome, { replace: true })}>
          Go to my dashboard
        </Button>
        <Link to="/login" className="block text-center text-xs text-neutral-500 hover:underline">
          Sign in with a different account
        </Link>
      </div>
    </div>
  )
}
