const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-gerenciadorfinanceiro-production.up.railway.app/api/v1'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function getUserIdFromToken() {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id
  } catch {
    return null
  }
}

function isAdmin() {
  const token = getToken()
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.is_admin === true
  } catch {
    return false
  }
}

export { getUserIdFromToken, isAdmin }

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        document.cookie = 'auth-token=; path=/; max-age=0'
        window.location.href = '/login'
      }
      throw new Error('Sess\u00e3o expirada. Fa\u00e7a login novamente.')
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.result !== undefined ? data.result : data
  } catch (error) {
    throw error
  }
}

// Transações
export const transactionsAPI = {
  getAll: (params?: { account?: string; category?: string; user?: string; name?: string; date_transaction_low?: string; date_transaction_high?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.account) queryParams.append('account', params.account)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.user) queryParams.append('user', params.user)
    if (params?.name) queryParams.append('name', params.name)
    if (params?.date_transaction_low) queryParams.append('date_transaction_low', params.date_transaction_low)
    if (params?.date_transaction_high) queryParams.append('date_transaction_high', params.date_transaction_high)
    const query = queryParams.toString()
    return fetchAPI(`/transactions${query ? `?${query}` : ''}`)
  },
  getById: (id: number) => fetchAPI(`/transaction/${id}`),
  getShared: () => fetchAPI('/transactions/share'),
  create: (data: any) => fetchAPI('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/transactions/${id}`, { method: 'DELETE' }),
}

// Categorias
export const categoriesAPI = {
  getAll: (params?: { name?: string; type?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.type) queryParams.append('type', params.type)
    const query = queryParams.toString()
    return fetchAPI(`/category${query ? `?${query}` : ''}`)
  },
  create: (data: any) => fetchAPI('/category', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/category/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/category/${id}`, { method: 'DELETE' }),
}

// accounts
export const accountsAPI = {
  getAll: (params?: { name?: string; coin?: string; ative?: string; share?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.coin) queryParams.append('coin', params.coin)
    if (params?.ative) queryParams.append('ative', params.ative)
    if (params?.share) queryParams.append('share', params.share)
    const query = queryParams.toString()
    return fetchAPI(`/account${query ? `?${query}` : ''}`)
  },
  create: (data: any) => fetchAPI('/account', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/account/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/account/${id}`, { method: 'DELETE' }),
}

// Usuários
export const usersAPI = {
  getAll: () => fetchAPI('/usuario'),
  getById: (id: number) => fetchAPI(`/usuario/${id}`),
  create: (data: any) => fetchAPI('/usuario', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/usuario/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/usuario/${id}`, { method: 'DELETE' }),
}

// Dashboard
export const dashboardAPI = {
  getStats: (params?: { date_transaction_low?: string; date_transaction_high?: string; account?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.date_transaction_low) queryParams.append('date_transaction_low', params.date_transaction_low)
    if (params?.date_transaction_high) queryParams.append('date_transaction_high', params.date_transaction_high)
    if (params?.account) queryParams.append('account', params.account)
    const query = queryParams.toString()
    return fetchAPI(`/dashboard${query ? `?${query}` : ''}`)
  },
}

// Recorrências
export const recurrenceAPI = {
  getAll: () => fetchAPI('/recurrence'),
  create: (data: any) => fetchAPI('/recurrence', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/recurrence/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/recurrence/${id}`, { method: 'DELETE' }),
}

// Autenticação
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Credenciais inválidas')
    }

    const data = await response.json()
    const token = data.token || data.result?.token

    if (token) {
      localStorage.setItem('token', token)
      document.cookie = `auth-token=${token}; path=/; max-age=86400`
    }

    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    document.cookie = 'auth-token=; path=/; max-age=0'
  },
}
