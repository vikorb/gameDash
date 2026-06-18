import api from '@/api'
import type { Transaction } from '@/types/shops'

export async function fetchAdminShopTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/shop/backoffice/transactions')
  return data
}