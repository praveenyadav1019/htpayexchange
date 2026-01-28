
const API_URL = '/api';
const USE_SIMULATION = true; 
const SIMULATION_DELAY = 400;

// Isolated storage keys
const USER_TOKEN_KEY = 'user_auth_token';
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const SIM_STORE_KEY = 'htpay_sim_store';

const generateMockTronAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let res = 'T';
  for (let i = 0; i < 33; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
};

// Initialize or load persisted mock store for high-fidelity demo
const initialMockStore = {
  users: [
    { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'user', isFrozen: false, trustBalance: 25500, incomeBalance: 450, tronAddress: 'TLLM9p7zG9L9Yf8Z9vHqLp8VqYwN7x9Zp2', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', isFrozen: true, trustBalance: 10000, incomeBalance: 0, tronAddress: 'TRz7Xq9pM9V9Wf7Z8vHqLp8VqYwN6x8Za1', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  admin: { id: 'admin-1', name: 'Super Admin', email: 'admin@htpay.io', role: 'admin' },
  transactions: [],
  rates: { buyRate: 98.37, sellRate: 100.00 },
  logs: [],
  accounts: [
    { id: 'acc-1', user: 'u1', systemId: 'upi', systemName: 'bhim sbi app', upiId: 'john@sbi', accountName: 'John Doe', status: 'active', deviceStatus: 'online' }
  ]
};

const getPersistedStore = () => {
  const saved = localStorage.getItem(SIM_STORE_KEY);
  return saved ? JSON.parse(saved) : initialMockStore;
};

const savePersistedStore = (store: any) => {
  localStorage.setItem(SIM_STORE_KEY, JSON.stringify(store));
};

let mockStore = getPersistedStore();

const simulateRequest = async (rawEndpoint: string, method: string, body?: any) => {
  const endpoint = rawEndpoint.replace(/\/$/, '');
  console.log(`[LEDGER_AUDIT] ${method} ${endpoint}`, body || '');
  await new Promise(resolve => setTimeout(resolve, SIMULATION_DELAY));
  
  // Auth & Profile
  if (endpoint === '/auth/user/login') {
    const user = mockStore.users.find((u: any) => u.email === body.email) || mockStore.users[0];
    return { token: 'mock-user-jwt', user };
  }

  if (endpoint === '/auth/user/signup') {
    const newUser = {
      id: `u${mockStore.users.length + 1}`,
      name: body.name || 'New User',
      email: body.email,
      role: 'user',
      isFrozen: false,
      trustBalance: 0,
      incomeBalance: 0,
      tronAddress: generateMockTronAddress(),
      createdAt: new Date().toISOString()
    };
    mockStore.users.push(newUser);
    savePersistedStore(mockStore);
    return { token: 'mock-user-jwt', user: newUser };
  }
  
  if (endpoint === '/admin/login') {
    if (body.email === 'admin@htpay.io' && body.password === 'admin123') return { token: 'mock-admin-jwt', user: mockStore.admin };
    throw new Error('Invalid Credentials');
  }

  if (endpoint === '/auth/user/me') {
    const user = mockStore.users[0];
    return { user, balances: { trust: user.trustBalance, income: user.incomeBalance } };
  }
  
  // Admin Data
  if (endpoint === '/admin/users' && method === 'GET') return mockStore.users;
  if (endpoint === '/admin/transactions' && method === 'GET') return mockStore.transactions;
  if (endpoint === '/admin/rates' && method === 'GET') return mockStore.rates;
  if (endpoint === '/admin/logs' && method === 'GET') return mockStore.logs;

  // Admin Actions
  if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/freeze') && method === 'PATCH') {
    const userId = endpoint.split('/')[3];
    const user = mockStore.users.find((u: any) => u.id === userId || u._id === userId);
    if (user) {
      user.isFrozen = !user.isFrozen;
      savePersistedStore(mockStore);
      return { success: true, isFrozen: user.isFrozen };
    }
  }

  // User Accounts
  if (endpoint === '/auth/user/accounts' && method === 'GET') return mockStore.accounts;
  if (endpoint === '/auth/user/accounts' && method === 'POST') {
    const newAcc = { ...body, id: `acc-${Date.now()}`, user: 'u1', status: 'active', deviceStatus: 'online' };
    mockStore.accounts.push(newAcc);
    savePersistedStore(mockStore);
    return newAcc;
  }
  if (endpoint.startsWith('/auth/user/accounts/') && method === 'PUT') {
    const accId = endpoint.split('/')[4];
    const idx = mockStore.accounts.findIndex((a: any) => a.id === accId);
    if (idx !== -1) {
      mockStore.accounts[idx] = { ...mockStore.accounts[idx], ...body };
      savePersistedStore(mockStore);
      return mockStore.accounts[idx];
    }
  }
  if (endpoint.startsWith('/auth/user/accounts/') && method === 'DELETE') {
    const accId = endpoint.split('/')[4];
    mockStore.accounts = mockStore.accounts.filter((a: any) => a.id !== accId);
    savePersistedStore(mockStore);
    return { success: true };
  }

  // Transactions
  if (endpoint === '/auth/user/transactions' && method === 'GET') return mockStore.transactions;

  if (endpoint === '/auth/user/transactions/withdraw') {
    if (body.amount > 50000) throw new Error('Transaction exceeds daily production limit (50,000 INR)');
    const newTx = {
      id: `WD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      user: 'u1',
      type: 'WITHDRAWAL',
      amount: body.amount,
      currency: 'INR',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      description: 'System Audit Pending',
      metadata: { accountId: body.accountId }
    };
    mockStore.transactions.unshift(newTx);
    savePersistedStore(mockStore);
    return { success: true, transaction: newTx };
  }

  if (endpoint === '/auth/user/transactions/swap') {
    const user = mockStore.users[0];
    const { fromAmount, fromCurrency } = body;
    if (fromCurrency === 'INR') {
      if (user.trustBalance < fromAmount) throw new Error('Insufficient INR balance');
      user.trustBalance -= fromAmount;
      user.incomeBalance += (fromAmount / mockStore.rates.sellRate);
    } else {
      if (user.incomeBalance < fromAmount) throw new Error('Insufficient USDT balance');
      user.incomeBalance -= fromAmount;
      user.trustBalance += (fromAmount * mockStore.rates.buyRate);
    }
    mockStore.transactions.unshift({ id: `SW-${Date.now()}`, type: 'SWAP', amount: fromAmount, currency: fromCurrency, status: 'COMPLETED', createdAt: new Date().toISOString() });
    savePersistedStore(mockStore);
    return { success: true, balances: { trust: user.trustBalance, income: user.incomeBalance } };
  }

  if (endpoint.endsWith('/approve')) {
    const txId = endpoint.split('/')[3];
    const tx = mockStore.transactions.find((t: any) => t.id === txId);
    if (tx && tx.status === 'PENDING') {
      tx.status = 'COMPLETED';
      savePersistedStore(mockStore);
      return { success: true };
    }
  }

  return { success: true };
};

export const api = {
  user: {
    async post(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/auth/user${endpoint}`, 'POST', body);
      const res = await fetch(`${API_URL}/auth/user${endpoint}`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    async get(endpoint: string) {
      if (USE_SIMULATION) return simulateRequest(`/auth/user${endpoint}`, 'GET');
      const res = await fetch(`${API_URL}/auth/user${endpoint}`, { headers: getHeaders(false) });
      return handleResponse(res);
    },
    // Adding missing put method
    async put(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/auth/user${endpoint}`, 'PUT', body);
      const res = await fetch(`${API_URL}/auth/user${endpoint}`, { method: 'PUT', headers: getHeaders(false), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    // Adding missing patch method
    async patch(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/auth/user${endpoint}`, 'PATCH', body);
      const res = await fetch(`${API_URL}/auth/user${endpoint}`, { method: 'PATCH', headers: getHeaders(false), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    // Adding missing delete method
    async delete(endpoint: string) {
      if (USE_SIMULATION) return simulateRequest(`/auth/user${endpoint}`, 'DELETE');
      const res = await fetch(`${API_URL}/auth/user${endpoint}`, { method: 'DELETE', headers: getHeaders(false) });
      return handleResponse(res);
    }
  },
  admin: {
    async post(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/admin${endpoint}`, 'POST', body);
      const res = await fetch(`${API_URL}/admin${endpoint}`, { method: 'POST', headers: getHeaders(true), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    async get(endpoint: string) {
      if (USE_SIMULATION) return simulateRequest(`/admin${endpoint}`, 'GET');
      const res = await fetch(`${API_URL}/admin${endpoint}`, { headers: getHeaders(true) });
      return handleResponse(res);
    },
    // Adding missing put method
    async put(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/admin${endpoint}`, 'PUT', body);
      const res = await fetch(`${API_URL}/admin${endpoint}`, { method: 'PUT', headers: getHeaders(true), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    // Adding missing patch method
    async patch(endpoint: string, body: any) {
      if (USE_SIMULATION) return simulateRequest(`/admin${endpoint}`, 'PATCH', body);
      const res = await fetch(`${API_URL}/admin${endpoint}`, { method: 'PATCH', headers: getHeaders(true), body: JSON.stringify(body) });
      return handleResponse(res);
    },
    // Adding missing delete method
    async delete(endpoint: string) {
      if (USE_SIMULATION) return simulateRequest(`/admin${endpoint}`, 'DELETE');
      const res = await fetch(`${API_URL}/admin${endpoint}`, { method: 'DELETE', headers: getHeaders(true) });
      return handleResponse(res);
    }
  }
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'System error. Operation aborted.');
  }
  return res.json();
};

const getHeaders = (isAdmin: boolean) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(isAdmin ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY)}`
});
