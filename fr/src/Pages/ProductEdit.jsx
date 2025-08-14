import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, resolveImageUrl } from '../utils/api'
import Notification from '../Components/Notification'

const ProductEdit = () => {
  const { storeId, productId } = useParams()
  const navigate = useNavigate()
  const [token] = useState(localStorage.getItem('store_token') || '')
  const [store, setStore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // Ürün alanları
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [stock, setStock] = useState('')
  const [maxQty, setMaxQty] = useState(5)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('kadin')
  const [productCategory, setProductCategory] = useState('giyim')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  
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
  
  // Attributes
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

  useEffect(() => {
    (async () => {
      const s = await api.getStore(storeId)
      setStore(s)
    })()
  }, [storeId])

  const product = useMemo(() => {
    return (store?.products || []).find(p => (p._id || p.id) === productId)
  }, [store, productId])

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setPrice(product.price || '')
      setDiscountPrice(product.discountPrice || '')
      setStock(product.stock || '')
      setMaxQty(product.maxQty || 5)
      setDescription(product.description || '')
      setCategory(product.category || 'kadin')
      setProductCategory(product.productCategory || 'giyim')
      setColor(product.color || '')
      setSize(product.size || '')
      setCurrentImage(product.image || '')
      setSelectedColors(product.colors || [])
      setSelectedSizes(product.sizes || [])
      setSelectedCampaigns(product.campaigns || [])
      setAttributes(product.attributes || {
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
    }
  }, [product])

  const save = async (e) => {
    e.preventDefault()
    if (!token) { setNotification({ message: 'Daxil olmaq lazımdır', type: 'error' }); return }
    setSaving(true)
    try {
      // Önce ürün bilgilerini güncelle
      await api.updateProduct(storeId, productId, {
        name,
        price: Number(price),
        discountPrice: discountPrice === '' ? undefined : Number(discountPrice),
        stock: Number(stock),
        maxQty: Number(maxQty),
        description,
        category,
        productCategory,
        color,
        size,
        colors: selectedColors,
        sizes: selectedSizes,
        campaigns: selectedCampaigns,
        attributes
      }, token)
      
      // Eğer yeni görsel seçildiyse görseli güncelle
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await api.updateProductImage(storeId, productId, formData, token)
      }
      
      setNotification({ message: 'Məhsul uğurla yeniləndi!', type: 'success' })
      
      // Mağaza verilerini yenile
      const updatedStore = await api.getStore(storeId)
      setStore(updatedStore)
    } catch (e) {
      setNotification({ message: 'Yeniləmə uğursuz oldu', type: 'error' })
    } finally { setSaving(false) }
  }

  if (!store) return <div className="page"><div className="muted">Yüklənir...</div></div>
  if (!product) return <div className="page"><div className="muted">Məhsul tapılmadı.</div></div>

  return (
    <div className="page page-narrow">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h2>Məhsulu yenilə</h2>
      <div className="product-add-card">
        <form className="form" onSubmit={save}>
          <div className="form-row">
            <label>Cinsiyyət</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  value="kadin"
                  checked={category === 'kadin'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Qadın</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  value="erkek"
                  checked={category === 'erkek'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Kişi</span>
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <label>Məhsul kateqoriyası</label>
            <select 
              value={productCategory} 
              onChange={(e) => setProductCategory(e.target.value)}
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
            <input required value={name} onChange={(e)=> setName(e.target.value)} />
          </div>
          
          <div className="form-row two">
            <div>
              <label>Qiymət</label>
              <input type="number" step="0.01" required value={price} onChange={(e)=> setPrice(e.target.value)} />
            </div>
            <div>
              <label>Endirimli qiymət</label>
              <input type="number" step="0.01" value={discountPrice} onChange={(e)=> setDiscountPrice(e.target.value)} placeholder="(opsional)" />
            </div>
          </div>
          
          <div className="form-row two">
            <div>
              <label>Maks. miqdar (1-5)</label>
              <input type="number" min={1} max={5} value={maxQty} onChange={(e)=> setMaxQty(Math.max(1, Math.min(5, Number(e.target.value)||1)))} />
            </div>
            <div>
              <label>Stok</label>
              <input type="number" required value={stock} onChange={(e)=> setStock(e.target.value)} />
            </div>
          </div>
          
          <div className="form-row">
            <label>Təsvir</label>
            <textarea value={description} onChange={(e)=> setDescription(e.target.value)} rows={3} />
          </div>
          
          <div className="form-row two">
            <div>
              <label>Rəng</label>
              <input value={color} onChange={(e)=> setColor(e.target.value)} />
            </div>
            <div>
              <label>Ölçü</label>
              <input value={size} onChange={(e)=> setSize(e.target.value)} />
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
            <div className="chip-group grid-3 chip-compact">
              {ALL_COLORS.map((c) => {
                const checked = selectedColors.includes(c)
                return (
                  <label key={c} className={`chip ${checked ? 'selected' : ''}`}>
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
            <div className="chip-group grid-3 chip-compact">
              {ALL_SIZES.map((s) => {
                const checked = selectedSizes.includes(s)
                return (
                  <label key={s} className={`chip ${checked ? 'selected' : ''}`}>
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
            <h3>Məhsul xüsusiyyətləri</h3>
            <p className="section-desc">Məhsulun xüsusiyyətlərini doldurun. Boş buraxılan sahələr göstərilməyəcək.</p>
            <div className="form-row two">
              <div>
                <label>Material</label>
                <select value={attributes.Material} onChange={(e)=> setAttributes(a=>({...a, Material: e.target.value }))}>
                  <option value="">Boş burax (göstərilməsin)</option>
                  <option>Pambıq</option>
                  <option>Yun</option>
                  <option>İpək</option>
                  <option>Polyester</option>
                  <option>Dəri</option>
                </select>
              </div>
              <div>
                <label>Dərinin keyfiyyəti</label>
                <select value={attributes['Dərinin keyfiyyəti']} onChange={(e)=> setAttributes(a=>({...a, ['Dərinin keyfiyyəti']: e.target.value }))}>
                  <option value="">Boş burax (göstərilməsin)</option>
                  <option>Yüksək</option>
                  <option>Orta</option>
                  <option>Aşağı</option>
                </select>
              </div>
            </div>
            <div className="form-row two">
              <div>
                <label>Parça mövcud deyil</label>
                <select value={attributes['Parça mövcud deyil']} onChange={(e)=> setAttributes(a=>({...a, ['Parça mövcud deyil']: e.target.value }))}>
                  <option value="">Boş burax (göstərilməsin)</option>
                  <option>Xeyr</option>
                  <option>Bəli</option>
                </select>
              </div>
              <div>
                <label>Mühit</label>
                <select value={attributes.Mühit} onChange={(e)=> setAttributes(a=>({...a, Mühit: e.target.value }))}>
                  <option value="">Boş burax (göstərilməsin)</option>
                  <option>Daxili</option>
                  <option>Xarici</option>
                  <option>Hər ikisi</option>
                </select>
              </div>
            </div>
            <div className="form-row two">
              <div>
                <label>Naxış</label>
                <select value={attributes.Naxış} onChange={(e)=> setAttributes(a=>({...a, Naxış: e.target.value }))}>
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
            <label>Şəkil</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentImage && (
                <div>
                  <label>Mövcud şəkil:</label>
                  <img alt={name} src={resolveImageUrl(currentImage)} style={{height: 120, borderRadius: 8, marginTop: 8}} />
                </div>
              )}
              <div>
                <label>Yeni şəkil seçin (opsional):</label>
                <input type="file" accept="image/*" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div />
            <div className="form-actions">
              <button className="btn" type="button" onClick={()=> navigate(-1)}>Geri</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Yüklənir...' : 'Yenilə'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductEdit


