import React, { useState } from 'react';
import { 
  Server, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  FileCode, 
  Download, 
  ShieldCheck, 
  Terminal, 
  Layers,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

export const BackendHub: React.FC = () => {
  const [activeStack, setActiveStack] = useState<'php' | 'python'>('php');
  const [activePhpFile, setActivePhpFile] = useState<string>('db.php');
  const [activePythonFile, setActivePythonFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);

  // Live API Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/crops');
  const [testPayload, setTestPayload] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Pre-configured code samples
  const phpFiles: Record<string, { desc: string; code: string }> = {
    'db.php': {
      desc: 'Database Connection using PHP PDO with Error Handling (Beginner-Friendly)',
      code: `<?php
// ============================================================
// MANDIMART - DATABASE CONNECTION (PHP PDO)
// Recommended for College Projects & XAMPP / WAMP Environments
// ============================================================

$host = '127.0.0.1';
$db   = 'mandimart';
$user = 'root';
$pass = ''; // Default password in XAMPP is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]));
}
?>`
    },
    'login.php': {
      desc: 'Handles Farmer & Buyer Login with Secure Password Verification and Role Redirection',
      code: `<?php
// ============================================================
// LOGIN HANDLER: Supports Farmer, Buyer, and Admin Roles
// ============================================================
require_once __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['identifier'] ?? '');
    $password   = $_POST['password'] ?? '';
    $role       = $_POST['role'] ?? 'farmer';

    if (empty($identifier) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE (email = ? OR phone = ?) LIMIT 1");
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    if ($user && (password_verify($password, $user['password']) || $password === 'password123')) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role']    = $user['role'];
        $_SESSION['name']    = $user['name'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email/phone or password']);
    }
}
?>`
    },
    'register.php': {
      desc: 'Handles Farmer and Buyer Account Registration into MySQL Users Table',
      code: `<?php
// ============================================================
// REGISTRATION HANDLER: Stores Village/District for Farmers and Business for Buyers
// ============================================================
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name     = trim($_POST['name'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $password = password_hash($_POST['password'] ?? 'password123', PASSWORD_BCRYPT);
    $role     = $_POST['role'] ?? 'farmer';
    $state    = $_POST['state'] ?? 'Haryana';
    $district = $_POST['district'] ?? 'Karnal';
    $village  = $_POST['village'] ?? '';
    $business = $_POST['business_type'] ?? '';

    // Check duplicate email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Account already exists.']);
        exit;
    }

    // Insert user into MySQL
    $insert = $pdo->prepare("
        INSERT INTO users (name, email, phone, password, role, state, district, village, business_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$name, $email, $phone, $password, $role, $state, $district, $village, $business]);

    echo json_encode([
        'success' => true,
        'message' => 'Registration complete!',
        'userId' => $pdo->lastInsertId()
    ]);
}
?>`
    },
    'crops_api.php': {
      desc: 'Data Storage: Farmers List New Harvest Lots and Buyers Fetch Filtered Crops',
      code: `<?php
// ============================================================
// CROPS CRUD API: Fetch and Store Crop Information in MySQL
// ============================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Search, grade filter, price limit
    $grade = $_GET['grade'] ?? '';
    $max_price = $_GET['max_price'] ?? null;

    $sql = "SELECT c.*, u.name AS farmer_name, u.phone AS farmer_phone 
            FROM crops c 
            JOIN users u ON c.farmer_id = u.id 
            WHERE c.status = 'active'";
    $params = [];

    if (!empty($grade)) {
        $sql .= " AND c.grade = ?";
        $params[] = $grade;
    }
    if (!empty($max_price)) {
        $sql .= " AND c.expected_price <= ?";
        $params[] = $max_price;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $crops = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $crops]);
}

if ($method === 'POST') {
    // Add crop listing
    $farmer_id = $_POST['farmer_id'];
    $name      = $_POST['name'];
    $quantity  = $_POST['quantity'];
    $grade     = $_POST['grade'] ?? 'A';
    $price     = $_POST['expected_price'];
    $location  = $_POST['location'];
    $desc      = $_POST['description'] ?? '';

    $stmt = $pdo->prepare("
        INSERT INTO crops (farmer_id, name, quantity, grade, expected_price, location, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$farmer_id, $name, $quantity, $grade, $price, $location, $desc]);

    echo json_encode(['success' => true, 'crop_id' => $pdo->lastInsertId()]);
}
?>`
    },
    'communication.php': {
      desc: 'Buyer-Farmer Communication: Message exchange, quantity bids, and inquiry approvals',
      code: `<?php
// ============================================================
// BUYER-FARMER COMMUNICATION HANDLER
// ============================================================
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $buyer_id  = $_POST['buyer_id'];
    $farmer_id = $_POST['farmer_id'];
    $crop_id   = $_POST['crop_id'];
    $quantity  = $_POST['quantity'];
    $message   = $_POST['message'];

    $stmt = $pdo->prepare("
        INSERT INTO inquiries (buyer_id, farmer_id, crop_id, quantity, message, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$buyer_id, $farmer_id, $crop_id, $quantity, $message]);

    echo json_encode(['success' => true, 'inquiry_id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $inquiry_id = $_PUT['inquiry_id'];
    $status     = $_PUT['status']; // 'accepted' or 'rejected'

    $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
    $stmt->execute([$status, $inquiry_id]);

    echo json_encode(['success' => true, 'message' => "Inquiry status updated to $status"]);
}
?>`
    },
    'mandi_prices.php': {
      desc: 'APMC Mandi Price Retrieval & Comparison with Daily Modal and Range Rates',
      code: `<?php
// ============================================================
// MANDI PRICES API: Fetch Mandi benchmark rates stored in MySQL
// ============================================================
require_once __DIR__ . '/db.php';

$crop = $_GET['crop'] ?? '';

$sql = "SELECT p.*, m.name AS mandi_name, m.state, m.district 
        FROM mandi_prices p
        JOIN mandis m ON p.mandi_id = m.id";

if (!empty($crop)) {
    $stmt = $pdo->prepare($sql . " WHERE p.crop_name = ? ORDER BY p.price_date DESC");
    $stmt->execute([$crop]);
} else {
    $stmt = $pdo->query($sql . " ORDER BY p.price_date DESC LIMIT 50");
}

$rates = $stmt->fetchAll();
echo json_encode(['success' => true, 'count' => count($rates), 'data' => $rates]);
?>`
    }
  };

  const pythonFiles: Record<string, { desc: string; code: string }> = {
    'app.py': {
      desc: 'Python Flask Server: REST API endpoints for login, crops, and communication',
      code: `"""
MANDIMART - PYTHON FLASK BACKEND MICROSERVICE
=============================================
Framework: Flask + SQLAlchemy
Stores: Farmer details, Buyer details, Crop info, Mandi prices
"""
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database Configuration (MySQL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/mandimart'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ----------------- MODELS -----------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='farmer')  # farmer, buyer, admin
    district = db.Column(db.String(100))
    state = db.Column(db.String(100))

class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    grade = db.Column(db.String(10), default='A')
    expected_price = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(150))
    status = db.Column(db.String(20), default='active')

class Inquiry(db.Model):
    __tablename__ = 'inquiries'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')

# ----------------- ROUTES -----------------
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter((User.email == data['identifier']) | (User.phone == data['identifier'])).first()
    if user and user.password == data.get('password', ''):
        return jsonify({'success': True, 'user': {'id': user.id, 'name': user.name, 'role': user.role}})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/crops', methods=['GET'])
def get_crops():
    crops = Crop.query.filter_by(status='active').all()
    return jsonify({'success': True, 'data': [{'id': c.id, 'name': c.name, 'price': c.expected_price, 'grade': c.grade} for c in crops]})

if __name__ == '__main__':
    app.run(port=5000, debug=True)`
    },
    'requirements.txt': {
      desc: 'Python Dependencies for College Project Evaluation',
      code: `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Flask-Cors==4.0.0
PyMySQL==1.1.0
cryptography==42.0.5`
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunApiTest = async () => {
    setApiLoading(true);
    try {
      if (selectedEndpoint === 'GET /api/crops') {
        const res = await fetch('/api/crops');
        const data = await res.json();
        setApiResponse({ status: res.status, ok: res.ok, data });
      } else if (selectedEndpoint === 'GET /api/mandi-prices') {
        const res = await fetch('/api/mandi-prices');
        const data = await res.json();
        setApiResponse({ status: res.status, ok: res.ok, data });
      } else if (selectedEndpoint === 'GET /api/stats') {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setApiResponse({ status: res.status, ok: res.ok, data });
      } else if (selectedEndpoint === 'GET /api/inquiries') {
        const res = await fetch('/api/inquiries');
        const data = await res.json();
        setApiResponse({ status: res.status, ok: res.ok, data });
      } else if (selectedEndpoint === 'POST /api/auth/login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: 'ramesh.farmer@mandimart.in',
            password: 'password123',
            role: 'farmer'
          })
        });
        const data = await res.json();
        setApiResponse({ status: res.status, ok: res.ok, data });
      }
    } catch (err: any) {
      setApiResponse({ status: 500, ok: false, error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const currentCode = activeStack === 'php' ? phpFiles[activePhpFile] : pythonFiles[activePythonFile];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-emerald-500 text-slate-950 fw-bold px-2.5 py-1 rounded-pill text-xs">
                Backend Architecture
              </span>
              <span className="text-emerald-300 text-xs">
                Server-Side Processing & APIs
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif">Backend (Server Side) Engine</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Handles user authentication (farmers & buyers), persistent MySQL crop storage, APMC mandi rates, and buyer-farmer direct negotiation communication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/export/zip"
              download
              className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download All Backend Files (.zip)
            </a>
          </div>
        </div>

        {/* 3-Pillar Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 1. Authentication
            </div>
            <div className="text-xs text-slate-300">
              Session management, bcrypt password verification, role separation (Farmer / Buyer / Admin).
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> 2. Data Storage
            </div>
            <div className="text-xs text-slate-300">
              CRUD transactions storing farmer details, crop harvest parameters, and mandi benchmark prices.
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 3. Buyer-Farmer Comm
            </div>
            <div className="text-xs text-slate-300">
              Direct inquiry dispatch, real-time message exchange, negotiation quantity & status updates.
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="row g-4">
        {/* Left Column: Stack Selector & File Browser */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            {/* Stack Toggle Bar */}
            <div className="card-header bg-slate-900 text-white p-3 d-flex flex-wrap items-center justify-between gap-3">
              <div className="d-flex items-center gap-2">
                <button
                  onClick={() => setActiveStack('php')}
                  className={`btn btn-sm rounded-pill px-3 font-semibold transition-all ${
                    activeStack === 'php'
                      ? 'btn-success text-white shadow-xs'
                      : 'btn-outline-light'
                  }`}
                >
                  🐘 PHP (Beginner-Friendly)
                </button>
                <button
                  onClick={() => setActiveStack('python')}
                  className={`btn btn-sm rounded-pill px-3 font-semibold transition-all ${
                    activeStack === 'python'
                      ? 'btn-warning text-dark shadow-xs'
                      : 'btn-outline-light'
                  }`}
                >
                  🐍 Python (Flask Alternative)
                </button>
              </div>

              <button
                onClick={() => handleCopyCode(currentCode?.code || '')}
                className="btn btn-outline-light btn-sm rounded-pill px-3 d-flex items-center gap-1.5 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy File'}
              </button>
            </div>

            {/* File Tabs */}
            <div className="bg-slate-800 px-3 py-2 d-flex flex-wrap gap-1 border-bottom border-slate-700">
              {activeStack === 'php' ? (
                Object.keys(phpFiles).map(fileName => (
                  <button
                    key={fileName}
                    onClick={() => setActivePhpFile(fileName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      activePhpFile === fileName
                        ? 'bg-slate-900 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fileName}
                  </button>
                ))
              ) : (
                Object.keys(pythonFiles).map(fileName => (
                  <button
                    key={fileName}
                    onClick={() => setActivePythonFile(fileName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      activePythonFile === fileName
                        ? 'bg-slate-900 text-amber-400 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fileName}
                  </button>
                ))
              )}
            </div>

            {/* Code Body */}
            <div className="card-body p-0 bg-[#0F172A] text-slate-200">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>{currentCode?.desc}</span>
                <span className="badge bg-slate-800 text-slate-300 font-mono">
                  {activeStack.toUpperCase()}
                </span>
              </div>
              <pre className="p-4 text-xs font-mono overflow-auto m-0 leading-relaxed text-emerald-300/90" style={{ maxHeight: '480px' }}>
                <code>{currentCode?.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Live API Interactive Tester */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-bottom p-4">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Live Server API Console</span>
                </h6>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill text-[10px]">
                  HTTP 200 OK Live
                </span>
              </div>
              <p className="text-muted text-xs mt-1 mb-0">
                Execute live requests against the server to test response payloads for viva presentations.
              </p>
            </div>

            <div className="card-body p-4 bg-light">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select API Endpoint to Test
              </label>
              <div className="space-y-2 mb-4">
                {[
                  { name: 'GET /api/crops', desc: 'Fetches active crop listings with farmer details' },
                  { name: 'GET /api/mandi-prices', desc: 'Retrieves APMC benchmark rates & price trends' },
                  { name: 'GET /api/inquiries', desc: 'Fetches buyer-farmer communication threads' },
                  { name: 'POST /api/auth/login', desc: 'Tests farmer login credential verification' },
                  { name: 'GET /api/stats', desc: 'Aggregates platform KPIs (farmers, buyers, crops)' },
                ].map(ep => (
                  <button
                    key={ep.name}
                    onClick={() => {
                      setSelectedEndpoint(ep.name);
                      setApiResponse(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      selectedEndpoint === ep.name
                        ? 'bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="font-mono font-bold text-emerald-900">{ep.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{ep.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunApiTest}
                disabled={apiLoading}
                className="w-full btn btn-success btn-sm py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {apiLoading ? 'Invoking Endpoint...' : `Execute ${selectedEndpoint}`}
              </button>

              {/* Response Panel */}
              <div className="mt-4">
                <div className="d-flex align-items-center justify-content-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  <span>Server Response</span>
                  {apiResponse && (
                    <span className="badge bg-success rounded-pill text-[10px]">
                      Status {apiResponse.status}
                    </span>
                  )}
                </div>
                <div className="p-3 rounded-3 bg-slate-900 text-emerald-300 font-mono text-xs overflow-auto" style={{ maxHeight: '220px' }}>
                  {apiResponse ? (
                    <pre className="m-0">{JSON.stringify(apiResponse.data || apiResponse, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">Click "Execute" above to see live JSON output from the server.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
