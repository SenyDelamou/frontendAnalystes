import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import './CoachingChat.css'

const CoachingChat = ({ request, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const isMentor = user?.id === request.mentorId
  const otherUser = isMentor 
    ? { id: request.studentId, name: request.studentName, avatar: request.studentAvatar }
    : { id: request.mentorId, name: request.mentorName, avatar: request.mentorAvatar }

  useEffect(() => {
    // Load messages from localStorage
    const chatKey = `coaching_chat_${request.id}`
    const storedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]')
    setMessages(storedMessages)

    // Scroll to bottom
    scrollToBottom()
  }, [request.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !audioBlob) return

    const chatKey = `coaching_chat_${request.id}`
    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: newMessage,
      audioUrl: audioUrl,
      type: audioBlob ? 'audio' : 'text',
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages))

    setNewMessage('')
    setAudioBlob(null)
    setAudioUrl(null)

    // Dispatch event for notifications
    window.dispatchEvent(new CustomEvent('coachingMessageSent', { detail: message }))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    audioChunksRef.current = []
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="coaching-chat-overlay" onClick={onClose}>
      <div className="coaching-chat-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar-wrapper">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} className="chat-avatar" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="chat-status-indicator"></span>
            </div>
            <div className="chat-header-text">
              <h3>{otherUser.name}</h3>
              <p className="chat-status">
                <span className="status-dot"></span>
                En ligne
              </p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Fermer le chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Aucun message pour le moment</p>
              <p className="chat-empty-hint">Commencez la conversation !</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === user.id
              return (
                <div key={message.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && (
                    <div className="message-avatar">
                      {message.senderAvatar ? (
                        <img src={message.senderAvatar} alt={message.senderName} />
                      ) : (
                        <span>{message.senderName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    {!isOwn && <div className="message-sender">{message.senderName}</div>}
                    {message.type === 'audio' && message.audioUrl ? (
                      <div className="audio-message">
                        <audio controls src={message.audioUrl} />
                        <span className="audio-duration">🎤 Message vocal</span>
                      </div>
                    ) : (
                      <div className="message-text">{message.content}</div>
                    )}
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {audioBlob && (
          <div className="audio-preview">
            <audio controls src={audioUrl} />
            <button className="btn-cancel-audio" onClick={cancelRecording}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="chat-input-container">
            <button
              type="button"
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              title="Maintenez pour enregistrer"
            >
              {isRecording ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            <input
              type="text"
              className="chat-input"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isRecording}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={(!newMessage.trim() && !audioBlob) || isRecording}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CoachingChat

