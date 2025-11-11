import { X, ArrowRight, ArrowLeft, Check, Sparkles, Upload, PieChart, Download, Users, User, FileText, TrendingUp, DollarSign } from 'lucide-react'

const tutorialSteps = {
  individual: [
    {
      title: "Welcome to AI Accountant! 👋",
      description: "Let's get you started with automated bookkeeping. This quick tutorial will show you how to manage your personal finances effortlessly.",
      icon: Sparkles,
      highlight: null
    },
    {
      title: "Upload Your Documents 📤",
      description: "Simply drag and drop your receipts, invoices, or bank statements. Our AI will automatically extract all the important information like date, amount, and vendor.",
      icon: Upload,
      highlight: "upload"
    },
    {
      title: "Review Your Transactions 📊",
      description: "All your transactions are automatically categorized. Click on any transaction to view details, edit information, or delete entries.",
      icon: PieChart,
      highlight: "transactions"
    },
    {
      title: "Export Your Data 💾",
      description: "Download your financial data as CSV anytime for tax filing, expense reports, or personal records. Click the Export button in the header.",
      icon: Download,
      highlight: "export"
    },
    {
      title: "You're All Set! 🎉",
      description: "Start uploading your documents and let AI handle the rest. Your financial data is stored securely and ready whenever you need it.",
      icon: Check,
      highlight: null
    }
  ],
  company: [
    {
      title: "Welcome to AI Accountant for Business! 🏢",
      description: "Streamline your company's bookkeeping with AI-powered automation. Let's explore the features designed for businesses.",
      icon: Sparkles,
      highlight: null
    },
    {
      title: "Bulk Document Processing 📤",
      description: "Upload multiple invoices, receipts, and expense reports at once. Our AI processes them in parallel for maximum efficiency.",
      icon: Upload,
      highlight: "upload"
    },
    {
      title: "Category Management 📊",
      description: "Track expenses across departments and projects. Categories include office supplies, travel, utilities, and more. All transactions are automatically categorized.",
      icon: PieChart,
      highlight: "categories"
    },
    {
      title: "Professional Financial Statements 📈",
      description: "Automatically generate Income Statements, Balance Sheets, and Cash Flow Statements. View them on-screen or download as PDF/Excel for your accountant or investors.",
      icon: Download,
      highlight: "export"
    },
    {
      title: "Ready for Business! 🚀",
      description: "Your company's financial data is now automated. Upload documents regularly to maintain accurate records and generate reports anytime.",
      icon: Check,
      highlight: null
    }
  ]
}

export const Tutorial = ({ mode, step, onNext, onPrev, onSkip, onComplete }) => {
  const steps = tutorialSteps[mode] || tutorialSteps.individual
  const currentStep = steps[step]
  const Icon = currentStep.icon
  const isLastStep = step === steps.length - 1
  const isFirstStep = step === 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-scale-in">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of {steps.length}
            </span>
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Skip Tutorial
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentStep.title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-3">
          {!isFirstStep && (
            <button
              onClick={onPrev}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition flex items-center justify-center space-x-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          )}
          <button
            onClick={isLastStep ? onComplete : onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center space-x-2 font-medium shadow-lg"
          >
            <span>{isLastStep ? "Get Started" : "Next"}</span>
            {isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export const ModeSelector = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full mx-4">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to AI Accountant
          </h1>
          <p className="text-xl text-gray-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Individual Mode */}
          <button
            onClick={() => onSelect('individual')}
            className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Personal</h3>
            <p className="text-gray-600 mb-4">
              Perfect for individuals managing personal finances, freelancers, and side hustles.
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Personal expense tracking
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Receipt management
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Tax preparation support
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Simple reporting
              </li>
            </ul>
          </button>

          {/* Company Mode */}
          <button
            onClick={() => onSelect('company')}
            className="group bg-white rounded-2xl p-8 border-2 border-purple-300 hover:border-purple-500 hover:shadow-2xl transition transform hover:scale-105 relative overflow-hidden"
          >
            {/* Premium Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              FULL STATEMENTS
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Business</h3>
            <p className="text-gray-600 mb-4">
              Designed for companies, startups, and teams. <span className="font-semibold text-purple-700">Generates full financial statements!</span>
            </p>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Bulk document processing
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Department categorization
              </li>
              <li className="flex items-center">
                <FileText className="h-4 w-4 text-purple-500 mr-2" />
                <span className="font-semibold text-purple-700">Income Statement generation</span>
              </li>
              <li className="flex items-center">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                <span className="font-semibold text-purple-700">Balance Sheet & Cash Flow</span>
              </li>
              <li className="flex items-center">
                <Download className="h-4 w-4 text-purple-500 mr-2" />
                <span className="font-semibold text-purple-700">Download as PDF/Excel</span>
              </li>
            </ul>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          You can change your account type anytime in settings
        </p>
      </div>
    </div>
  )
}
