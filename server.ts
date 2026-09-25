import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { storage } from './server/storage';
import { compareVegetableImages } from './server/visionAnalyzer';
import { processChatbotMessage } from './server/aiChatbot';

const app = express();
const PORT = 3000;

// Multer memory storage for uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email/mobile and password.' });
  }

  const user = storage.getUserByEmailOrPhone(identifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `Account is registered as a ${user.role}, not ${role}. Please select the correct login role.`
    });
  }

  // Password verify (for demo, any valid matching or default hash passes)
  const { passwordHash, ...safeUser } = user;
  return res.json({
    success: true,
    message: 'Login successful!',
    user: safeUser
  });
});

app.post('/api/auth/register', (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    address,
    state,
    district,
    village,
    pincode,
    businessType,
    contactPerson
  } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required registration fields.' });
  }

  const existingEmail = storage.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const existingPhone = storage.getUsers().find(u => u.phone === phone.trim());
  if (existingPhone) {
    return res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
  }

  const newUser = storage.createUser({
    name,
    email,
    phone,
    passwordHash: `$2y$10$hashed_${Date.now()}`,
    role: role as 'farmer' | 'buyer',
    address: address || '',
    state: state || 'Haryana',
    district: district || 'Karnal',
    village: village || '',
    pincode: pincode || '110001',
    businessType,
    contactPerson
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    message: 'Registration successful! Please login to continue.',
    user: safeUser
  });
});

// ----------------------------------------------------
// CROPS ROUTES
// ----------------------------------------------------
app.get('/api/crops', (req, res) => {
  const { name, location, grade, maxPrice, farmerId, status } = req.query;
  const crops = storage.getCrops({
    name: name as string,
    location: location as string,
    grade: grade as string,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    farmerId: farmerId ? Number(farmerId) : undefined,
    status: status as string
  });
  res.json({ success: true, count: crops.length, data: crops });
});

app.get('/api/crops/:id', (req, res) => {
  const crop = storage.getCropById(Number(req.params.id));
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found.' });
  }
  res.json({ success: true, data: crop });
});

app.post('/api/crops', upload.single('crop_image'), (req, res) => {
  try {
    const { farmerId, farmerName, farmerPhone, name, quantity, unit, grade, expectedPrice, location, description } = req.body;
    if (!farmerId || !name || !quantity || !unit || !grade || !expectedPrice) {
      return res.status(400).json({ success: false, message: 'Please fill all required crop listing fields.' });
    }

    let imageUrl = '/assets/images/sample_tomato.svg';
    if (name.toLowerCase().includes('onion')) imageUrl = '/assets/images/sample_onion.svg';
    else if (name.toLowerCase().includes('potato')) imageUrl = '/assets/images/sample_potato.svg';
    else if (name.toLowerCase().includes('wheat')) imageUrl = '/assets/images/sample_wheat.svg';
    else if (name.toLowerCase().includes('brinjal')) imageUrl = '/assets/images/sample_brinjal.svg';
    else if (name.toLowerCase().includes('cauliflower')) imageUrl = '/assets/images/sample_cauliflower.svg';
    else if (name.toLowerCase().includes('carrot')) imageUrl = '/assets/images/sample_carrot.svg';

    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newCrop = storage.createCrop({
      farmerId: Number(farmerId),
      farmerName: farmerName || 'Verified Farmer',
      farmerPhone: farmerPhone || '9876543210',
      name,
      quantity: Number(quantity),
      unit,
      grade,
      expectedPrice: Number(expectedPrice),
      location: location || 'Karnal, Haryana',
      description: description || '',
      image: imageUrl
    });

    res.status(201).json({ success: true, message: 'Crop listing created successfully!', data: newCrop });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error listing crop.' });
  }
});

app.put('/api/crops/:id', (req, res) => {
  const updated = storage.updateCrop(Number(req.params.id), req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Crop not found.' });
  }
  res.json({ success: true, message: 'Crop updated successfully.', data: updated });
});

