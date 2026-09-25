export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'admin';
  businessType?: string;
  contactPerson?: string;
  village?: string;
  district: string;
  state: string;
  address?: string;
  pincode?: string;
  createdAt: string;
}

export interface Crop {
  id: number;
  farmerId: number;
  farmerName?: string;
  farmerPhone?: string;
  name: string;
  quantity: number;
  unit: string;
  grade: 'A+' | 'A' | 'B' | 'C';
  expectedPrice: number;
  location: string;
  description: string;
  rating: number;
  status: 'active' | 'sold' | 'expired';
  imageUrl: string;
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
  distanceKm?: number;
}

export interface MandiPrice {
  id: number;
  mandiId: number;
  mandiName?: string;
  cropName: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  priceDate: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Auction {
  id: number;
  farmerId: number;
  farmerName?: string;
  farmerPhone?: string;
  cropName: string;
  quantity: number;
  unit: string;
  grade: 'A+' | 'A' | 'B' | 'C';
  basePrice: number;
  currentBid: number;
  winnerId?: number;
  winnerName?: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  description: string;
  location: string;
  createdAt: string;
  bidsCount?: number;
}

export interface Bid {
  id: number;
  auctionId: number;
  buyerId: number;
  buyerName?: string;
  bidAmount: number;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  buyerId: number;
  buyerName?: string;
  buyerPhone?: string;
  farmerId: number;
  farmerName?: string;
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

export interface VegetableAnalysis {
  freshness: number;
  color_consistency: number;
  size_shape: number;
  defect_free: number;
  overall_score: number;
  grade: string;
  defects: string[];
}

export interface VegetableComparisonResult {
  image1: VegetableAnalysis;
  image2: VegetableAnalysis;
  comparison: {
    winner: 'image1' | 'image2' | 'tie';
    score_difference: number;
    reason: string;
  };
}
