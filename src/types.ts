export interface User {
  id: number;
  name: string;
  email: string;
  is_seller: boolean;
  seller_rating?: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  base_price: number;
  min_price: number;
  image_url: string;
  seller_id: number;
  seller_name: string;
  seller_rating?: number;
  stock_count: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  category: string;
  negotiated_price: number;
  image_url: string;
  seller_id: number;
  seller_name: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    name: string;
    price: number;
  }[];
}

export const CATEGORIES = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Home & Furniture",
  "Beauty & Personal Care",
  "Grocery & Food",
  "Sports & Outdoors",
  "Toys & Baby Products",
  "Books, Music & Movies",
  "Automotive & Tools",
  "Health & Wellness"
];
