# 🚀 Quick Setup Guide - Claude AI Features

## Prerequisites

- Python 3.8+
- Anthropic API Key
- OpenAI API Key (optional, for fallback)

## Step-by-Step Setup

### 1. Get Your Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-api03-`)

### 2. Configure Environment Variables

Edit your `.env` file in the `backend` directory:

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
OPENAI_API_KEY=sk-your-openai-key-here  # Optional fallback
SECRET_KEY=your-secret-key-here
```

### 3. Install Dependencies

```bash
cd backend
pip install anthropic==0.39.0
```

Or install all dependencies:

```bash
pip install -r requirements.txt
```

### 4. Restart the Backend

```bash
# Kill existing backend if running
pkill -f uvicorn

# Start fresh
python -m uvicorn app.main:app --reload
```

### 5. Test the Features

#### Test AI Insights:
```bash
curl -X GET "http://localhost:8000/api/ai/insights" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Anomaly Detection:
```bash
curl -X GET "http://localhost:8000/api/ai/anomalies" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Tax Deductions:
```bash
curl -X GET "http://localhost:8000/api/ai/tax-deductions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Spending Forecast:
```bash
curl -X GET "http://localhost:8000/api/ai/forecast?months=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 API Endpoints

All endpoints require authentication with Bearer token.

### 1. Smart Financial Insights
```
GET /api/ai/insights
```

Returns personalized insights, recommendations, opportunities, and warnings.

### 2. Anomaly Detection
```
GET /api/ai/anomalies
```

Detects unusual spending patterns, duplicates, and potential fraud.

### 3. Tax Deduction Finder
```
GET /api/ai/tax-deductions
```

Identifies potential tax deductions based on your transactions.

### 4. Spending Forecast
```
GET /api/ai/forecast?months=3
```

Predicts future spending for the specified number of months (1-12).

## 💰 Cost Estimation

### Anthropic Pricing:
- **Claude 3.5 Sonnet**: $3/million input tokens, $15/million output tokens

### Typical Usage:
- Receipt parsing: ~$0.01 per receipt
- Insights generation: ~$0.03 per analysis
- Anomaly detection: ~$0.02 per check
- Tax deductions: ~$0.03 per analysis
- Forecast: ~$0.02 per forecast

**Monthly estimate for 100 transactions:** ~$2-3

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys periodically** (every 90 days recommended)
4. **Monitor usage** in Anthropic console
5. **Set spending limits** to avoid unexpected charges

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not set"
- Check your `.env` file exists in `backend/` directory
- Ensure the key starts with `sk-ant-api03-`
- Restart the backend after adding the key

### "Advanced AI features will be disabled"
- This is just a warning if Claude is not configured
- App will fallback to OpenAI or rule-based parsing
- Add ANTHROPIC_API_KEY to enable advanced features

### "Error generating insights"
- Ensure you have uploaded transactions
- Check API key is valid
- Verify you have API credits remaining
- Check backend logs for detailed error

### High API costs
- Reduce analysis frequency
- Implement caching for repeated queries
- Use OpenAI for simple tasks, Claude for complex analysis

## 📊 Feature Comparison

| Feature | Without Claude | With Claude |
|---------|---------------|-------------|
| Receipt Parsing | Basic | Advanced + line items |
| Insights | None | Personalized recommendations |
| Anomaly Detection | None | Real-time fraud detection |
| Tax Deductions | Manual | Automatic identification |
| Forecasting | None | AI-powered predictions |

## 🎉 What's Next?

Once setup is complete:

1. **Upload transactions** to get data for analysis
2. **Check insights** regularly for recommendations
3. **Monitor anomalies** for fraud prevention
4. **Review tax deductions** before tax season
5. **Use forecasts** for budget planning

## 📚 Documentation

- **Full Feature Guide**: See `CLAUDE_AI_FEATURES.md`
- **API Reference**: Visit `http://localhost:8000/docs`
- **Anthropic Docs**: [docs.anthropic.com](https://docs.anthropic.com)

## 🤝 Support

Having issues? Check:

1. Backend logs: Look for error messages
2. API console: Check usage and limits
3. Environment: Verify all keys are set
4. Dependencies: Ensure anthropic package is installed

## ✅ Verification Checklist

- [ ] Anthropic API key obtained
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Backend restarted
- [ ] Test endpoint returns data
- [ ] No error messages in logs

---

**Ready to go!** Your AI Accountant now has enterprise-grade financial intelligence powered by Claude 3.5 Sonnet! 🚀💰
