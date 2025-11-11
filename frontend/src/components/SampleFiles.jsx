import { X, Download, FileText, Receipt, FileSpreadsheet, Image, Sparkles } from 'lucide-react'

const sampleFiles = {
  individual: [
    {
      name: "Restaurant Receipt",
      description: "Sample receipt from a restaurant meal",
      type: "receipt",
      icon: Receipt,
      category: "meals",
      amount: "$45.67",
      color: "orange"
    },
    {
      name: "Gas Station Receipt",
      description: "Fuel purchase receipt for travel expenses",
      type: "receipt",
      icon: Receipt,
      category: "travel",
      amount: "$52.30",
      color: "blue"
    },
    {
      name: "Office Supplies Invoice",
      description: "Invoice for home office supplies",
      type: "invoice",
      icon: FileText,
      category: "office_supplies",
      amount: "$127.89",
      color: "purple"
    },
    {
      name: "Utility Bill",
      description: "Monthly electricity bill",
      type: "bill",
      icon: FileSpreadsheet,
      category: "utilities",
      amount: "$89.45",
      color: "yellow"
    }
  ],
  company: [
    {
      name: "Client Lunch Receipt",
      description: "Business meal with client",
      type: "receipt",
      icon: Receipt,
      category: "meals",
      amount: "$156.78",
      color: "orange"
    },
    {
      name: "Conference Travel",
      description: "Flight and hotel for business conference",
      type: "invoice",
      icon: FileText,
      category: "travel",
      amount: "$1,245.00",
      color: "blue"
    },
    {
      name: "Office Equipment",
      description: "Bulk purchase of office supplies",
      type: "invoice",
      icon: FileSpreadsheet,
      category: "office_supplies",
      amount: "$3,567.89",
      color: "purple"
    },
    {
      name: "Software Subscription",
      description: "Annual software license renewal",
      type: "invoice",
      icon: FileText,
      category: "utilities",
      amount: "$2,400.00",
      color: "yellow"
    },
    {
      name: "Team Building Event",
      description: "Company team building activity",
      type: "receipt",
      icon: Receipt,
      category: "entertainment",
      amount: "$890.50",
      color: "pink"
    },
    {
      name: "Health Insurance",
      description: "Employee health insurance premium",
      type: "invoice",
      icon: FileSpreadsheet,
      category: "healthcare",
      amount: "$5,678.90",
      color: "green"
    }
  ]
}

const colorClasses = {
  orange: 'from-orange-100 to-orange-200 border-orange-300',
  blue: 'from-blue-100 to-blue-200 border-blue-300',
  purple: 'from-purple-100 to-purple-200 border-purple-300',
  yellow: 'from-yellow-100 to-yellow-200 border-yellow-300',
  pink: 'from-pink-100 to-pink-200 border-pink-300',
  green: 'from-green-100 to-green-200 border-green-300'
}

export const SampleFiles = ({ mode, onClose, onUseSample }) => {
  const samples = sampleFiles[mode] || sampleFiles.individual

  const handleUseSample = (sample) => {
    onUseSample(sample)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Sample Documents</h2>
                <p className="text-indigo-100 text-sm">Try these examples to see how AI Accountant works</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-4">
            {samples.map((sample, index) => {
              const Icon = sample.icon
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${colorClasses[sample.color]} border-2 rounded-xl p-5 hover:shadow-lg transition cursor-pointer transform hover:scale-105`}
                  onClick={() => handleUseSample(sample)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">{sample.amount}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{sample.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {sample.type}
                    </span>
                    <span className="text-xs bg-white px-3 py-1 rounded-full font-medium text-gray-700 capitalize">
                      {sample.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">How it works</h4>
                <p className="text-sm text-gray-600">
                  Click any sample to see how AI Accountant automatically extracts information like date, amount, vendor, and category. 
                  In the real app, you'll upload actual documents and get the same automated processing!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
