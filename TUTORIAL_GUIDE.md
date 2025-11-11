# 📚 Tutorial & Sample Files Guide

## Interactive Tutorial System

The AI Accountant now includes a comprehensive onboarding experience with:

### 🎯 Mode Selection

When you first open the app, you'll choose between two account types:

#### **Personal Mode** 👤
Perfect for:
- Individual expense tracking
- Freelancers and side hustles
- Personal tax preparation
- Simple financial management

Features:
- Personal expense tracking
- Receipt management
- Tax preparation support
- Simple reporting

#### **Business Mode** 🏢
Designed for:
- Companies and startups
- Teams managing business expenses
- Department-level tracking
- Advanced financial reporting

Features:
- Bulk document processing
- Department categorization
- Advanced reporting
- Export for accounting software

### 📖 Interactive Tutorial

After selecting your mode, you'll be guided through a 5-step tutorial:

1. **Welcome** - Introduction to AI Accountant
2. **Upload Documents** - Learn how to upload receipts and invoices
3. **Review Transactions** - Understand automatic categorization
4. **Export Data** - Learn to export financial reports
5. **Get Started** - Begin using the app

**Tutorial Features:**
- Progress bar showing your position
- Previous/Next navigation
- Skip option at any time
- Mode-specific content (Personal vs Business)
- Stored in localStorage (won't show again after completion)

### 🎨 Sample Documents

Click the "Samples" button in the header to explore pre-made examples:

#### Personal Mode Samples:
- 🍽️ Restaurant Receipt ($45.67)
- ⛽ Gas Station Receipt ($52.30)
- 📎 Office Supplies Invoice ($127.89)
- ⚡ Utility Bill ($89.45)

#### Business Mode Samples:
- 🍽️ Client Lunch Receipt ($156.78)
- ✈️ Conference Travel ($1,245.00)
- 📎 Office Equipment ($3,567.89)
- 💻 Software Subscription ($2,400.00)
- 🎬 Team Building Event ($890.50)
- 🏥 Health Insurance ($5,678.90)

**How Samples Work:**
1. Click "Samples" button in header
2. Browse available sample documents
3. Click any sample to add it to your transactions
4. See how AI automatically extracts information
5. Perfect for testing without uploading real documents

### 🔄 Restart Tutorial

You can restart the tutorial anytime by:
1. Clicking the "Tutorial" button (question mark icon) in the header
2. Following the guided steps again
3. Learning new features or refreshing your knowledge

### ⚙️ Change Account Type

Switch between Personal and Business modes:
1. Click the Settings icon in the header
2. Confirm you want to change modes
3. Your data is preserved
4. Tutorial can be replayed for the new mode

## User Interface Enhancements

### Header Buttons

- **Samples** (purple) - Try sample documents
- **Tutorial** (blue) - Restart the interactive tutorial
- **Settings** (gray) - Change account type
- **Export CSV** (green) - Download your financial data

### Mode Indicator

The header shows your current mode:
- 👤 Personal Mode
- 👥 Business Mode

### Persistent Settings

All preferences are saved in browser localStorage:
- Selected account type
- Tutorial completion status
- User preferences

## Best Practices

### For New Users:
1. Complete the tutorial on first visit
2. Try sample documents to understand the workflow
3. Upload your first real document
4. Review and verify AI-extracted data

### For Returning Users:
- Tutorial button available if you need a refresher
- Sample documents help test new features
- Switch modes as your needs change

### For Testing:
- Use sample documents instead of real data
- Test different categories and amounts
- Explore both Personal and Business modes
- Try the export feature with sample data

## Technical Details

### LocalStorage Keys:
- `userMode` - Stores selected mode (individual/company)
- `tutorialCompleted` - Tracks tutorial completion

### Sample Data Structure:
```javascript
{
  name: "Document Name",
  description: "Description",
  type: "receipt/invoice/bill",
  category: "meals/travel/etc",
  amount: "$XX.XX",
  color: "visual theme color"
}
```

### Tutorial Steps:
- Mode-specific content
- 5 steps per mode
- Progress tracking
- Skip/Complete options

## Accessibility

- Keyboard navigation supported
- Clear visual indicators
- Descriptive button labels
- Tooltips on hover
- Screen reader friendly

## Future Enhancements

Planned features:
- Video tutorials
- More sample documents
- Custom categories
- Multi-user support
- Team collaboration (Business mode)
- Advanced filtering
- Budget tracking
- Recurring transactions
