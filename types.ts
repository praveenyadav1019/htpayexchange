
export enum AppTab {
  DASHBOARD = 'dashboard',
  SWAP = 'swap',
  TRANSACTIONS = 'transactions',
  WITHDRAWALS = 'withdrawals',
  ACCOUNTS = 'accounts',
  STATEMENT = 'statement',
  STATISTICS = 'statistics',
  INCOME_BALANCE = 'income-balance',
  EARN_MONEY = 'earn-money',
  // Admin Tabs
  ADMIN_DASHBOARD = 'admin_dashboard',
  ADMIN_USERS = 'admin_users',
  ADMIN_DEPOSITS = 'admin_deposits',
  ADMIN_WITHDRAWALS = 'admin_withdrawals',
  ADMIN_RATES = 'admin_rates',
  ADMIN_ALL_TRANSACTIONS = 'admin_all_transactions',
  ADMIN_LOGS = 'admin_logs'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  trustBalance: number;
  incomeBalance: number;
  usdtRate: number;
  isFrozen?: boolean;
  referralCode?: string;
  tronAddress?: string;
}

export interface Transaction {
  id: string;
  user: string | any;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CONVERSION' | 'COMMISSION' | 'REFERRAL_BONUS' | 'SWAP';
  amount: number;
  currency: 'INR' | 'USDT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  createdAt: string;
  description?: string;
  metadata?: any;
}
