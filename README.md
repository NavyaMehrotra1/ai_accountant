# AI Accountant 🤖💼

An intelligent accounting assistant that automates your bookkeeping tasks. Upload receipts, invoices, and financial documents, and let AI handle categorization, data extraction, and financial reporting.

## Features

### Core Features
- **📤 Document Upload**: Support for receipts, invoices, bank statements (PDF, images)
- **🧠 AI-Powered Processing**: Automatic data extraction using OCR and LLM
- **📊 Smart Categorization**: Intelligent expense/income categorization
- **💰 Financial Insights**: Automated reports, summaries, and analytics
- **📈 Dashboard**: Beautiful, modern UI to view your financial data
- **🔒 Secure**: Local processing with optional cloud AI integration

### New Features ✨
- **👤 Personal & 🏢 Business Modes**: Separate modes optimized for individuals and companies
- **📊 Professional Financial Statements** (Business Mode): Auto-generate Income Statements, Balance Sheets, and Cash Flow Statements
- **💼 View & Download**: Display statements on-screen or download as PDF/Excel
- **📚 Interactive Tutorial**: Step-by-step guided onboarding for new users
- **🎨 Sample Documents**: Try the app with pre-made examples before uploading real data
- **📸 OpenCV Document Scanning**: Advanced image preprocessing for better OCR accuracy
- **🎯 Mode-Specific Features**: Tailored experience based on your account type
- **💾 Persistent Settings**: Your preferences saved in browser localStorage
- **🔄 Easy Mode Switching**: Change between Personal and Business modes anytime

### 🤖 Advanced AI Features (Powered by Claude 3.5 Sonnet)
- **💡 Smart Financial Insights**: Personalized recommendations and spending analysis
- **🔍 Anomaly Detection**: Real-time fraud prevention and duplicate transaction detection
- **💰 Tax Deduction Finder**: Automatically identify deductible expenses
- **📈 Spending Forecast**: Predict future expenses with AI-powered analytics
- **🎯 Superior Accuracy**: Claude AI for enterprise-grade financial intelligence

## Tech Stack

### Backend
- **FastAPI**: High-performance Python API
- **Claude 3.5 Sonnet**: Advanced financial analysis and insights
- **OpenAI GPT-4**: Document understanding and categorization
- **Tesseract OCR**: Text extraction from images
- **OpenCV**: Computer vision for document preprocessing
- **SQLite/PostgreSQL**: Data storage
- **Pandas**: Financial data processing

### Frontend
- **React + Vite**: Modern, fast web framework
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Recharts**: Financial data visualization
- **Lucide Icons**: Modern icon set

## Project Structure

```
ai_accountant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Database models
│   │   ├── services/
│   │   │   ├── ocr_service.py   # OCR processing
│   │   │   ├── ai_service.py    # AI/LLM integration
│   │   │   └── accounting.py    # Accounting logic
│   │   └── routers/
│   │       ├── upload.py        # File upload endpoints
│   │       └── reports.py       # Reporting endpoints
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key (optional, for AI features)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Usage

### First Time Setup
1. **Choose Your Mode**: Select Personal (👤) or Business (🏢) account type
2. **Complete Tutorial**: Follow the interactive 5-step guide (or skip if you prefer)
3. **Try Samples**: Click "Samples" to explore with pre-made documents
4. **Start Uploading**: Begin with your real financial documents

### Daily Workflow
1. **Upload Documents**: Drag and drop receipts, invoices, or bank statements
2. **AI Processing**: The system automatically extracts:
   - Date, amount, vendor
   - Category (meals, travel, office supplies, etc.)
   - Tax-relevant information
3. **Review & Edit**: Click any transaction to view details and make corrections
4. **Generate Reports**: View dashboards, export to CSV/Excel, or generate tax reports

### Tips & Tricks
- 🎓 Click "Tutorial" button anytime to restart the guided tour
- 🎨 Use "Samples" to test features without real data
- ⚙️ Switch modes via Settings if your needs change
- 💾 Export regularly to backup your financial data

## API Endpoints

- `POST /api/upload` - Upload document
- `GET /api/transactions` - List all transactions
- `GET /api/reports/summary` - Financial summary
- `GET /api/reports/category` - Category breakdown
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./accounting.db
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

## Development Roadmap

- [x] Project setup
- [ ] Document upload and storage
- [ ] OCR integration
- [ ] AI-powered data extraction
- [ ] Transaction management
- [ ] Dashboard and reporting
- [ ] Export functionality
- [ ] Multi-user support
- [ ] Bank account integration
- [ ] Tax report generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.