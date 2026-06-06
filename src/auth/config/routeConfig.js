/**
 * Single place to control which roles can open which URLs.
 * Edit this file when adding a new station or page.
 */

export const ROLE_HOME = {
  reception: '/pos',
  kitchen: '/kitchen',
  manager: '/inventory',
  employee: '/employee',
  admin: '/admin/dashboard',
}

/** Human-readable areas — used in docs and access-denied messaging. */
export const ACCESS_AREAS = {
  reception: {
    label: 'Reception counter',
    roles: ['reception', 'admin'],
    paths: ['/pos', '/tables', '/billing', '/reports'],
  },
  kitchen: {
    label: 'Kitchen (KDS)',
    roles: ['kitchen', 'admin'],
    paths: ['/kitchen'],
  },
  manager: {
    label: 'Inventory / manager',
    roles: ['manager', 'admin'],
    paths: ['/inventory'],
  },
  employee: {
    label: 'Staff / HR',
    roles: ['employee', 'admin'],
    paths: ['/employee'],
  },
  admin: {
    label: 'Admin dashboard',
    roles: ['admin'],
    paths: ['/admin'],
  },
}

export function routeForRole(roleId) {
  return ROLE_HOME[roleId] || '/login'
}

export function rolesForPath(pathname) {
  const path = String(pathname || '')

  if (path.startsWith('/admin')) return ACCESS_AREAS.admin.roles
  if (path.startsWith('/inventory')) return ACCESS_AREAS.manager.roles
  if (path.startsWith('/employee')) return ACCESS_AREAS.employee.roles
  if (path.startsWith('/kitchen')) return ACCESS_AREAS.kitchen.roles
  if (
    path.startsWith('/pos') ||
    path.startsWith('/tables') ||
    path.startsWith('/billing') ||
    path.startsWith('/reports') ||
    path.startsWith('/staff')
  ) {
    return ACCESS_AREAS.reception.roles
  }
  if (path.startsWith('/portal/')) {
    const role = path.split('/')[2]
    return role ? [role, 'admin'] : ['admin']
  }

  return []
}

export function roleForPath(pathname) {
  const path = String(pathname || '')
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/inventory')) return 'manager'
  if (path.startsWith('/employee')) return 'employee'
  if (path.startsWith('/kitchen')) return 'kitchen'
  if (
    path.startsWith('/pos') ||
    path.startsWith('/tables') ||
    path.startsWith('/billing') ||
    path.startsWith('/reports')
  ) {
    return 'reception'
  }
  return null
}

export function canAccessPath(pathname, allowedRoles) {
  const required = rolesForPath(pathname)
  if (required.length === 0) return true
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : []
  return required.some((r) => allowed.includes(r))
}
