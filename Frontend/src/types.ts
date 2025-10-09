export interface transaction {
  _id: string;
  transactionType: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface budget {
  _id: string;
  category: string;
  limit: number;
  spend: number;
}

export interface userProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  contact: string;
  address?: string;
}