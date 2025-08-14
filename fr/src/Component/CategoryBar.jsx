import React, { useState } from 'react'
import './CategoryBar.css'

const CategoryBar = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'tumu', name: 'Tümü' },
    { id: 'kadin', name: 'Qadın' },
    { id: 'erkek', name: 'Kişi' },
    { id: 'ayakkabi', name: 'Ayaqqabı' },
    { id: 'giyim', name: 'Geyim' },
    { id: 'aksesuar', name: 'Aksesuar' },
    { id: 'makyaj', name: 'Makiyaj' },
    { id: 'parfum', name: 'Ətir' },
    { id: 'elektronik', name: 'Elektronika' }
  ]

  return (
    <div className="category-bar">
      <div className="category-container">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="category-text">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryBar
