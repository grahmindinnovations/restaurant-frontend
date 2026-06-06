import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api'

const DEFAULTS = {
  restaurantName: '',
  tagline: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  gstin: '',
  currency: 'INR',
  gstPercent: 5,
  gstEnabled: true,
  serviceChargeEnabled: true,
  serviceChargeAmount: 150,
  serviceChargeDineInOnly: true,
  lowStockThreshold: 20,
  receiptFooter: 'Thank you. Visit again!',
  showGstOnReceipt: true,
}

export function useRestaurantSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/settings')
      setSettings({ ...DEFAULTS, ...(res?.settings || {}) })
    } catch (e) {
      console.error('Failed to load restaurant settings', e)
      setSettings(DEFAULTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { settings, loading, reload: load }
}