app.delete('/api/crops/:id', (req, res) => {
  const deleted = storage.deleteCrop(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Crop not found.' });
  }
  res.json({ success: true, message: 'Crop listing removed successfully.' });
});

// ----------------------------------------------------
// MANDIS & PRICES ROUTES
// ----------------------------------------------------
app.get('/api/mandis', (req, res) => {
  const mandis = storage.getMandis();
  res.json({ success: true, data: mandis });
});

app.post('/api/mandis', (req, res) => {
  const { name, location, state, district, latitude, longitude } = req.body;
  const newMandi = storage.createMandi({
    name,
    location,
    state,
    district,
    latitude: Number(latitude) || 28.7,
    longitude: Number(longitude) || 77.1
  });
  res.status(201).json({ success: true, data: newMandi });
});

app.get('/api/mandi-prices', (req, res) => {
  const { crop } = req.query;
  const prices = storage.getMandiPrices(crop as string);
  res.json({
    success: true,
    demo_notice: 'Demo Data – Not Live Market Prices',
    data: prices
  });
});

app.post('/api/mandi-prices', (req, res) => {
  const { mandiId, mandiName, cropName, minPrice, maxPrice, averagePrice, trend } = req.body;
  const newPrice = storage.createMandiPrice({
    mandiId: Number(mandiId),
    mandiName,
    cropName,
    minPrice: Number(minPrice),
    maxPrice: Number(maxPrice),
    averagePrice: Number(averagePrice),
    priceDate: new Date().toISOString().substring(0, 10),
    trend: trend || 'stable'
  });
  res.status(201).json({ success: true, data: newPrice });
});

// ----------------------------------------------------
// AUCTIONS & BIDS ROUTES
// ----------------------------------------------------
app.get('/api/auctions', (req, res) => {
  const { status } = req.query;
  const auctions = storage.getAuctions(status as string);
  res.json({ success: true, data: auctions });
});

app.get('/api/auctions/:id', (req, res) => {
  const auction = storage.getAuctionById(Number(req.params.id));
  if (!auction) {
    return res.status(404).json({ success: false, message: 'Auction not found.' });
  }
  const bids = storage.getBids(auction.id);
  res.json({ success: true, data: { ...auction, bids } });
});

app.post('/api/auctions', upload.single('auction_image'), (req, res) => {
  try {
    const { farmerId, farmerName, cropName, quantity, unit, grade, basePrice, startTime, endTime, description, location } = req.body;

    let imageUrl = '/assets/images/sample_tomato.svg';
    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newAuction = storage.createAuction({
      farmerId: Number(farmerId),
      farmerName: farmerName || 'Verified Farmer',
      cropName,
      quantity: Number(quantity),
      unit: unit || 'Quintal',
      grade: grade || 'A',
      basePrice: Number(basePrice),
      startTime: startTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
      endTime: endTime || new Date(Date.now() + 86400000).toISOString().replace('T', ' ').substring(0, 19),
      image: imageUrl,
      description: description || 'Fresh farm produce lot available for competitive bidding.',
      location: location || 'Haryana'
    });

    res.status(201).json({ success: true, message: 'Auction created successfully!', data: newAuction });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating auction.' });
  }
});

