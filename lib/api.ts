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
  getAll: (params?: { conta?: string; categoria?: string; usuario?: string; obs?: string; data_transacao_low?: string; data_transacao_high?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.conta) queryParams.append('conta', params.conta)
    if (params?.categoria) queryParams.append('categoria', params.categoria)
    if (params?.usuario) queryParams.append('usuario', params.usuario)
    if (params?.obs) queryParams.append('obs', params.obs)
    if (params?.data_transacao_low) queryParams.append('data_transacao_low', params.data_transacao_low)
    if (params?.data_transacao_high) queryParams.append('data_transacao_high', params.data_transacao_high)
    const query = queryParams.toString()
    return fetchAPI(`/transactions${query ? `?${query}` : ''}`)
  },
  getShared: () => fetchAPI('/transactions/share'),
  create: (data: any) => fetchAPI('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/transactions/${id}`, { method: 'DELETE' }),
}

// Categorias
export const categoriesAPI = {
  getAll: (params?: { nome?: string; tipo?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.nome) queryParams.append('nome', params.nome)
    if (params?.tipo) queryParams.append('tipo', params.tipo)
    const query = queryParams.toString()
    return fetchAPI(`/category${query ? `?${query}` : ''}`)
  },
  create: (data: any) => fetchAPI('/category', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/category/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/category/${id}`, { method: 'DELETE' }),
}

// Contas
export const accountsAPI = {
  getAll: (params?: { nome?: string; moeda?: string; ativa?: string; share?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.nome) queryParams.append('nome', params.nome)
    if (params?.moeda) queryParams.append('moeda', params.moeda)
    if (params?.ativa) queryParams.append('ativa', params.ativa)
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
  getStats: () => fetchAPI('/dashboard/stats'),
}

// Autenticação
export const authAPI = {
  login: async (email: string, senha: string) => {
    const response = await fetch(`${API_BASE_URL}/usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
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
