import { apiFetch } from './api'

/** Upload a dish photo; returns a URL served by the API (works on POS & kitchen). */
export async function uploadMenuImage(file) {
  if (!file) throw new Error('No file selected')
  const form = new FormData()
  form.append('image', file)
  const res = await apiFetch('/api/menu/upload-image', {
    method: 'POST',
    body: form,
  })
  if (!res?.url) throw new Error('Upload did not return a URL')
  return res.url
}
