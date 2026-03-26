export const roleMeta = {
  admin: { title: 'Admin', color: 'red' },
  manager: { title: 'Inventory Management System', color: 'orange' },
  kitchen: { title: 'Kitchen Chef', color: 'green' },
  reception: { title: 'Reception', color: 'blue' },
  employee: { title: 'Staff Management System', color: 'purple' },
}

export function parseRoleId(input) {
  const v = (input || '').trim().toLowerCase()
  if (v === 'admin' || v === 'manager' || v === 'kitchen' || v === 'reception' || v === 'employee') return v
  return null
}
