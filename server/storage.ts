import fs from 'fs';
import path from 'path';
import {
  User,
  Crop,
  Mandi,
  MandiPrice,
  Auction,
  Bid,
  Inquiry,
  Notification,
  Transaction
} from './types';
import {
  initialUsers,
  initialMandis,
  initialMandiPrices,
  initialCrops,
  initialAuctions,
  initialBids,
  initialInquiries,
  initialNotifications,
  initialTransactions
} from './seedData';

interface DatabaseSchema {
  users: User[];
  crops: Crop[];
  mandis: Mandi[];
  mandiPrices: MandiPrice[];
  auctions: Auction[];
  bids: Bid[];
  inquiries: Inquiry[];
  notifications: Notification[];
  transactions: Transaction[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mandimart_db.json');

class Storage {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.crops && parsed.mandis) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read persistent database, re-initializing from seeds:', err);
    }

    const defaultDb: DatabaseSchema = {
      users: [...initialUsers],
      crops: [...initialCrops],
      mandis: [...initialMandis],
      mandiPrices: [...initialMandiPrices],
      auctions: [...initialAuctions],
      bids: [...initialBids],
      inquiries: [...initialInquiries],
      notifications: [...initialNotifications],
      transactions: [...initialTransactions]
    };

    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  private saveDatabase(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write persistent database:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.db.users;
  }

  getUserById(id: number): User | undefined {
    return this.db.users.find(u => u.id === id);
  }

