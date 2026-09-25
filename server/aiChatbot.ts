import { GoogleGenAI } from '@google/genai';
import { storage } from './storage';

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

export async function processChatbotMessage(message: string, language: 'en' | 'hi' = 'en'): Promise<string> {
  const q = message.trim().toLowerCase();
  const prices = storage.getMandiPrices();

  // Try Gemini if available
  if (aiClient) {
    try {
      const mandiSummary = prices
        .slice(0, 8)
        .map(p => `${p.cropName} at ${p.mandiName}: ₹${p.averagePrice}/quintal (Range: ₹${p.minPrice}-₹${p.maxPrice})`)
        .join(', ');

      const systemInstruction = `You are MandiMart AI Assistant, an agricultural expert assisting Indian farmers and buyers.
Context:
- Platform: MandiMart ("Sell Smarter. Earn Better.")
- Key features: Direct farmer-buyer marketplace, live mandi price comparison, auctions with real-time bidding, AI vegetable quality inspection.
- Current Demo Mandi Prices: ${mandiSummary}.
- Language preference: ${language === 'hi' ? 'Hindi (or simple Hinglish/Hindi in Devanagari)' : 'English'}.
- Tone: Helpful, respectful (use 'ji' where appropriate), practical, concise.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 500,
        }
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local rule-based expert engine:', err);
    }
  }

  // Fallback intelligent domain engine
  if (q.includes('price') || q.includes('bhav') || q.includes('rate') || q.includes('daam') || q.includes('mandi')) {
    let matched = prices;
    if (q.includes('tomato') || q.includes('tamatar')) matched = prices.filter(p => p.cropName.toLowerCase().includes('tomato'));
    else if (q.includes('onion') || q.includes('pyaz')) matched = prices.filter(p => p.cropName.toLowerCase().includes('onion'));
    else if (q.includes('potato') || q.includes('aloo')) matched = prices.filter(p => p.cropName.toLowerCase().includes('potato'));
    else if (q.includes('wheat') || q.includes('gehun')) matched = prices.filter(p => p.cropName.toLowerCase().includes('wheat'));

    if (matched.length > 0) {
      const list = matched.slice(0, 4).map(p => `• ${p.cropName} (${p.mandiName}): Avg ₹${p.averagePrice}/Qtl (Range: ₹${p.minPrice} - ₹${p.maxPrice}) [Trend: ${p.trend.toUpperCase()}]`).join('\n');
      if (language === 'hi') {
        return `🌾 आज के मंडी भाव (डेमो डेटा):\n\n${list}\n\nआप 'Mandi Prices' या 'Find Mandi' पेज पर अपने नजदीकी मंडी की दूरी और भाव देख सकते हैं।`;
      }
      return `🌾 Today's Mandi Prices (Demo Data):\n\n${list}\n\nVisit the 'Mandi Prices' or 'Find Mandi' section to calculate exact distance and compare mandis near your location.`;
    }
  }

  if (q.includes('sell') || q.includes('list') || q.includes('bechna') || q.includes('kaise beche')) {
    if (language === 'hi') {
      return `🌾 MandiMart पर फसल कैसे बेचें:\n1. 'Register' में जाकर Farmer खाता बनाएं।\n2. 'Farmer Dashboard' में 'Add Crop' पर क्लिक करें।\n3. फसल का नाम, मात्रा, ग्रेड (A+, A, B) और अपेक्षित मूल्य दर्ज करें।\n4. फसल की फोटो अपलोड करें और सबमिट करें।\n5. आपकी फसल तुरंत 'Marketplace' पर लाइव हो जाएगी और खरीदार आपसे सीधा संपर्क कर सकेंगे!`;
    }
    return `🌾 How to Sell Your Crop on MandiMart:\n1. Register or Log in as a Farmer.\n2. Navigate to your Farmer Dashboard and click 'Add Crop'.\n3. Enter crop details: name, quantity (quintal/kg), quality grade, expected price, and farm location.\n4. Upload high-clarity crop photos.\n5. Click 'Submit Listing' — your produce is immediately available to verified buyers in the Marketplace without middleman commissions!`;
  }

  if (q.includes('auction') || q.includes('boli') || q.includes('bid')) {
    if (language === 'hi') {
      return `🔨 नीलामी (Auction) प्रणाली:\n• किसान अपनी फसल के लिए बेस प्राइस (Base Price) और समय तय करके ऑक्शन शुरू कर सकते हैं।\n• खरीदार (Buyers) लाइव बोली (Bid) लगाते हैं।\n• हर नई बोली मौजूदा उच्चतम बोली से अधिक होनी चाहिए।\n• समय समाप्त होने पर उच्चतम बोली लगाने वाला विजेता बनता है और दोनों पक्षों को तुरंत नोटिफिकेशन मिलता है।`;
    }
    return `🔨 How MandiMart Auctions Work:\n• Farmers can create an auction by defining base price, lot quantity, and end time.\n• Verified buyers place live competitive bids in real time.\n• Server enforces that each new bid is higher than the current top bid.\n• When the timer expires, the highest valid bid wins, and both the farmer and winning buyer receive immediate confirmation notifications!`;
  }

  if (q.includes('ai') || q.includes('quality') || q.includes('vegetable') || q.includes('comparison') || q.includes('guvatta')) {
    if (language === 'hi') {
      return `🤖 AI Vegetable Quality Comparison:\n• 'AI Comparison' पेज पर जाएं।\n• एक ही सब्जी की दो फोटो अपलोड करें (उदा. टमाटर बनाम टमाटर)।\n• हमारा AI कंप्यूटर विज़न ताजगी (40%), रंग एकरूपता (20%), आकार (20%), और दोष-मुक्त स्कोर (20%) का विश्लेषण करके Grade (A+, A, B, C) और विजेता सिफारिश प्रदान करता है।`;
    }
    return `🤖 AI Vegetable Quality Comparison:\n• Navigate to the 'AI Comparison' tab.\n• Upload two photos of the same vegetable (e.g. Tomato vs Tomato or Potato vs Potato).\n• Our computer vision algorithm evaluates Freshness (40%), Color Consistency (20%), Size & Shape (20%), and Defect-Free score (20%).\n• You receive an instant visual report with grades (A+, A, B, C, Poor), identified defects, and dynamic recommendations!`;
  }

  // General fallback
  if (language === 'hi') {
    return `नमस्ते किसान भाई! मैं MandiMart का AI सहायक हूँ।\nआप मुझसे निम्न विषयों पर पूछ सकते हैं:\n1. आज के मंडी भाव (Tomato, Onion, Potato, Wheat)\n2. फसल कैसे लिस्ट और बेचें\n3. लाइव नीलामी (Auctions) कैसे काम करती है\n4. AI सब्जी गुणवत्ता तुलना कैसे करें\n5. खरीदारों से सीधे कैसे जुड़ें`;
  }

  return `Hello! I am your MandiMart AI Agricultural Assistant. 🌾\n\nHow can I help you today?\n• Check today's mandi prices and trends (e.g., "Tomato prices in Azadpur")\n• Step-by-step guidance on listing crops and connecting directly with buyers\n• Understanding the live crop auction system and bidding\n• How to use AI Vegetable Quality Comparison\n• Agricultural advice and platform features`;
}
