export interface Product {
  id: number;
  product_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  image_url: string;
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  graphics?: string;
  os?: string;
  warranty?: string;
  delivery?: string;
}

export interface CartItem {
  item_id: string;
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface CartData {
  user_id: string;
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface OperationalEvent {
  id: number;
  event_id: string;
  request_id: string;
  user_id?: string;
  service_name: string;
  event_type: string;
  timestamp: string;
  status: string;
  severity: string;
  response_time_ms: number;
  error_code?: string;
  error_message?: string;
  dependency?: string;
  metadata?: any;
}

export interface ApplicationLog {
  id: number;
  log_id: string;
  timestamp: string;
  service_name: string;
  level: string;
  message: string;
  request_id?: string;
  user_id?: string;
  error_code?: string;
  metadata?: any;
}
