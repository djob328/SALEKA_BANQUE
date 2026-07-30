import { useState, useRef, useEffect } from 'react'
import { PenTool, X, RotateCcw, Check } from 'lucide-react'

const SignaturePad = ({ onSignatureChange, existingSignature = null }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!existingSignature)
  const [signatureData, setSignatureData] = useState(existingSignature)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Si une signature existe déjà, la dessiner
    if (existingSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = existingSignature
    }

    // Attacher les event listeners touch avec passive: false
    const handleTouchStart = (e) => {
      e.preventDefault()
      startDrawing(e)
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
      draw(e)
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [existingSignature])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const { x, y } = getCoordinates(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveSignature()
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    setSignatureData(dataUrl)
    setHasSignature(true)
    onSignatureChange(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <PenTool className="h-5 w-5 mr-2 text-primary-600" />
          Signature électronique *
        </h3>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center text-sm text-red-600 hover:text-red-700 transition"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Effacer
          </button>
        )}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-600">
          {hasSignature ? (
            <span className="text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Signature enregistrée
            </span>
          ) : (
            'Signez dans le cadre ci-dessus'
          )}
        </p>
        <p className="text-gray-500">
          Utilisez votre doigt ou la souris pour signer
        </p>
      </div>
    </div>
  )
}

export default SignaturePad
