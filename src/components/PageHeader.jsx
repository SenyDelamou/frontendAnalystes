import { useState, useEffect } from 'react'
import './PageHeader.css'

const PageHeader = ({ title, subtitle, imageUrl, imageUrls }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80'
  
  // Si imageUrls est fourni, utiliser le carrousel, sinon utiliser imageUrl
  const images = imageUrls && imageUrls.length > 0 
    ? imageUrls 
    : imageUrl 
      ? [imageUrl] 
      : [defaultImage]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change d'image toutes les 5 secondes

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="page-header">
      <div className="page-header-slider">
        {images.map((url, index) => (
          <div
            key={index}
            className={`page-header-slide ${index === currentImageIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(26, 39, 68, 0.75) 100%), url(${url})`
            }}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="page-header-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`page-header-indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Image ${index + 1}`}
            />
          ))}
        </div>
      )}
      <div className="page-header-content">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

export default PageHeader

