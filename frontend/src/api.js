
const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://ai-support-ticket-system-production.up.railway.app'
).replace(/\/+$/, '')

export async function getTickets() {
  let response

  try {
    response = await fetch(`${API_URL}/tickets`)
  } catch {
    throw new Error(
      'Unable to reach the API. Check the Railway deployment, API URL and backend CORS settings.'
    )
  }

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    throw new Error(
      'The API did not return JSON. Check that /tickets is the correct endpoint.'
    )
  }

  const data = await response.json()

  // Accept either an array or an object containing a tickets array.
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.tickets)) {
    return data.tickets
  }

  throw new Error(
    'Unexpected API response format. Expected a ticket array.'
  )
}
