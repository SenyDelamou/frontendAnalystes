import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import './VideoCall.css'

const VideoCall = ({ request, onClose, otherUser }) => {
  const { user } = useAuth()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const callTimerRef = useRef(null)

  // Configuration WebRTC simplifiée (pour démo - en production, utiliser un serveur de signalisation)
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      endCall()
    }
  }, [])

  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isCallActive])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startCall = async () => {
    try {
      setIsConnecting(true)
      
      // Obtenir le stream local (caméra + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Créer la connexion peer-to-peer
      peerConnectionRef.current = new RTCPeerConnection(configuration)

      // Ajouter les tracks locaux
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream)
      })

      // Gérer les tracks distants
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Gérer les candidats ICE
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // En production, envoyer le candidat via un serveur de signalisation
          console.log('ICE candidate:', event.candidate)
        }
      }

      // Créer l'offre
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)

      // En production, envoyer l'offre via un serveur de signalisation
      // Pour la démo, on simule une connexion réussie
      setTimeout(() => {
        setIsConnecting(false)
        setIsCallActive(true)
        setCallDuration(0)
      }, 1500)

    } catch (error) {
      console.error('Error starting call:', error)
      alert('Impossible d\'accéder à la caméra ou au microphone. Vérifiez les permissions.')
      setIsConnecting(false)
      endCall()
    }
  }

  const endCall = () => {
    // Arrêter tous les tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // Fermer la connexion peer
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Réinitialiser les vidéos
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    setIsCallActive(false)
    setIsConnecting(false)
    setCallDuration(0)
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const handleClose = () => {
    endCall()
    onClose()
  }

  return (
    <div className="video-call-overlay" onClick={handleClose}>
      <div className="video-call-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="video-call-header">
          <div className="video-call-user-info">
            <div className="video-call-avatar">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} />
              ) : (
                <span>{otherUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="video-call-header-text">
              <h3>{otherUser.name}</h3>
              {isCallActive && (
                <p className="call-duration">{formatDuration(callDuration)}</p>
              )}
              {isConnecting && (
                <p className="call-status">Connexion en cours...</p>
              )}
            </div>
          </div>
          <button className="video-call-close-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Video Area */}
        <div className="video-call-content">
          {!isCallActive && !isConnecting ? (
            <div className="video-call-preview">
              <div className="video-call-preview-content">
                <div className="video-call-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Appel vidéo avec {otherUser.name}</h3>
                <p>Cliquez sur "Démarrer l'appel" pour commencer</p>
                <button className="btn-start-call" onClick={startCall}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Démarrer l'appel
                </button>
              </div>
            </div>
          ) : (
            <div className="video-call-videos">
              {/* Remote Video (Principal) */}
              <div className="remote-video-container">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
                {!remoteVideoRef.current?.srcObject && (
                  <div className="video-placeholder">
                    <div className="video-placeholder-avatar">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} />
                      ) : (
                        <span>{otherUser.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <p>{otherUser.name}</p>
                    <p className="video-placeholder-status">En attente de connexion...</p>
                  </div>
                )}
              </div>

              {/* Local Video (Petit) */}
              <div className="local-video-container">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
                {!isVideoEnabled && (
                  <div className="video-disabled-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1l22 22M23 1L1 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 5.66L8 12v4h4l-1.66-1.66M22 12h-4l-4-4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {isCallActive && (
          <div className="video-call-controls">
            <button
              className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Couper le micro' : 'Activer le micro'}
            >
              {isAudioEnabled ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 17l-4-4m0-4l-4-4m-4-4l-4 4m16 16l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <button
              className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra'}
            >
              {isVideoEnabled ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 17l-4-4m0-4l-4-4m-4-4l-4 4m16 16l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <button
              className="control-btn end-call"
              onClick={endCall}
              title="Terminer l'appel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCall

