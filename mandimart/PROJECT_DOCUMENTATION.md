# MandiMart – Agricultural Marketplace College Project Submission

## Project Overview & Architecture
This project is built strictly following the specified academic 3-tier architecture:

### 1. Frontend (Website Design)
**This is what farmers and buyers see on the website:**
- **HTML5**: Semantic document structure (header, navigation, hero banner, crop cards, modals, tables, and footers).
- **CSS3**: Agricultural custom styling with earth-green and amber tones, card hover transitions, and badge styling.
- **JavaScript (ES6+)**: Interactive features including live client-side search, category/grade filters, dynamic price calculators, and modal handlers.
- **Bootstrap 5**: Ready-made responsive grid system (`container`, `row`, `col-12 col-md-6 col-lg-4`), cards, badges, buttons, responsive tables, and dialogs for mobile and desktop screens.

### 2. Backend (Server Side)
**Handles login, data storage, and buyer-farmer communication:**
- **PHP 8 (Simple and beginner-friendly)**:
  - `includes/db.php`: Database connection using PHP PDO with error modes.
  - `login.php`: Handles session login for farmers, buyers, and admins with password hashing.
  - `register.php`: Role-based registration storing village/district for farmers and business info for buyers.
  - `farmer/add_crop.php`: Data storage inserting new harvest lots into MySQL.
  - `buyer/inquiries.php`: Direct communication channel allowing buyers to send procurement messages and farmers to accept/reject.
- **Python (Flask Alternative)**:
  - `ai-backend/app.py`: REST API with Flask, CORS, SQLAlchemy, and image computer-vision analysis.

### 3. Database (MySQL - Recommended for College Projects)
**Stores all primary platform entities in InnoDB normalized tables:**
- **`users` Table**:
  - Stores **Farmer Details** (`name`, `phone`, `village`, `district`, `state`, `pincode`, `role='farmer'`).
  - Stores **Buyer Details** (`name`, `phone`, `business_type`, `contact_person`, `district`, `state`, `role='buyer'`).
- **`crops` Table**:
  - Stores **Crop Information** (`farmer_id`, `name`, `quantity`, `unit`, `grade`, `expected_price`, `location`, `description`, `status`).
- **`mandi_prices` & `mandis` Tables**:
  - Stores **APMC Mandi Prices** (`mandi_id`, `crop_name`, `min_price`, `max_price`, `average_price`, `price_date`, `trend`).
- **`inquiries` Table**:
  - Stores **Buyer-Farmer Communication** (`buyer_id`, `farmer_id`, `crop_id`, `quantity`, `message`, `status`).

---

## Quick Setup Instructions for College Presentation

### Running with XAMPP / WAMP (PHP + MySQL):
1. Copy the `mandimart` folder to `C:/xampp/htdocs/mandimart`
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open `http://localhost/phpmyadmin/` in your browser.
4. Create a database named `mandimart` and import `database/mandimart.sql`.
5. Visit `http://localhost/mandimart/` in your browser.
6. Log in with demo accounts:
   - **Farmer**: `ramesh.farmer@mandimart.in` / `password123`
   - **Buyer**: `buyer.rajesh@delhifresh.com` / `password123`
   - **Admin**: `admin@mandimart.gov.in` / `admin123`

### Running the Python Flask Alternative:
```bash
cd ai-backend
pip install -r requirements.txt
python app.py
```
Flask server starts on `http://127.0.0.1:5000`.
