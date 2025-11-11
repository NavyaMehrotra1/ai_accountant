import { useState } from 'react'
import { X, User, Users, Building2, Mail, Calendar, Save, Check } from 'lucide-react'

export const Settings = ({ user, onClose, onUpdateMode }) => {
  const [selectedMode, setSelectedMode] = useState(user?.account_type || 'individual')
  const [companyName, setCompanyName] = useState(user?.company_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Call the update function passed from parent
      await onUpdateMode(selectedMode, companyName)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = selectedMode !== user?.account_type || 
                     (selectedMode === 'company' && companyName !== user?.company_name)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <p className="text-indigo-100 text-sm">Manage your account preferences</p>
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
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="font-medium">Member since:</span>
                <span className="ml-2">{new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Account Type Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Account Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Personal Mode */}
              <button
                onClick={() => setSelectedMode('individual')}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  selectedMode === 'individual'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  {selectedMode === 'individual' && (
                    <Check className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Personal</h4>
                <p className="text-sm text-gray-600">
                  For individuals and freelancers
                </p>
              </button>

              {/* Business Mode */}
              <button
                onClick={() => setSelectedMode('company')}
                className={`p-4 rounded-xl border-2 transition text-left relative ${
                  selectedMode === 'company'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  FULL STATEMENTS
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  {selectedMode === 'company' && (
                    <Check className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Business</h4>
                <p className="text-sm text-gray-600">
                  For companies and teams
                </p>
              </button>
            </div>
          </div>

          {/* Company Name (if business mode) */}
          {selectedMode === 'company' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-2" />
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          )}

          {/* Feature Comparison */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">
              {selectedMode === 'individual' ? 'Personal Features' : 'Business Features'}
            </h4>
            <ul className="space-y-2 text-sm">
              {selectedMode === 'individual' ? (
                <>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Personal expense tracking
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Receipt management
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Tax preparation support
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    CSV export
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                    Bulk document processing
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                    Department categorization
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span className="font-semibold">Income Statement generation</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span className="font-semibold">Balance Sheet & Cash Flow</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                    <span className="font-semibold">Download as PDF/Excel</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Save Button */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving || saved}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center space-x-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : hasChanges && !saving
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Saved!</span>
                </>
              ) : saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
