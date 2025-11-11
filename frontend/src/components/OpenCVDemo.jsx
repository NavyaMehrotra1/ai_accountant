import { useState } from 'react'
import { X, Camera, Sparkles, ArrowRight, CheckCircle, Zap, Eye } from 'lucide-react'

const demoSteps = [
  {
    id: 1,
    title: "Original Receipt",
    description: "Clean, straight receipt - our baseline",
    image: "http://localhost:8000/demo/01_original.jpg",
    color: "blue"
  },
  {
    id: 2,
    title: "Angled Photo",
    description: "Tilted 25° - typical phone photo",
    image: "http://localhost:8000/demo/02_angled_photo.jpg",
    color: "purple"
  },
  {
    id: 3,
    title: "With Shadow",
    description: "Poor lighting conditions simulated",
    image: "http://localhost:8000/demo/03_with_shadow.jpg",
    color: "orange"
  },
  {
    id: 4,
    title: "Cluttered Background",
    description: "Real-world photo on desk surface",
    image: "http://localhost:8000/demo/04_cluttered_background.jpg",
    color: "red"
  },
  {
    id: 5,
    title: "Edge Detection",
    description: "AI identifies document boundaries",
    image: "http://localhost:8000/demo/05_edge_detection.jpg",
    color: "indigo"
  },
  {
    id: 6,
    title: "Perspective Corrected",
    description: "Document straightened automatically",
    image: "http://localhost:8000/demo/06_scanned_corrected.jpg",
    color: "green"
  },
  {
    id: 7,
    title: "Enhanced & Ready",
    description: "Optimized for OCR text extraction",
    image: "http://localhost:8000/demo/07_enhanced_final.jpg",
    color: "emerald"
  }
]

export const OpenCVDemo = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showComparison, setShowComparison] = useState(false)

  const currentDemo = demoSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">OpenCV Document Scanning Demo</h2>
                <p className="text-indigo-100 text-sm">See how AI processes your photos</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showComparison ? (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Step {currentStep + 1} of {demoSteps.length}
                  </span>
                  <button
                    onClick={() => setShowComparison(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Before/After</span>
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex justify-center space-x-2 mb-6">
                {demoSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentStep
                        ? 'bg-indigo-600 scale-125'
                        : idx < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    title={step.title}
                  />
                ))}
              </div>

              {/* Current Step Display */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${currentDemo.color}-100 text-${currentDemo.color}-700 font-semibold mb-4`}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Step {currentStep + 1}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentDemo.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {currentDemo.description}
                  </p>
                </div>

                {/* Image Display */}
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={currentDemo.image} 
                      alt={currentDemo.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-center text-gray-500 p-8">
                      <div>
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Demo Image: {currentDemo.title}</p>
                        <p className="text-xs mt-2">Loading from backend...</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Info */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  {currentStep === 0 && (
                    <>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Quality</div>
                        <div className="text-lg font-bold text-green-600">Perfect</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">OCR Accuracy</div>
                        <div className="text-lg font-bold text-green-600">95-99%</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Processing</div>
                        <div className="text-lg font-bold text-blue-600">Baseline</div>
                      </div>
                    </>
                  )}
                  {currentStep >= 1 && currentStep <= 3 && (
                    <>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Quality</div>
                        <div className="text-lg font-bold text-orange-600">Poor</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">OCR Accuracy</div>
                        <div className="text-lg font-bold text-red-600">30-40%</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Issue</div>
                        <div className="text-lg font-bold text-red-600">
                          {currentStep === 1 ? 'Angled' : currentStep === 2 ? 'Shadow' : 'Cluttered'}
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep >= 4 && (
                    <>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Quality</div>
                        <div className="text-lg font-bold text-green-600">Excellent</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">OCR Accuracy</div>
                        <div className="text-lg font-bold text-green-600">90-95%</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Processing</div>
                        <div className="text-lg font-bold text-green-600">
                          {currentStep === 4 ? 'Detected' : currentStep === 5 ? 'Corrected' : 'Enhanced'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Key Points */}
              <div className="bg-indigo-50 rounded-xl p-6 mb-6 border border-indigo-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                  What's Happening Here
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {currentStep === 0 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Perfect baseline - clean, straight, well-lit receipt</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>This is what professional scanners produce</span>
                      </li>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Receipt tilted 25° - typical phone photo angle</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Without OpenCV, OCR accuracy drops significantly</span>
                      </li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Shadow gradient simulates poor lighting conditions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Common when photographing on desk or table</span>
                      </li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Document on textured background - real-world scenario</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>This is what you typically upload - and it works!</span>
                      </li>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Canny edge detection identifies document boundaries</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Finds largest 4-sided contour automatically</span>
                      </li>
                    </>
                  )}
                  {currentStep === 5 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>4-point perspective transform applied</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Document straightened to perfect 0° angle</span>
                      </li>
                    </>
                  )}
                  {currentStep === 6 && (
                    <>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Adaptive thresholding, denoising, and sharpening applied</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Optimized for maximum OCR accuracy (90-95%!)</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Navigation */}
              <div className="flex space-x-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    ← Previous
                  </button>
                )}
                {currentStep < demoSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-medium flex items-center justify-center space-x-2"
                  >
                    <span>View Before/After</span>
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Comparison View */
            <div>
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Before & After Comparison
                </h3>
                <p className="text-lg text-gray-600">
                  See the dramatic improvement OpenCV provides
                </p>
              </div>

              {/* Comparison Image */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="http://localhost:8000/demo/08_comparison.jpg" 
                      alt="Before and After Comparison"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-center text-gray-500 p-8">
                      <div>
                        <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Before/After Comparison</p>
                        <p className="text-xs mt-2">Loading from backend...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h4 className="text-xl font-bold text-red-900 mb-4">❌ BEFORE (Without OpenCV)</h4>
                  <ul className="space-y-2 text-sm text-red-800">
                    <li>• Angled/tilted document</li>
                    <li>• Shadows and poor lighting</li>
                    <li>• Cluttered background</li>
                    <li>• <strong>OCR Accuracy: 30-40%</strong></li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <h4 className="text-xl font-bold text-green-900 mb-4">✅ AFTER (With OpenCV)</h4>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Perfectly straightened</li>
                    <li>• Shadows removed</li>
                    <li>• Clean white background</li>
                    <li>• <strong>OCR Accuracy: 90-95%</strong></li>
                  </ul>
                </div>
              </div>

              {/* Improvement Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 text-center mb-6">
                <div className="text-5xl font-bold mb-2">+60%</div>
                <div className="text-xl">Accuracy Improvement</div>
                <div className="text-sm opacity-90 mt-2">With OpenCV document scanning</div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowComparison(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Back to Steps
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium"
                >
                  Close Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
