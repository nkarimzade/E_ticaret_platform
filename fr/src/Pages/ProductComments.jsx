import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'

const ProductComments = () => {
  const { productId } = useParams()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true)
        const commentsData = await api.getAllComments(productId)
        setComments(commentsData)
      } catch (error) {
        console.error('Yorumlar yüklenemedi:', error)
        setError('Yorumlar yüklenirken hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadComments()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#6b7280' }}>Yorumlar yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#ef4444' }}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Bütün rəylər</h2>
            <Link 
              to={`/urun/${productId.split('/')[0]}/${productId}`}
              style={{
                background: '#6366f1',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Məhsula qayıt
            </Link>
          </div>

          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: '#6b7280' }}>Henüz yorum yapılmamış.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.map((comment) => (
                <div key={comment._id || comment.id} style={{
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>
                      {comment.userName}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {new Date(comment.createdAt).toLocaleDateString('az-AZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '18px',
                          color: comment.stars >= star ? '#fbbf24' : '#d1d5db'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ color: '#4b5563', lineHeight: 1.6, fontSize: '1rem' }}>
                    {comment.comment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductComments
