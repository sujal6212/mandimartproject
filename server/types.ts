export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'farmer' | 'buyer' | 'admin';
  address: string;
  state: string;
  district: string;
  village?: string;
  pincode: string;
  businessType?: string;
  contactPerson?: string;
  createdAt: string;
}

export interface Crop {
  id: number;
  farmerId: number;
  farmerName: string;
  farmerPhone: string;
  name: string;
  quantity: number;
  unit: string; // 'Quintal' | 'Kg' | 'Ton' | 'Bags'
  grade: string; // 'A+' | 'A' | 'B' | 'C'
  expectedPrice: number; // ₹ per unit
  image: string;
  location: string;
  description: string;
  rating: number;
  status: 'active' | 'sold';
  createdAt: string;
}

export interface Mandi {
  id: number;
  name: string;
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface MandiPrice {
  id: number;
  mandiId: number;
  mandiName: string;
  cropName: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  priceDate: string;
  updatedAt: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Auction {
  id: number;
  farmerId: number;
  farmerName: string;
  cropId?: number;
  cropName: string;
  quantity: number;
  unit: string;
  grade: string;
  basePrice: number;
  currentBid: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'cancelled';
  winnerId?: number;
  winnerName?: string;
  image: string;
  description: string;
  location: string;
  createdAt: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  buyerId: number;
  buyerName: string;
  buyerPhone?: string;
  bidAmount: number;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  buyerId: number;
  buyerName: string;
  buyerPhone: string;
  farmerId: number;
  farmerName: string;
  cropId: number;
  cropName: string;
  quantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  auctionId?: number;
  farmerId: number;
  buyerId: number;
  cropName: string;
  amount: number;
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface VegetableComparisonResult {
  success: boolean;
  error?: string;
  vegetable_type?: string;
  image1?: {
    freshness: number;
    color_consistency: number;
    size_shape: number;
    defect_free: number;
    overall_score: number;
    grade: string;
    defects: string[];
    metrics?: {
      colorVariance: number;
      dominantHue: string;
      firmnessIndicator: number;
    };
  };
  image2?: {
    freshness: number;
    color_consistency: number;
    size_shape: number;
    defect_free: number;
    overall_score: number;
    grade: string;
    defects: string[];
    metrics?: {
      colorVariance: number;
      dominantHue: string;
      firmnessIndicator: number;
    };
  };
  comparison?: {
    winner: 'image1' | 'image2' | 'tie';
    score_difference: number;
    reason: string;
  };
}
