import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import './Chat.css'

const Chat = () => {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const typingTimeoutRef = useRef(null)

  // Emojis populaires
  const popularEmojis = ['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯', '✨', '🙌', '😊', '😍', '🤔', '👌', '🙏', '💪']

  useEffect(() => {
    // Load messages from localStorage
    const stored = JSON.parse(localStorage.getItem('chatMessages') || '[]')
    if (stored.length === 0) {
      // Initial welcome messages
      const welcomeMessages = [
        {
          id: 1,
          text: 'Bienvenue sur la plateforme Data Analysts Guinée ! 👋',
          sender: 'system',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          text: 'Posez vos questions ou partagez vos expériences avec la communauté.',
          sender: 'system',
          timestamp: new Date().toISOString()
        }
      ]
      setMessages(welcomeMessages)
      localStorage.setItem('chatMessages', JSON.stringify(welcomeMessages))
    } else {
      setMessages(stored)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(() => {
    // Cleanup audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [audioUrl, imagePreview])

  const handleInputChange = (e) => {
    setInputMessage(e.target.value)
    
    // Indicateur "en train d'écrire"
    if (isAuthenticated && user) {
      setIsTyping(true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() && !audioBlob && !selectedImage) return

    if (!isAuthenticated || !user) {
      alert('Vous devez être connecté pour envoyer un message')
      return
    }

    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    const newMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: user.name || 'Utilisateur',
      userId: user.id,
      userAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      type: audioBlob ? 'audio' : selectedImage ? 'image' : 'text',
      imageUrl: imagePreview,
      audioUrl: audioUrl,
      reactions: []
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
    
    // Reset form
    setInputMessage('')
    setAudioBlob(null)
    setAudioUrl(null)
    setSelectedImage(null)
    setImagePreview(null)

    // Simulate a response (in real app, this would be from a server)
    setTimeout(() => {
      const responses = [
        'Merci pour votre message ! La communauté est là pour vous aider.',
        'Excellente question ! N\'hésitez pas à consulter les ressources disponibles.',
        'Bien noté ! D\'autres membres pourront vous répondre bientôt.',
        'Merci de partager cela avec la communauté !',
        'C\'est une excellente contribution ! Continuez ainsi.',
        'Votre message a été bien reçu. La communauté vous remercie !'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const botMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'Modérateur',
        timestamp: new Date().toISOString(),
        type: 'text',
        reactions: []
      }

      const finalMessages = [...updatedMessages, botMessage]
      setMessages(finalMessages)
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages))
    }, 1500)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop grande. Maximum 5MB.')
        return
      }
      setSelectedImage(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const removeImagePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    audioChunksRef.current = []
  }

  const addEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const toggleReaction = (messageId, emoji) => {
    if (!isAuthenticated || !user) return

    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || []
        const userReaction = reactions.find(r => r.userId === user.id && r.emoji === emoji)
        
        if (userReaction) {
          // Remove reaction
          return {
            ...msg,
            reactions: reactions.filter(r => !(r.userId === user.id && r.emoji === emoji))
          }
        } else {
          // Add reaction
          return {
            ...msg,
            reactions: [...reactions, { userId: user.id, emoji, userName: user.name }]
          }
        }
      }
      return msg
    })
    
    setMessages(updatedMessages)
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chat-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chat"
      >
        <span className="chat-icon">💬</span>
        <span className="chat-badge">Chat</span>
        {!isOpen && messages.filter(m => m.userId !== user?.id && m.sender !== 'system').length > 0 && (
          <span className="chat-notification-badge">
            {messages.filter(m => m.userId !== user?.id && m.sender !== 'system').length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-icon-wrapper">
                <span className="chat-icon">💬</span>
                <span className="chat-status-indicator"></span>
              </div>
              <div className="chat-header-text">
                <h3>Chat Communautaire</h3>
                <p className="chat-subtitle">
                  {isTyping ? (
                    <span className="typing-status">
                      <span className="typing-dots">
                        <span></span><span></span><span></span>
                      </span>
                      Quelqu'un écrit...
                    </span>
                  ) : (
                    'Discutez avec la communauté'
                  )}
                </p>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>Aucun message pour le moment</p>
                <p className="chat-empty-hint">Soyez le premier à écrire !</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.sender === 'system' ? 'system' : 
                    message.userId === user?.id ? 'own' : 'other'
                  }`}
                >
                  {message.sender !== 'system' && message.userId !== user?.id && (
                    <div className="message-avatar">
                      {message.userAvatar ? (
                        <img src={message.userAvatar} alt={message.sender} />
                      ) : (
                        message.sender ? message.sender.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    {message.sender !== 'system' && message.sender && (
                      <div className="message-sender">{message.sender}</div>
                    )}
                    {message.type === 'image' && message.imageUrl && (
                      <div className="message-image-container">
                        <img src={message.imageUrl} alt="Message" className="message-image" />
                      </div>
                    )}
                    {message.type === 'audio' && message.audioUrl && (
                      <div className="message-audio-container">
                        <audio controls src={message.audioUrl} className="message-audio" />
                        <span className="audio-label">🎤 Message vocal</span>
                      </div>
                    )}
                    {message.text && (
                      <div className="message-text">{message.text}</div>
                    )}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="message-reactions">
                        {Object.entries(
                          message.reactions.reduce((acc, r) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1
                            return acc
                          }, {})
                        ).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            className={`reaction-btn ${
                              message.reactions.some(r => r.userId === user?.id && r.emoji === emoji) ? 'active' : ''
                            }`}
                            onClick={() => toggleReaction(message.id, emoji)}
                            title={message.reactions
                              .filter(r => r.emoji === emoji)
                              .map(r => r.userName)
                              .join(', ')}
                          >
                            {emoji} {count}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="message-footer">
                      {message.timestamp && (
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                      )}
                      {message.sender !== 'system' && message.userId !== user?.id && (
                        <button
                          className="message-reaction-btn"
                          onClick={() => toggleReaction(message.id, '👍')}
                          title="Ajouter une réaction"
                        >
                          😊
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button className="remove-image-btn" onClick={removeImagePreview}>
                ✕
              </button>
            </div>
          )}

          {audioBlob && audioUrl && (
            <div className="audio-preview-container">
              <audio controls src={audioUrl} className="audio-preview" />
              <button className="remove-audio-btn" onClick={cancelRecording}>
                ✕
              </button>
            </div>
          )}

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <button
                type="button"
                className="chat-emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!isAuthenticated}
                title="Emojis"
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {popularEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-option"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="file-input-hidden"
                id="chat-image-input"
                disabled={!isAuthenticated}
              />
              <label htmlFor="chat-image-input" className="chat-attach-btn" title="Ajouter une image">
                📎
              </label>
              <input
                type="text"
                className="chat-input"
                placeholder={isAuthenticated ? "Tapez votre message..." : "Connectez-vous pour chatter"}
                value={inputMessage}
                onChange={handleInputChange}
                disabled={!isAuthenticated || isRecording}
              />
              <button
                type="button"
                className={`chat-record-btn ${isRecording ? 'recording' : ''}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={!isAuthenticated}
                title="Maintenez pour enregistrer"
              >
                🎤
              </button>
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!isAuthenticated || (!inputMessage.trim() && !audioBlob && !selectedImage)}
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default Chat

