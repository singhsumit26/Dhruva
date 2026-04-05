import { useEffect, useState } from 'react'
import './Toast.css'

export default function Toast({ message, emoji, visible, onClose }) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setAnimating(true)
      const timer = setTimeout(() => {
        setAnimating(false)
        setTimeout(onClose, 400)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible && !animating) return null

  return (
    <div className={`toast ${animating ? 'toast-in' : 'toast-out'}`}>
      <span className="toast-emoji">{emoji}</span>
     <span className="toast-message" dangerouslySetInnerHTML={{ __html: message }} />
      <button className="toast-close" onClick={() => {
        setAnimating(false)
        setTimeout(onClose, 400)
      }}>×</button>
    </div>
  )
}