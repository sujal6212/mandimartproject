# MandiMart AI Vegetable Quality Comparison Backend

This is the Python Flask microservice for MandiMart that performs dynamic computer vision quality assessment on vegetable images.

## Architecture
- **Framework**: Python 3.10+ & Flask
- **Computer Vision**: Pillow, NumPy (RGB/HSL color distribution, edge contour balance, localized luminance defect anomaly detection)
- **Endpoint**: `POST /api/compare-vegetables`
- **Payload**: `multipart/form-data` with `file1` and `file2`
- **Port**: `5000`

---

## Setup Instructions

### 1. Prerequisites
- Python 3.10 or higher installed.

### 2. Create Virtual Environment
```bash
cd ai-backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask Service
```bash
python app.py
```
The server will start on:
`http://127.0.0.1:5000`

---

## Testing the API with cURL
```bash
curl -X POST http://127.0.0.1:5000/api/compare-vegetables \
  -F "file1=@tomato_fresh.jpg" \
  -F "file2=@tomato_blemished.jpg"
```