app.post('/api/auctions/:id/bid', (req, res) => {
  const auctionId = Number(req.params.id);
  const { buyerId, buyerName, buyerPhone, bidAmount } = req.body;

  if (!buyerId || !bidAmount) {
    return res.status(400).json({ success: false, message: 'Buyer information and bid amount are required.' });
  }

  const result = storage.placeBid(
    auctionId,
    { id: Number(buyerId), name: buyerName || 'Buyer', phone: buyerPhone },
    Number(bidAmount)
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// ----------------------------------------------------
// INQUIRIES ROUTES
// ----------------------------------------------------
app.get('/api/inquiries', (req, res) => {
  const { userId, role } = req.query;
  const inquiries = storage.getInquiries(
    userId ? Number(userId) : undefined,
    role as string
  );
  res.json({ success: true, data: inquiries });
});

app.post('/api/inquiries', (req, res) => {
  const { buyerId, buyerName, buyerPhone, farmerId, farmerName, cropId, cropName, quantity, message } = req.body;
  if (!buyerId || !farmerId || !cropId || !message) {
    return res.status(400).json({ success: false, message: 'Missing required inquiry details.' });
  }

  const newInq = storage.createInquiry({
    buyerId: Number(buyerId),
    buyerName: buyerName || 'Interested Buyer',
    buyerPhone: buyerPhone || '',
    farmerId: Number(farmerId),
    farmerName: farmerName || 'Farmer',
    cropId: Number(cropId),
    cropName: cropName || 'Produce',
    quantity: Number(quantity) || 1,
    message
  });

  res.status(201).json({ success: true, message: 'Inquiry sent directly to farmer!', data: newInq });
});

app.patch('/api/inquiries/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const updated = storage.updateInquiryStatus(Number(req.params.id), status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }
  res.json({ success: true, message: `Inquiry ${status} successfully.`, data: updated });
});

// ----------------------------------------------------
// NOTIFICATIONS ROUTES
// ----------------------------------------------------
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const notifications = storage.getNotifications(userId ? Number(userId) : undefined);
  res.json({ success: true, data: notifications });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const updated = storage.markNotificationRead(Number(req.params.id));
  res.json({ success: updated });
});

app.put('/api/notifications', (req, res) => {
  const { userId } = req.body;
  if (userId) {
    const list = storage.getNotifications(Number(userId));
    list.forEach(n => storage.markNotificationRead(n.id));
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// STATS ROUTE
// ----------------------------------------------------
app.get('/api/stats', (req, res) => {
  const stats = storage.getStats();
  res.json({ success: true, data: stats });
});

// ----------------------------------------------------
// AI CHATBOT ROUTE
// ----------------------------------------------------
app.post('/api/chatbot', async (req, res) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  try {
    const reply = await processChatbotMessage(message, language || 'en');
    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Chatbot error' });
  }
});

// ----------------------------------------------------
// AI VEGETABLE QUALITY COMPARISON ROUTE
// (Compatible with Flask POST /api/compare-vegetables)
// ----------------------------------------------------
app.post(
  '/api/compare-vegetables',
  upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.file1 || !files.file2) {
        return res.status(400).json({
          success: false,
          error: 'Please upload both vegetable images (file1 and file2).'
        });
      }

      const file1 = files.file1[0];
      const file2 = files.file2[0];

      // Validate MIME types
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
      if (!allowedMimes.includes(file1.mimetype) || !allowedMimes.includes(file2.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file format. Supported formats are JPG, JPEG, PNG, WEBP, and SVG.'
        });
      }

      const result = compareVegetableImages(
        { buffer: file1.buffer, filename: file1.originalname, size: file1.size },
        { buffer: file2.buffer, filename: file2.originalname, size: file2.size }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err: any) {
      console.error('AI Comparison processing error:', err);
      res.status(500).json({
        success: false,
        error: 'AI service encountered an issue processing image pixels. Please try again with clear photos.'
      });
    }
  }
);

// ----------------------------------------------------
// COLLEGE PROJECT ZIP EXPORT
// ----------------------------------------------------
app.get('/api/export/zip', async (req, res) => {
  try {
    const zip = new JSZip();
    const mandimartDir = path.resolve(process.cwd(), 'mandimart');

    function addDirToZip(dirPath: string, zipFolder: JSZip) {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const full = path.join(dirPath, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          addDirToZip(full, zipFolder.folder(item)!);
        } else {
          zipFolder.file(item, fs.readFileSync(full));
        }
      }
    }

    addDirToZip(mandimartDir, zip);
    const content = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="mandimart-full-stack.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Could not generate zip: ' + err.message });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE IN DEV / STATIC SERVE IN PROD
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 MandiMart Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
