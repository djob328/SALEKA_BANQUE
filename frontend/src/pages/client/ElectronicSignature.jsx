import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { PenTool, CheckCircle, XCircle, RotateCcw, Download } from 'lucide-react'

const ElectronicSignature = () => {
  const [signed, setSigned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const sigCanvas = useRef({})

  const clear = () => {
    sigCanvas.current.clear()
    setSigned(false)
  }

  const handleSave = async () => {
    if (!sigCanvas.current.isEmpty()) {
      setLoading(true)
      setError('')

      try {
        const signatureData = sigCanvas.current.toDataURL()
        
        // API call to save signature
        // await axios.post('/api/signatures', { signature_data: signatureData })
        
        setSuccess(true)
        setSigned(true)
      } catch (error) {
        setError('Erreur lors de la sauvegarde de la signature')
      } finally {
        setLoading(false)
      }
    } else {
      setError('Veuillez signer avant de sauvegarder')
    }
  }

  const handleDownload = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'signature.png'
      link.href = dataURL
      link.click()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Signature électronique</h1>
        <p className="text-gray-600">Signez vos documents bancaires de manière sécurisée</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Signature enregistrée avec succès !</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <PenTool className="h-5 w-5 mr-2 text-primary-600" />
            Zone de signature
          </h2>
          <p className="text-sm text-gray-600">
            Signez dans le cadre ci-dessous en utilisant votre souris ou votre doigt
          </p>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white mb-4">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-64 cursor-crosshair'
            }}
            onEnd={() => setSigned(!sigCanvas.current.isEmpty())}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={clear}
            className="btn-secondary flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Effacer
          </button>
          
          <button
            onClick={handleDownload}
            disabled={!signed}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !signed}
            className="btn-primary flex items-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder la signature'}
          </button>
        </div>
      </div>

      <div className="mt-6 card">
        <h3 className="font-semibold mb-4">Documents à signer</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
              <span>Conditions générales de la banque</span>
            </div>
            <span className="text-sm text-gray-500">PDF</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
              <span>Contrat d'ouverture de compte</span>
            </div>
            <span className="text-sm text-gray-500">PDF</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
              <span>Autorisation de prélèvement</span>
            </div>
            <span className="text-sm text-gray-500">PDF</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Informations légales</h3>
        <p className="text-sm text-blue-800">
          Votre signature électronique a la même valeur juridique qu'une signature manuscrite 
          conformément aux lois en vigueur. En signant, vous reconnaissez avoir lu et accepté 
          les conditions générales de la banque.
        </p>
      </div>
    </div>
  )
}

export default ElectronicSignature
