export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2025-10-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-002',
    date: '2025-10-15',
    description: 'AWS',
    category: 'software',
    amount: 1210,
  },
  {
    id: 'tx-003',
    date: '2025-11-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-004',
    date: '2025-11-20',
    description: 'Team offsite',
    category: 'travel',
    amount: 3200,
  },
  {
    id: 'tx-005',
    date: '2025-12-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-006',
    date: '2025-12-18',
    description: 'AWS',
    category: 'software',
    amount: 1340,
  },
  {
    id: 'tx-007',
    date: '2026-01-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-008',
    date: '2026-01-12',
    description: 'AWS',
    category: 'software',
    amount: 1295,
  },
  {
    id: 'tx-009',
    date: '2026-02-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-010',
    date: '2026-02-09',
    description: 'Conference tickets',
    category: 'travel',
    amount: 2800,
  },
  {
    id: 'tx-011',
    date: '2026-02-27',
    description: 'Laptop purchase',
    category: 'equipment',
    amount: 9800,
  },
  {
    id: 'tx-012',
    date: '2026-03-03',
    description: 'Office rent',
    category: 'rent',
    amount: 4500,
  },
  {
    id: 'tx-013',
    date: '2026-03-14',
    description: 'AWS',
    category: 'software',
    amount: 4870,
  },
];