  getUserByEmailOrPhone(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.db.users.find(u => u.email.toLowerCase() === clean || u.phone === identifier.trim());
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const maxId = this.db.users.reduce((max, u) => Math.max(max, u.id), 0);
    const newUser: User = {
      ...userData,
      id: maxId + 1,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  // Crops
  getCrops(filters?: { name?: string; location?: string; grade?: string; maxPrice?: number; farmerId?: number; status?: string }): Crop[] {
    let result = [...this.db.crops];
    if (filters) {
      if (filters.farmerId) {
        result = result.filter(c => c.farmerId === Number(filters.farmerId));
      }
      if (filters.status) {
        result = result.filter(c => c.status === filters.status);
      } else {
        // default to active if no specific status requested
        result = result.filter(c => c.status === 'active');
      }
      if (filters.name) {
        const q = filters.name.toLowerCase();
        result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      }
      if (filters.location) {
        const loc = filters.location.toLowerCase();
        result = result.filter(c => c.location.toLowerCase().includes(loc));
      }
      if (filters.grade && filters.grade !== 'all') {
        result = result.filter(c => c.grade === filters.grade);
      }
      if (filters.maxPrice) {
        result = result.filter(c => c.expectedPrice <= Number(filters.maxPrice));
      }
    }
    return result;
  }

  getAllCropsForAdmin(): Crop[] {
    return this.db.crops;
  }

  getCropById(id: number): Crop | undefined {
    return this.db.crops.find(c => c.id === id);
  }

  createCrop(cropData: Omit<Crop, 'id' | 'createdAt' | 'status' | 'rating'>): Crop {
    const maxId = this.db.crops.reduce((max, c) => Math.max(max, c.id), 0);
    const newCrop: Crop = {
      ...cropData,
      id: maxId + 1,
      rating: 4.8,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.crops.unshift(newCrop);

    // Add admin notification
    this.createNotification({
      userId: 6, // admin
      title: 'New Crop Listing',
      message: `${cropData.farmerName} listed ${cropData.name} (${cropData.quantity} ${cropData.unit}) in ${cropData.location}.`
    });

    this.saveDatabase();
    return newCrop;
  }

  updateCrop(id: number, updates: Partial<Crop>): Crop | null {
    const index = this.db.crops.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.db.crops[index] = { ...this.db.crops[index], ...updates };
    this.saveDatabase();
    return this.db.crops[index];
  }

  deleteCrop(id: number): boolean {
    const lenBefore = this.db.crops.length;
    this.db.crops = this.db.crops.filter(c => c.id !== id);
    if (this.db.crops.length !== lenBefore) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Mandis
  getMandis(): Mandi[] {
    return this.db.mandis;
  }

  getMandiById(id: number): Mandi | undefined {
    return this.db.mandis.find(m => m.id === id);
  }

  createMandi(mandiData: Omit<Mandi, 'id' | 'createdAt'>): Mandi {
    const maxId = this.db.mandis.reduce((max, m) => Math.max(max, m.id), 0);
    const newMandi: Mandi = {
      ...mandiData,
      id: maxId + 1,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.mandis.push(newMandi);
    this.saveDatabase();
    return newMandi;
  }

  updateMandi(id: number, updates: Partial<Mandi>): Mandi | null {
    const index = this.db.mandis.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.db.mandis[index] = { ...this.db.mandis[index], ...updates };
    this.saveDatabase();
    return this.db.mandis[index];
  }

  deleteMandi(id: number): boolean {
    const lenBefore = this.db.mandis.length;
    this.db.mandis = this.db.mandis.filter(m => m.id !== id);
    if (this.db.mandis.length !== lenBefore) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Mandi Prices
  getMandiPrices(cropName?: string): MandiPrice[] {
    if (cropName) {
      const q = cropName.toLowerCase();
      return this.db.mandiPrices.filter(mp => mp.cropName.toLowerCase().includes(q));
    }
    return this.db.mandiPrices;
  }

  createMandiPrice(data: Omit<MandiPrice, 'id' | 'updatedAt'>): MandiPrice {
    const maxId = this.db.mandiPrices.reduce((max, mp) => Math.max(max, mp.id), 0);
    const newPrice: MandiPrice = {
      ...data,
      id: maxId + 1,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.mandiPrices.push(newPrice);
    this.saveDatabase();
    return newPrice;
  }

  updateMandiPrice(id: number, updates: Partial<MandiPrice>): MandiPrice | null {
    const index = this.db.mandiPrices.findIndex(mp => mp.id === id);
    if (index === -1) return null;
    this.db.mandiPrices[index] = {
      ...this.db.mandiPrices[index],
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.saveDatabase();
    return this.db.mandiPrices[index];
  }

  deleteMandiPrice(id: number): boolean {
    const lenBefore = this.db.mandiPrices.length;
    this.db.mandiPrices = this.db.mandiPrices.filter(mp => mp.id !== id);
    if (this.db.mandiPrices.length !== lenBefore) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Auctions
  getAuctions(status?: string): Auction[] {
    if (status) {
      return this.db.auctions.filter(a => a.status === status);
    }
    return this.db.auctions;
  }

  getAuctionById(id: number): Auction | undefined {
    return this.db.auctions.find(a => a.id === id);
  }

  createAuction(data: Omit<Auction, 'id' | 'currentBid' | 'status' | 'createdAt' | 'winnerId' | 'winnerName'>): Auction {
    const maxId = this.db.auctions.reduce((max, a) => Math.max(max, a.id), 0);
    const newAuction: Auction = {
      ...data,
      id: maxId + 1,
      currentBid: data.basePrice,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.auctions.unshift(newAuction);

    // Notify buyers
    this.createNotification({
      userId: 4, // buyer
      title: 'New Crop Auction Live! 🌾',
      message: `${data.farmerName} started an auction for ${data.cropName} (${data.quantity} ${data.unit}) starting at ₹${data.basePrice}.`
    });

    this.saveDatabase();
    return newAuction;
  }

  // Bids
  getBids(auctionId?: number): Bid[] {
    if (auctionId) {
      return this.db.bids.filter(b => b.auctionId === auctionId).sort((a, b) => b.bidAmount - a.bidAmount);
    }
    return this.db.bids;
  }

  placeBid(auctionId: number, buyer: { id: number; name: string; phone?: string }, bidAmount: number): { success: boolean; message: string; bid?: Bid; auction?: Auction } {
    const auction = this.db.auctions.find(a => a.id === auctionId);
    if (!auction) {
      return { success: false, message: 'Auction not found.' };
    }

    if (auction.status !== 'active') {
      return { success: false, message: 'This auction has already ended.' };
    }

    if (auction.farmerId === buyer.id) {
      return { success: false, message: 'Farmers cannot place bids on their own auctions.' };
    }

    if (bidAmount <= auction.currentBid) {
      return { success: false, message: `Your bid (₹${bidAmount}) must be strictly higher than the current highest bid (₹${auction.currentBid}).` };
    }

    const previousWinnerId = auction.winnerId;

    // Create Bid
    const maxId = this.db.bids.reduce((max, b) => Math.max(max, b.id), 0);
    const newBid: Bid = {
      id: maxId + 1,
      auctionId,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      bidAmount,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.bids.unshift(newBid);

    // Update auction
    auction.currentBid = bidAmount;
    auction.winnerId = buyer.id;
    auction.winnerName = buyer.name;

    // Notify farmer
    this.createNotification({
      userId: auction.farmerId,
      title: 'New Highest Bid Received! 🏷️',
      message: `${buyer.name} placed a new highest bid of ₹${bidAmount}/${auction.unit} on your ${auction.cropName} auction.`
    });

    // Notify previous winner if outbid
    if (previousWinnerId && previousWinnerId !== buyer.id) {
      this.createNotification({
        userId: previousWinnerId,
        title: 'You Have Been Outbid! ⚠️',
        message: `Your bid on ${auction.cropName} was surpassed. Current highest bid is now ₹${bidAmount}.`
      });
    }

    this.saveDatabase();
    return { success: true, message: 'Bid placed successfully!', bid: newBid, auction };
  }

  // Inquiries
  getInquiries(userId?: number, role?: string): Inquiry[] {
    if (!userId || !role) {
      return this.db.inquiries;
    }
    if (role === 'farmer') {
      return this.db.inquiries.filter(i => i.farmerId === userId);
    }
    if (role === 'buyer') {
      return this.db.inquiries.filter(i => i.buyerId === userId);
    }
    return this.db.inquiries;
  }

  createInquiry(data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Inquiry {
    const maxId = this.db.inquiries.reduce((max, i) => Math.max(max, i.id), 0);
    const newInquiry: Inquiry = {
      ...data,
      id: maxId + 1,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.inquiries.unshift(newInquiry);

    // Notify farmer
    this.createNotification({
      userId: data.farmerId,
      title: 'New Crop Inquiry Received! 📩',
      message: `${data.buyerName} inquired for ${data.quantity} units of ${data.cropName}.`
    });

    this.saveDatabase();
    return newInquiry;
  }

  updateInquiryStatus(id: number, status: 'accepted' | 'rejected'): Inquiry | null {
    const inq = this.db.inquiries.find(i => i.id === id);
    if (!inq) return null;
    inq.status = status;

    // Notify buyer
    this.createNotification({
      userId: inq.buyerId,
      title: `Inquiry ${status === 'accepted' ? 'Accepted ✅' : 'Declined ❌'}`,
      message: `Farmer ${inq.farmerName} has marked your inquiry for ${inq.cropName} as ${status}.`
    });

    this.saveDatabase();
    return inq;
  }

  // Notifications
  getNotifications(userId?: number): Notification[] {
    if (userId) {
      return this.db.notifications.filter(n => n.userId === userId).sort((a, b) => b.id - a.id);
    }
    return [...this.db.notifications].sort((a, b) => b.id - a.id);
  }

  createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const maxId = this.db.notifications.reduce((max, n) => Math.max(max, n.id), 0);
    const newNotif: Notification = {
      ...data,
      id: maxId + 1,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.db.notifications.unshift(newNotif);
    this.saveDatabase();
    return newNotif;
  }

  markNotificationRead(id: number): boolean {
    const notif = this.db.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Stats
  getStats() {
    const totalFarmers = this.db.users.filter(u => u.role === 'farmer').length;
    const totalBuyers = this.db.users.filter(u => u.role === 'buyer').length;
    const listedCrops = this.db.crops.filter(c => c.status === 'active').length;
    const activeAuctions = this.db.auctions.filter(a => a.status === 'active').length;
    const totalMandis = this.db.mandis.length;
    const totalBids = this.db.bids.length;
    const totalInquiries = this.db.inquiries.length;
    const totalTransactions = this.db.transactions.length;

    return {
      totalFarmers,
      totalBuyers,
      listedCrops,
      activeAuctions,
      totalMandis,
      totalBids,
      totalInquiries,
      totalTransactions
    };
  }

  getTransactions(): Transaction[] {
    return this.db.transactions;
  }
}

export const storage = new Storage();
