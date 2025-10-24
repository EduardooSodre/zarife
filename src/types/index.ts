import { type Decimal } from "@prisma/client/runtime/library";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: Decimal;
  oldPrice?: Decimal;
  stock: number;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  collections?: Array<{ id: string; name: string }>;
  promotions?: Array<{
    id: string;
    name: string;
    discountType?: string;
    value?: number;
  }>;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: Decimal;
  stripePaymentId?: string;
  couponCode?: string;
  discount?: Decimal;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: Decimal;
  size?: string;
  color?: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  value: Decimal;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  isFeatured?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  NEW = "NEW",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum DiscountType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}
