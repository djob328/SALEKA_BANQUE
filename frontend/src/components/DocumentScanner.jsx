import { useState, useRef, useEffect } from 'react'
import { Camera, X, Check, AlertCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'

const DocumentScanner = ({ onScanComplete, onClose, documentType = 'cni_recto', enableOCR = true }) => {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [documentDetected, setDocumentDetected] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const documentLabels = {
    cni_recto: 'CNI Recto',
    cni_verso: 'CNI Verso',
    passeport: 'Passeport',
    justificatif_domicile: 'Justificatif de domicile'
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsScanning(true)
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const detectDocument = () => {
    // Simulation de détection de document
    // Dans une implémentation réelle, on utiliserait OpenCV.js ici
    setDocumentDetected(true)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    stopCamera()
    setProcessing(true)

    // Simuler l'OCR et l'extraction de données
    setTimeout(() => {
      extractDataFromImage(imageData)
    }, 2000)
  }

  const extractDataFromImage = async (imageData) => {
    try {
      // Si l'OCR n'est pas activé ou si ce n'est pas le recto de la CNI, retourner juste l'image
      if (!enableOCR || documentType !== 'cni_recto') {
        setProcessing(false)
        onScanComplete(null, imageData)
        return
      }

      // Convertir base64 en blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      const formData = new FormData()
      formData.append('image', blob, 'cni.jpg')

      // Envoyer l'image au backend pour l'extraction OCR
      const ocrResponse = await axios.post('/api/kyc/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setOcrProgress(progress)
        }
      })

      if (ocrResponse.data.success) {
        const extractedData = {
          last_name: ocrResponse.data.data.last_name || '',
          first_name: ocrResponse.data.data.first_name || '',
          date_of_birth: ocrResponse.data.data.date_of_birth || '',
          sex: ocrResponse.data.data.sex || '',
          nationality: ocrResponse.data.data.nationality || 'Cameroun',
          cni_number: ocrResponse.data.data.cni_number || ''
        }

        setProcessing(false)
        onScanComplete(extractedData, imageData)
      } else {
        throw new Error('OCR extraction failed')
      }
    } catch (err) {
      console.error('OCR Error:', err)
      setError('Erreur lors de l\'extraction des données. Veuillez réessayer.')
      setProcessing(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setDocumentDetected(false)
    startCamera()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Camera className="h-6 w-6 mr-2" />
                Scanner {documentLabels[documentType] || 'Document'}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                {documentType === 'selfie' 
                  ? 'Placez votre visage dans le cadre' 
                  : 'Placez votre document dans le cadre'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {!capturedImage ? (
            <div className="relative">
              {/* Video Container */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[3/2]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => detectDocument()}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Document Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`border-4 rounded-lg transition-all duration-300 ${
                    documentDetected 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/50 border-dashed animate-pulse'
                  }`}
                  style={{
                    width: '70%',
                    height: '60%'
                  }}>
                    {documentDetected && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Document détecté
                      </div>
                    )}
                  </div>
                </div>

                {/* Corner Markers */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  {documentDetected 
                    ? 'Document détecté ! Cliquez sur Capturer pour prendre la photo'
                    : 'Placez votre CNI dans le cadre...'}
                </p>
              </div>

              {/* Capture Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={captureImage}
                  disabled={!documentDetected || !isScanning}
                  className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center ${
                    documentDetected && isScanning
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capturer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Captured Image Preview */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={capturedImage}
                  alt="CNI capturée"
                  className="w-full h-auto"
                />
                {processing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                      <RefreshCw className="h-12 w-12 mx-auto mb-3 animate-spin" />
                      <p className="font-semibold mb-2">Extraction des données en cours...</p>
                      {ocrProgress > 0 && (
                        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-sm text-blue-100">
                        {ocrProgress > 0 ? `${ocrProgress}%` : 'Analyse de l\'image...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!processing && (
                <div className="flex gap-4">
                  <button
                    onClick={retakePhoto}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Recommencer
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Confirmer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentScanner
