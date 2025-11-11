import { useState, useEffect } from 'react'
import { Upload, FileText, TrendingUp, DollarSign, PieChart, Download, Sparkles, CheckCircle, XCircle, Eye, Trash2, Calendar, Tag, Building2, Receipt, Zap, BarChart3, ArrowUpRight, ArrowDownRight, HelpCircle, Settings as SettingsIcon, User, Users, LogOut, Camera } from 'lucide-react'
import axios from 'axios'
import './index.css'
import { Tutorial, ModeSelector } from './components/Tutorial'
import { SampleFiles } from './components/SampleFiles'
import { AuthPage } from './components/Auth'
import { OpenCVDemo } from './components/OpenCVDemo'
import { Settings } from './components/Settings'
import { useAuth } from './contexts/AuthContext'

const API_URL = 'http://localhost:8000/api'

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Sparkles

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in z-50`}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{message}</span>
    </div>
  )
}

// Transaction Detail Modal
const TransactionModal = ({ transaction, onClose, onDelete }) => {
  if (!transaction) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Receipt className="h-6 w-6 mr-2 text-indigo-600" />
            Transaction Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <DollarSign className="h-4 w-4 mr-2" />
                Amount
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${transaction.amount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Building2 className="h-4 w-4 mr-2" />
              Vendor
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {transaction.vendor || 'Unknown'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Tag className="h-4 w-4 mr-2" />
              Category
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 capitalize">
              {transaction.category || 'other'}
            </span>
          </div>

          {transaction.description && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </div>
              <div className="text-gray-700">
                {transaction.description}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {
              onDelete(transaction.id)
              onClose()
            }}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center justify-center space-x-2 font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Transaction</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [notification, setNotification] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [userMode, setUserMode] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showSamples, setShowSamples] = useState(false)
  const [showOpenCVDemo, setShowOpenCVDemo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Set user mode from authenticated user
  useEffect(() => {
    if (user) {
      setUserMode(user.account_type || 'individual')
      // Show tutorial for new users
      if (!localStorage.getItem(`tutorialCompleted_${user.id}`)) {
        setShowTutorial(true)
      }
    }
  }, [user])

  useEffect(() => {
    fetchTransactions()
    fetchSummary()
    fetchCategories()
  }, [])

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/summary`)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/category`)
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      showNotification('✨ Document processed successfully!', 'success')
      setSelectedFile(null)
      fetchTransactions()
      fetchSummary()
      fetchCategories()
    } catch (error) {
      showNotification('❌ Error: ' + (error.response?.data?.detail || error.message), 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`)
      showNotification('Transaction deleted', 'success')
      fetchTransactions()
      fetchSummary()
      fetchCategories()
    } catch (error) {
      showNotification('Error deleting transaction', 'error')
    }
  }

  const handleExport = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        showNotification('Please login to export data', 'error')
        return
      }

      // Check if there are transactions to export
      if (!transactions || transactions.length === 0) {
        showNotification('No transactions to export. Upload some documents first!', 'error')
        return
      }

      const response = await axios.get(`${API_URL}/reports/export`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // Check if response is actually a blob (not an error)
      if (response.data.type === 'application/json') {
        // Error response disguised as blob
        const text = await response.data.text()
        const error = JSON.parse(text)
        throw new Error(error.detail || 'Export failed')
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      showNotification('✅ Data exported successfully!', 'success')
    } catch (error) {
      console.error('Export error:', error)
      let errorMessage = 'Error exporting data'
      
      if (error.response) {
        // Try to read error from blob
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text()
            const errorData = JSON.parse(text)
            errorMessage = errorData.detail || errorMessage
          } catch (e) {
            errorMessage = error.response.statusText || errorMessage
          }
        } else {
          errorMessage = error.response.data?.detail || error.response.statusText || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showNotification(errorMessage, 'error')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      meals: 'bg-orange-100 text-orange-800 border-orange-200',
      travel: 'bg-blue-100 text-blue-800 border-blue-200',
      office_supplies: 'bg-purple-100 text-purple-800 border-purple-200',
      utilities: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      entertainment: 'bg-pink-100 text-pink-800 border-pink-200',
      healthcare: 'bg-green-100 text-green-800 border-green-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category] || colors.other
  }

  const getCategoryIcon = (category) => {
    const icons = {
      meals: '🍽️',
      travel: '✈️',
      office_supplies: '📎',
      utilities: '⚡',
      entertainment: '🎬',
      healthcare: '🏥',
      other: '📦'
    }
    return icons[category] || icons.other
  }

  const handleModeSelect = (mode) => {
    setUserMode(mode)
    localStorage.setItem('userMode', mode)
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    if (user) {
      localStorage.setItem(`tutorialCompleted_${user.id}`, 'true')
    }
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    if (user) {
      localStorage.setItem(`tutorialCompleted_${user.id}`, 'true')
    }
  }

  const handleUseSample = (sample) => {
    // Simulate adding a sample transaction
    const sampleTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      amount: parseFloat(sample.amount.replace(/[$,]/g, '')),
      vendor: sample.name,
      category: sample.category,
      description: sample.description,
      created_at: new Date().toISOString()
    }
    
    setTransactions(prev => [sampleTransaction, ...prev])
    showNotification(`✨ Sample "${sample.name}" added! This is how real documents are processed.`, 'success')
    
    // Update summary
    fetchSummary()
    fetchCategories()
  }

  const handleRestartTutorial = () => {
    setTutorialStep(0)
    setShowTutorial(true)
    if (user) {
      localStorage.removeItem(`tutorialCompleted_${user.id}`)
    }
  }

  const handleUpdateMode = async (newMode, companyName) => {
    try {
      // Update user via API
      const response = await axios.put(
        `${API_URL}/auth/me`,
        {
          account_type: newMode,
          company_name: newMode === 'company' ? companyName : null
        }
      )
      
      // Update local state
      const updatedUser = response.data
      updateUser(updatedUser)
      setUserMode(newMode)
      
      // Show success notification
      showNotification('Account settings updated successfully!', 'success')
      
      // Refresh transactions to apply new mode
      fetchTransactions()
    } catch (error) {
      console.error('Error updating account:', error)
      showNotification('Failed to update account settings', 'error')
      throw error
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showTutorial && (
        <Tutorial
          mode={userMode}
          step={tutorialStep}
          onNext={() => setTutorialStep(prev => prev + 1)}
          onPrev={() => setTutorialStep(prev => prev - 1)}
          onSkip={handleTutorialSkip}
          onComplete={handleTutorialComplete}
        />
      )}

      {showSamples && (
        <SampleFiles
          mode={userMode}
          onClose={() => setShowSamples(false)}
          onUseSample={handleUseSample}
        />
      )}

      {showOpenCVDemo && (
        <OpenCVDemo onClose={() => setShowOpenCVDemo(false)} />
      )}

      {showSettings && (
        <Settings 
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdateMode={handleUpdateMode}
        />
      )}

      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Accountant
                </h1>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  {userMode === 'individual' ? <User className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                  {user?.full_name || user?.email} • {userMode === 'individual' ? 'Personal' : 'Business'} Mode
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={() => setShowOpenCVDemo(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-xl hover:from-cyan-200 hover:to-blue-200 transition"
                title="See OpenCV demo"
              >
                <Camera className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">CV Demo</span>
              </button>
              <button
                onClick={() => setShowSamples(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition"
                title="Try sample documents"
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Samples</span>
              </button>
              <button
                onClick={handleRestartTutorial}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
                title="Restart tutorial"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Tutorial</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                title="Account settings"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">${summary.total_expenses}</p>
                  <div className="flex items-center mt-2 text-xs text-red-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>Outgoing</span>
                  </div>
                </div>
                <div className="bg-red-100 p-4 rounded-xl">
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">${summary.total_income}</p>
                  <div className="flex items-center mt-2 text-xs text-green-500">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>Incoming</span>
                  </div>
                </div>
                <div className="bg-green-100 p-4 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Net Balance</p>
                  <p className="text-3xl font-bold text-blue-600">${summary.net}</p>
                  <div className="flex items-center mt-2 text-xs text-blue-500">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    <span>Current</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl">
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Transactions</p>
                  <p className="text-3xl font-bold text-indigo-600">{summary.transaction_count}</p>
                  <div className="flex items-center mt-2 text-xs text-indigo-500">
                    <FileText className="h-3 w-3 mr-1" />
                    <span>Total</span>
                  </div>
                </div>
                <div className="bg-indigo-100 p-4 rounded-xl">
                  <Receipt className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl mr-3">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Upload Document
            </span>
          </h2>
          
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 scale-105' 
                : selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                <p className="text-lg font-semibold text-indigo-600">Processing your document...</p>
                <p className="text-sm text-gray-500">AI is extracting and analyzing data</p>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={handleUpload}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  Process Document
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="h-10 w-10 text-indigo-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports: PDF, PNG, JPG, JPEG, GIF, BMP (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <PieChart className="h-6 w-6 mr-3 text-indigo-600" />
              Category Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.category} 
                  className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg transition transform hover:scale-105 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{getCategoryIcon(cat.category)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(cat.category)} border`}>
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize font-medium mb-1">{cat.category.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900">${cat.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Receipt className="h-6 w-6 mr-3 text-indigo-600" />
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-indigo-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</p>
              <p className="text-gray-500">Upload your first document to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50 hover:to-purple-50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl">
                        <Receipt className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{transaction.vendor || 'Unknown Vendor'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(transaction.category)} border`}>
                            {getCategoryIcon(transaction.category)} {transaction.category?.replace('_', ' ') || 'other'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                          </span>
                          {transaction.description && (
                            <span className="truncate max-w-md">{transaction.description.substring(0, 60)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${transaction.amount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTransaction(transaction)
                        }}
                        className="p-2 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <Eye className="h-5 w-5 text-indigo-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <p className="text-sm font-medium">
            AI Accountant - Powered by <span className="text-indigo-600 font-semibold">OpenAI GPT-4</span> & <span className="text-purple-600 font-semibold">Tesseract OCR</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
