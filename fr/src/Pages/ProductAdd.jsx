import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import Notification from '../Components/Notification'

const ProductAdd = () => {
  const [token] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
  const [product, setProduct] = useState({ name: '', price: '', discountPrice: '', maxQty: 5, stock: '', color: '', size: '', description: '', category: 'kadin', productCategory: 'giyim', file: null })
  const [attributes, setAttributes] = useState({
    Material: '',
    'Dərinin keyfiyyəti': '',
    'Parça mövcud deyil': '',
    Mühit: '',
    Naxış: '',
    'Parça növü': '',
    Kolleksiya: '',
    'Davamlılıq detalları': '',
    Tutum: '',
    'Paket tərkibi': '',
    Yaş: '',
    'Mənşə': '',
  })
  // Çoklu seçimler
  const ALL_COLORS = ['siyah', 'beyaz', 'kırmızı', 'mavi', 'yeşil', 'sarı', 'turuncu', 'mor', 'gümüş', 'altın', 'gri', 'bej', 'kahverengi', 'pembe', 'lacivert']
  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const ALL_CAMPAIGNS = [
    'Kargo pulsuz',
    '2-ci məhsula 10%',
    '3 al 2 ödə',
    'Mövsüm endirimi',
  ]
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        if (!token) return
        const mine = await api.meStore(token)
        setMe(mine)
      } catch (e) {
        setError('Daxil olmaq lazımdır')
      }
    })()
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (!token || !me) { setError('Daxil olmaq lazımdır'); return }
    setSaving(true); setError('')
    try {
      const formData = new FormData()
      formData.append('name', product.name)
      formData.append('price', String(product.price))
      if (product.discountPrice) formData.append('discountPrice', String(product.discountPrice))
      if (product.maxQty) formData.append('maxQty', String(product.maxQty))
      formData.append('stock', String(product.stock))
      formData.append('category', product.category)
      formData.append('productCategory', product.productCategory)
      // Çoxlu seçimlər istifadə olunur (colors/sizes)
      // Çoklu seçimleri JSON olarak gönder
      if (selectedColors.length > 0) formData.append('colors', JSON.stringify(selectedColors))
      if (selectedSizes.length > 0) formData.append('sizes', JSON.stringify(selectedSizes))
      if (selectedCampaigns.length > 0) formData.append('campaigns', JSON.stringify(selectedCampaigns))
      if (product.description) formData.append('description', product.description)
      // Attributes boş olmayanları gönder
      const cleaned = Object.fromEntries(Object.entries(attributes).filter(([_, v]) => String(v || '').trim().length > 0))
      if (Object.keys(cleaned).length > 0) formData.append('attributes', JSON.stringify(cleaned))
      if (product.file) formData.append('image', product.file)
      await api.addProduct(me._id || me.id, formData, token)
      setProduct({ name: '', price: '', discountPrice: '', maxQty: 5, stock: '', color: '', size: '', description: '', file: null })
      setSelectedColors([])
      setSelectedSizes([])
      setSelectedCampaigns([])
      setAttributes({
        Material: '', 'Dərinin keyfiyyəti': '', 'Parça mövcud deyil': '', Mühit: '', Naxış: '', 'Parça növü': '', Kolleksiya: '', 'Davamlılıq detalları': '', Tutum: '', 'Paket tərkibi': '', Yaş: '', 'Mənşə': '',
      })
      setNotification({ message: 'Məhsul uğurla əlavə edildi!', type: 'success' })
    } catch (e) {
      setNotification({ message: 'Əlavə etmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <div className="page page-narrow">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <h2>Məhsul əlavə et</h2>
      {!token && <div className="muted">Zəhmət olmasa əvvəlcə daxil olun.</div>}
      {error && <div className="muted">{error}</div>}
      <div className="product-add-card">
      <form className="form" onSubmit={submit}>
        <div className="form-row">
          <label>Cinsiyyət</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="category"
                value="kadin"
                checked={product.category === 'kadin'}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
              />
              <span>Qadın</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="category"
                value="erkek"
                checked={product.category === 'erkek'}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
              />
              <span>Kişi</span>
            </label>
          </div>
        </div>
        
        <div className="form-row">
          <label>Məhsul kateqoriyası</label>
          <select 
            value={product.productCategory} 
            onChange={(e) => setProduct({ ...product, productCategory: e.target.value })}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          >
            <option value="giyim">Geyim</option>
            <option value="ayakkabi">Ayaqqabı</option>
            <option value="aksesuar">Aksesuar</option>
            <option value="makyaj">Makiyaj</option>
            <option value="parfum">Ətir</option>
            <option value="elektronik">Elektronika</option>
          </select>
        </div>
        
        <div className="form-row">
          <label>Məhsul adı</label>
          <input required value={product.name} onChange={(e)=> setProduct({ ...product, name: e.target.value })} />
        </div>
        <div className="form-row two">
          <div>
            <label>Qiymət</label>
            <input type="number" step="0.01" required value={product.price} onChange={(e)=> setProduct({ ...product, price: e.target.value })} />
          </div>
          <div>
            <label>Endirimli qiymət</label>
            <input type="number" step="0.01" value={product.discountPrice} onChange={(e)=> setProduct({ ...product, discountPrice: e.target.value })} placeholder="(opsional)" />
          </div>
        </div>
        <div className="form-row two">
          <div>
            <label>Maks. miqdar (1-5)</label>
            <input type="number" min={1} max={5} value={product.maxQty} onChange={(e)=> setProduct({ ...product, maxQty: Math.max(1, Math.min(5, Number(e.target.value)||1)) })} />
          </div>
          <div>
            <label>Stok</label>
            <input type="number" required value={product.stock} onChange={(e)=> setProduct({ ...product, stock: e.target.value })} />
          </div>
        </div>
        <div className="form-row form-section">
          <h3>Kampaniyalar</h3>
          <p className="section-desc">Aşağıdakı kampaniyalardan uyğun olanları seçin.</p>
          <div className="options-toolbar">
            <button type="button" className="mini-btn" onClick={()=> setSelectedCampaigns(ALL_CAMPAIGNS)}>Hamısını seç</button>
            <button type="button" className="mini-btn" onClick={()=> setSelectedCampaigns([])}>Təmizlə</button>
          </div>
          <div className="chip-group grid-3 chip-compact">
            {ALL_CAMPAIGNS.map((c) => {
              const checked = selectedCampaigns.includes(c)
              return (
                <label key={c} className={`chip ${checked ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCampaigns((prev) => Array.from(new Set([...prev, c])))
                      else setSelectedCampaigns((prev) => prev.filter((x) => x !== c))
                    }}
                  />
                  {c}
                </label>
              )
            })}
          </div>
        </div>
        <div className="form-row form-section">
          <h3>Rənglər</h3>
          <p className="section-desc">Mövcud rəngləri seçin. Müştərilər yalnız bu rənglərdən seçim edəcək.</p>
          <div className="options-toolbar">
            <button type="button" className="mini-btn" onClick={()=> setSelectedColors(ALL_COLORS)}>Hamısını seç</button>
            <button type="button" className="mini-btn" onClick={()=> setSelectedColors([])}>Təmizlə</button>
          </div>
          <label style={{ display: 'block', marginBottom: 8 }}>Rəng (çoxlu seçim)</label>
          <div className="chip-group grid-3 chip-compact">
            {ALL_COLORS.map((c) => {
              const checked = selectedColors.includes(c)
              return (
                <label key={c} className={`chip ${checked ? 'selected' : ''} chip-sm`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColors((prev) => Array.from(new Set([...prev, c])))
                      else setSelectedColors((prev) => prev.filter((x) => x !== c))
                    }}
                  />
                  {c}
                </label>
              )
            })}
          </div>
        </div>

        <div className="form-row form-section">
          <h3>Ölçülər</h3>
          <p className="section-desc">Mövcud ölçüləri seçin. Müştərilər yalnız bu ölçülərdən seçim edəcək.</p>
          <div className="options-toolbar">
            <button type="button" className="mini-btn" onClick={()=> setSelectedSizes(ALL_SIZES)}>Hamısını seç</button>
            <button type="button" className="mini-btn" onClick={()=> setSelectedSizes([])}>Təmizlə</button>
          </div>
          <label style={{ display: 'block', marginBottom: 8 }}>Ölçü (çoxlu seçim)</label>
          <div className="chip-group grid-3 chip-compact">
            {ALL_SIZES.map((s) => {
              const checked = selectedSizes.includes(s)
              return (
                <label key={s} className={`chip ${checked ? 'selected' : ''} chip-sm`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSizes((prev) => Array.from(new Set([...prev, s])))
                      else setSelectedSizes((prev) => prev.filter((x) => x !== s))
                    }}
                  />
                  {s}
                </label>
              )
            })}
          </div>
        </div>

        
        <div className="form-row form-section">
          <label>Təsvir</label>
          <textarea rows={4} value={product.description} onChange={(e)=> setProduct({ ...product, description: e.target.value })} />
        </div>
        <div className="form-row form-section">
          <h3>Məhsul xüsusiyyətləri</h3>
          <p className="section-desc">Uyğun olanları doldurun. Boş buraxsanız məhsul detallarında '-' görünəcək.</p>
          <div className="form-row two">
            <div>
              <label>Material</label>
              <select value={attributes['Material']} onChange={(e)=> setAttributes(a=>({...a, Material: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Həqiqi dəri</option>
                <option>Süni dəri</option>
                <option>Parça</option>
                <option>Sintetik</option>
                <option >Kumaş</option>
              </select>
            </div>
            <div>
              <label>Mühit</label>
              <select value={attributes['Mühit']} onChange={(e)=> setAttributes(a=>({...a, Mühit: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Gündəlik</option>
                <option>Klassik</option>
                <option>İdman</option>
              </select>
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Naxış</label>
              <select value={attributes['Naxış']} onChange={(e)=> setAttributes(a=>({...a, Naxış: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Düz</option>
                <option>Naxışlı</option>
              </select>
            </div>
            <div>
              <label>Parça növü</label>
              <select value={attributes['Parça növü']} onChange={(e)=> setAttributes(a=>({...a, ['Parça növü']: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Toxuma</option>
                <option>Örmə</option>
              </select>
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Kolleksiya</label>
              <select value={attributes['Kolleksiya']} onChange={(e)=> setAttributes(a=>({...a, Kolleksiya: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Sadə</option>
                <option>Premium</option>
              </select>
            </div>
            <div>
              <label>Davamlılıq detalları</label>
              <select value={attributes['Davamlılıq detalları']} onChange={(e)=> setAttributes(a=>({...a, ['Davamlılıq detalları']: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Xeyr</option>
                <option>Bəli</option>
              </select>
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Tutum</label>
              <select value={attributes['Tutum']} onChange={(e)=> setAttributes(a=>({...a, Tutum: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>0-15 L</option>
                <option>16-30 L</option>
              </select>
            </div>
            <div>
              <label>Paket tərkibi</label>
              <select value={attributes['Paket tərkibi']} onChange={(e)=> setAttributes(a=>({...a, ['Paket tərkibi']: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>1-li</option>
                <option>2-li</option>
              </select>
            </div>
          </div>
          <div className="form-row two">
            <div>
              <label>Yaş</label>
              <select value={attributes['Yaş']} onChange={(e)=> setAttributes(a=>({...a, Yaş: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>Bütün yaş qrupları</option>
                <option>Böyüklər</option>
                <option>Uşaqlar</option>
              </select>
            </div>
            <div>
              <label>Mənşə</label>
              <select value={attributes['Mənşə']} onChange={(e)=> setAttributes(a=>({...a, ['Mənşə']: e.target.value }))}>
                <option value="">Boş burax (göstərilməsin)</option>
                <option>TR</option>
                <option>CN</option>
                <option>EU</option>
                <option>AZ</option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>Şəkil (tək fayl)</label>
          <input type="file" accept="image/*" onChange={(e)=> setProduct({ ...product, file: e.target.files?.[0] || null })} />
        </div>

        <div className="form-footer">
          <label className="switch">
            <input type="checkbox" checked={product.visible} onChange={(e)=> setProduct({ ...product, visible: e.target.checked })} />
            <span className="toggle" />
            <span className="switch-texts">
              <span className="switch-title">Mağazada göstər</span>
              <span className="switch-desc">Aktiv edildikdə məhsul mağazada listələnəcək</span>
            </span>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving || !token}>{saving ? 'Yüklənir...' : 'Əlavə et'}</button>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
}

export default ProductAdd


