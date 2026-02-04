
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  cityZip: string;
  phone: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  taxId: string;
  bankInfo: string;
  email: string;
}

export interface InvoiceData {
  reference: string;
  date: string;
  sender: CompanyInfo;
  client: Client;
  items: InvoiceItem[];
  tvaRate: number;
  currency: string;
}
