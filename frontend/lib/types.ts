export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductImage {
  filename: string;
  url: string;
  path: string;
  size: number;
  isPrimary: boolean;
  order: number;
}

export interface Slab {
  tier: number;
  quantity: number | null;
  price: number | null;
  margin: number | null;
}

export interface Product {
  _id: string;
  srNo: number;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  subSubCategory: string;
  brand: string;
  mrp: number;
  price: number;
  margin: number;
  weight: string;
  stock: number;
  status: ProductStatus;
  slabs: Slab[];
  deliveryCharge: number;
  images: ProductImage[];
  primaryImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  total: number;
  active: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  hidden: number;
  categories: string[];
  brands: string[];
}

export interface UploadResult {
  batchId: string;
  totalRows: number;
  productsCreated: number;
  imagesLinked: number;
  zipFolders: number;
  unmatchedFolders: number[];
  rowsWithoutImages: number[];
  warnings: string[];
  durationMs: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
}
