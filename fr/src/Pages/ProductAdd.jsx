import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import Notification from '../Components/Notification'

const ProductAdd = () => {
  const [token] = useState(localStorage.getItem('store_token') || '')
  const [me, setMe] = useState(null)
  const [product, setProduct] = useState({ name: '', price: '', discountPrice: '', maxQty: 5, stock: '', color: '', size: '', description: '', category: 'kadin', productCategory: 'giyim', file: null })

  // Çoklu seçimler
  const ALL_COLORS = [
    { name: 'siyah', color: '#000000' },
    { name: 'beyaz', color: '#FFFFFF' },
    { name: 'kırmızı', color: '#FF0000' },
    { name: 'mavi', color: '#0000FF' },
    { name: 'yeşil', color: '#00FF00' },
    { name: 'sarı', color: '#FFFF00' },
    { name: 'turuncu', color: '#FFA500' },
    { name: 'mor', color: '#800080' },
    { name: 'gümüş', color: '#C0C0C0' },
    { name: 'altın', color: '#FFD700' },
    { name: 'gri', color: '#808080' },
    { name: 'bej', color: '#F5F5DC' },
    { name: 'kahverengi', color: '#8B4513' },
    { name: 'pembe', color: '#FFC0CB' },
    { name: 'lacivert', color: '#000080' }
  ]
  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const ALL_SHOE_SIZES = Array.from({length: 15}, (_, i) => (i + 30).toString()) // 30-44
  const ALL_CAMPAIGNS = [
    'Kargo pulsuz',
    '2-ci məhsula 10%',
    '3 al 2 ödə',
    'Mövsüm endirimi',
  ]
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [giyimDetails, setGiyimDetails] = useState({
    material: '',
    fabric: '',
    style: '',
    season: '',
    fit: '',
    pattern: '',
    sleeve: '',
    neckline: '',
    length: '',
    care: ''
  })
  const [parfumDetails, setParfumDetails] = useState({
    volume: '',
    concentration: '',
    brand: '',
    origin: '',
    family: '',
    notes: '',
    longevity: '',
    sillage: '',
    occasion: '',
    gender: ''
  })
  const [ayakkabiDetails, setAyakkabiDetails] = useState({
    material: '',
    soleType: '',
    heelHeight: '',
    closure: '',
    style: '',
    season: '',
    brand: '',
    origin: '',
    care: '',
    comfort: ''
  })
  const [aksesuarDetails, setAksesuarDetails] = useState({
    material: '',
    size: '',
    brand: '',
    type: '',
    style: '',
    color: '',
    origin: '',
    care: '',
    occasion: '',
    quality: ''
  })
  const [makyajDetails, setMakyajDetails] = useState({
    brand: '',
    type: '',
    volume: '',
    expiryDate: '',
    shade: '',
    finish: '',
    coverage: '',
    skinType: '',
    ingredients: '',
    crueltyFree: ''
  })
  const [elektronikDetails, setElektronikDetails] = useState({
    brand: '',
    model: '',
    warranty: '',
    power: '',
    connectivity: '',
    features: '',
    compatibility: '',
    battery: '',
    dimensions: '',
    weight: ''
  })
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
      if (product.discountPrice && product.discountPrice.trim() !== '') formData.append('discountPrice', String(product.discountPrice))
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
      
      // Kategori detaylarını ekle
      if (product.productCategory === 'giyim') {
        const giyimAttributes = {}
        if (giyimDetails.material) giyimAttributes.material = giyimDetails.material
        if (giyimDetails.fabric) giyimAttributes.fabric = giyimDetails.fabric
        if (giyimDetails.style) giyimAttributes.style = giyimDetails.style
        if (giyimDetails.season) giyimAttributes.season = giyimDetails.season
        if (giyimDetails.fit) giyimAttributes.fit = giyimDetails.fit
        if (giyimDetails.pattern) giyimAttributes.pattern = giyimDetails.pattern
        if (giyimDetails.sleeve) giyimAttributes.sleeve = giyimDetails.sleeve
        if (giyimDetails.neckline) giyimAttributes.neckline = giyimDetails.neckline
        if (giyimDetails.length) giyimAttributes.length = giyimDetails.length
        if (giyimDetails.care) giyimAttributes.care = giyimDetails.care
        
        if (Object.keys(giyimAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(giyimAttributes))
        }
      }
      
      if (product.productCategory === 'parfum') {
        const parfumAttributes = {}
        if (parfumDetails.volume) parfumAttributes.volume = parfumDetails.volume
        if (parfumDetails.concentration) parfumAttributes.concentration = parfumDetails.concentration
        if (parfumDetails.brand) parfumAttributes.brand = parfumDetails.brand
        if (parfumDetails.origin) parfumAttributes.origin = parfumDetails.origin
        if (parfumDetails.family) parfumAttributes.family = parfumDetails.family
        if (parfumDetails.notes) parfumAttributes.notes = parfumDetails.notes
        if (parfumDetails.longevity) parfumAttributes.longevity = parfumDetails.longevity
        if (parfumDetails.sillage) parfumAttributes.sillage = parfumDetails.sillage
        if (parfumDetails.occasion) parfumAttributes.occasion = parfumDetails.occasion
        if (parfumDetails.gender) parfumAttributes.gender = parfumDetails.gender
        
        if (Object.keys(parfumAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(parfumAttributes))
        }
      }
      
      if (product.productCategory === 'ayakkabi') {
        const ayakkabiAttributes = {}
        if (ayakkabiDetails.material) ayakkabiAttributes.material = ayakkabiDetails.material
        if (ayakkabiDetails.soleType) ayakkabiAttributes.soleType = ayakkabiDetails.soleType
        if (ayakkabiDetails.heelHeight) ayakkabiAttributes.heelHeight = ayakkabiDetails.heelHeight
        if (ayakkabiDetails.closure) ayakkabiAttributes.closure = ayakkabiDetails.closure
        if (ayakkabiDetails.style) ayakkabiAttributes.style = ayakkabiDetails.style
        if (ayakkabiDetails.season) ayakkabiAttributes.season = ayakkabiDetails.season
        if (ayakkabiDetails.brand) ayakkabiAttributes.brand = ayakkabiDetails.brand
        if (ayakkabiDetails.origin) ayakkabiAttributes.origin = ayakkabiDetails.origin
        if (ayakkabiDetails.care) ayakkabiAttributes.care = ayakkabiDetails.care
        if (ayakkabiDetails.comfort) ayakkabiAttributes.comfort = ayakkabiDetails.comfort
        
        if (Object.keys(ayakkabiAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(ayakkabiAttributes))
        }
      }
      
      if (product.productCategory === 'aksesuar') {
        const aksesuarAttributes = {}
        if (aksesuarDetails.material) aksesuarAttributes.material = aksesuarDetails.material
        if (aksesuarDetails.size) aksesuarAttributes.size = aksesuarDetails.size
        if (aksesuarDetails.brand) aksesuarAttributes.brand = aksesuarDetails.brand
        if (aksesuarDetails.type) aksesuarAttributes.type = aksesuarDetails.type
        
        if (Object.keys(aksesuarAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(aksesuarAttributes))
        }
      }
      
      if (product.productCategory === 'makyaj') {
        const makyajAttributes = {}
        if (makyajDetails.brand) makyajAttributes.brand = makyajDetails.brand
        if (makyajDetails.type) makyajAttributes.type = makyajDetails.type
        if (makyajDetails.volume) makyajAttributes.volume = makyajDetails.volume
        if (makyajDetails.expiryDate) makyajAttributes.expiryDate = makyajDetails.expiryDate
        
        if (Object.keys(makyajAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(makyajAttributes))
        }
      }
      
      if (product.productCategory === 'elektronik') {
        const elektronikAttributes = {}
        if (elektronikDetails.brand) elektronikAttributes.brand = elektronikDetails.brand
        if (elektronikDetails.model) elektronikAttributes.model = elektronikDetails.model
        if (elektronikDetails.warranty) elektronikAttributes.warranty = elektronikDetails.warranty
        if (elektronikDetails.power) elektronikAttributes.power = elektronikDetails.power
        
        if (Object.keys(elektronikAttributes).length > 0) {
          formData.append('categoryDetails', JSON.stringify(elektronikAttributes))
        }

              }
      if (product.file) formData.append('image', product.file)
      await api.addProduct(me._id || me.id, formData, token)
      setProduct({ name: '', price: '', discountPrice: '', maxQty: 5, stock: '', color: '', size: '', description: '', file: null })
      setSelectedColors([])
      setSelectedSizes([])
      setSelectedCampaigns([])
      setGiyimDetails({ material: '', fabric: '', style: '', season: '', fit: '', pattern: '', sleeve: '', neckline: '', length: '', care: '' })
      setParfumDetails({ volume: '', concentration: '', brand: '', origin: '', family: '', notes: '', longevity: '', sillage: '', occasion: '', gender: '' })
      setAyakkabiDetails({ material: '', soleType: '', heelHeight: '', closure: '' })
      setAksesuarDetails({ material: '', size: '', brand: '', type: '' })
      setMakyajDetails({ brand: '', type: '', volume: '', expiryDate: '' })
      setElektronikDetails({ brand: '', model: '', warranty: '', power: '' })
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
          <div className="chip-group">
            <div 
              className={`chip ${product.category === 'kadin' ? 'selected' : ''}`}
              onClick={() => setProduct({ ...product, category: 'kadin' })}
            >
              Qadın
            </div>
            <div 
              className={`chip ${product.category === 'erkek' ? 'selected' : ''}`}
              onClick={() => setProduct({ ...product, category: 'erkek' })}
            >
              Kişi
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <label>Məhsul kateqoriyası</label>
          <select 
            value={product.productCategory} 
            onChange={(e) => {
              setProduct({ ...product, productCategory: e.target.value })
              // Kategori değiştiğinde seçili ölçüleri ve tüm detayları temizle
              setSelectedSizes([])
              setGiyimDetails({ material: '', fabric: '', style: '', season: '', fit: '', pattern: '', sleeve: '', neckline: '', length: '', care: '' })
              setParfumDetails({ volume: '', concentration: '', brand: '', origin: '', family: '', notes: '', longevity: '', sillage: '', occasion: '', gender: '' })
              setAyakkabiDetails({ material: '', soleType: '', heelHeight: '', closure: '' })
              setAksesuarDetails({ material: '', size: '', brand: '', type: '' })
              setMakyajDetails({ brand: '', type: '', volume: '', expiryDate: '' })
              setElektronikDetails({ brand: '', model: '', warranty: '', power: '' })
            }}
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
            <div className="helper-text">Endirimli qiymət qoymaq məcburi deyil</div>
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
                <div 
                  key={c} 
                  className={`chip ${checked ? 'selected' : ''}`}
                  onClick={() => {
                    if (checked) {
                      setSelectedCampaigns((prev) => prev.filter((x) => x !== c))
                    } else {
                      setSelectedCampaigns((prev) => Array.from(new Set([...prev, c])))
                    }
                  }}
                >
                  {c}
                </div>
              )
            })}
          </div>
        </div>
        <div className="form-row form-section">
          <h3>Rənglər</h3>
          <p className="section-desc">Mövcud rəngləri seçin. Müştərilər yalnız bu rənglərdən seçim edəcək.</p>
          <div className="options-toolbar">
            <button type="button" className="mini-btn" onClick={()=> setSelectedColors(ALL_COLORS.map(c => c.name))}>Hamısını seç</button>
            <button type="button" className="mini-btn" onClick={()=> setSelectedColors([])}>Təmizlə</button>
          </div>
          <label className="section-label">Rəng (çoxlu seçim)</label>
          <div className="chip-group grid-3 chip-compact">
            {ALL_COLORS.map((c) => {
              const checked = selectedColors.includes(c.name)
              return (
                <div 
                  key={c.name} 
                  className={`color-chip ${checked ? 'selected' : ''}`}
                  onClick={() => {
                    if (checked) {
                      setSelectedColors((prev) => prev.filter((x) => x !== c.name))
                    } else {
                      setSelectedColors((prev) => Array.from(new Set([...prev, c.name])))
                    }
                  }}
                  title={c.name}
                >
                  <div 
                    className="color-circle" 
                    style={{ backgroundColor: c.color }}
                  ></div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="form-row form-section">
          <h3>Ölçülər</h3>
          <p className="section-desc">Mövcud ölçüləri seçin. Müştərilər yalnız bu ölçülərdən seçim edəcək.</p>
          <div className="options-toolbar">
            <button type="button" className="mini-btn" onClick={()=> setSelectedSizes(product.productCategory === 'ayakkabi' ? ALL_SHOE_SIZES : ALL_SIZES)}>Hamısını seç</button>
            <button type="button" className="mini-btn" onClick={()=> setSelectedSizes([])}>Təmizlə</button>
          </div>
          <label className="section-label">Ölçü (çoxlu seçim)</label>
          <div className="chip-group grid-3 chip-compact">
            {(product.productCategory === 'ayakkabi' ? ALL_SHOE_SIZES : ALL_SIZES).map((s) => {
              const checked = selectedSizes.includes(s)
              return (
                <div 
                  key={s} 
                  className={`chip ${checked ? 'selected' : ''} chip-sm`}
                  onClick={() => {
                    if (checked) {
                      setSelectedSizes((prev) => prev.filter((x) => x !== s))
                    } else {
                      setSelectedSizes((prev) => Array.from(new Set([...prev, s])))
                    }
                  }}
                >
                  {s}
                </div>
              )
            })}
          </div>
        </div>

        
        <div className="form-row form-section">
          <label>Təsvir</label>
          <textarea rows={4} value={product.description} onChange={(e)=> setProduct({ ...product, description: e.target.value })} />
        </div>
        
        {/* Kategori Detayları */}
        
        {/* Giyim Detayları */}
        {product.productCategory === 'giyim' && (
        <div className="form-row form-section">
            <h3>Geyim Detalları</h3>
            <p className="section-desc">Geyim məhsulu üçün əlavə məlumatlar doldurun.</p>
            
          <div className="form-row two">
            <div>
              <label>Material</label>
                <input 
                  type="text" 
                  value={giyimDetails.material} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, material: e.target.value})}
                  placeholder="Məsələn: Pamuk, Polyester, Yün"
                />
              </div>
              <div>
                <label>Kumaş</label>
                <input 
                  type="text" 
                  value={giyimDetails.fabric} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, fabric: e.target.value})}
                  placeholder="Məsələn: Triko, Dəri, Kətan"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Stil</label>
                <input 
                  type="text" 
                  value={giyimDetails.style} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, style: e.target.value})}
                  placeholder="Məsələn: Klassik, Modern, Sport"
                />
              </div>
              <div>
                <label>Mövsüm</label>
                <input 
                  type="text" 
                  value={giyimDetails.season} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, season: e.target.value})}
                  placeholder="Məsələn: Yaz, Qış, Bütün mövsüm"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Uyğunluq</label>
                <input 
                  type="text" 
                  value={giyimDetails.fit} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, fit: e.target.value})}
                  placeholder="Məsələn: Dar, Geniş, Normal"
                />
              </div>
              <div>
                <label>Naxış</label>
                <input 
                  type="text" 
                  value={giyimDetails.pattern} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, pattern: e.target.value})}
                  placeholder="Məsələn: Düz, Naxışlı, Çiçəkli"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Qol</label>
                <input 
                  type="text" 
                  value={giyimDetails.sleeve} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, sleeve: e.target.value})}
                  placeholder="Məsələn: Qısa qol, Uzun qol, Qolsuz"
                />
              </div>
              <div>
                <label>Boyun</label>
                <input 
                  type="text" 
                  value={giyimDetails.neckline} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, neckline: e.target.value})}
                  placeholder="Məsələn: V-boyun, Yuvarlaq, Dekolte"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Uzunluq</label>
                <input 
                  type="text" 
                  value={giyimDetails.length} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, length: e.target.value})}
                  placeholder="Məsələn: Qısa, Orta, Uzun"
                />
            </div>
            <div>
                <label>Qulluq</label>
                <input 
                  type="text" 
                  value={giyimDetails.care} 
                  onChange={(e) => setGiyimDetails({...giyimDetails, care: e.target.value})}
                  placeholder="Məsələn: Maşın yuma, Əl yuma"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Parfum Detayları */}
        {product.productCategory === 'parfum' && (
          <div className="form-row form-section">
            <h3>Ətir Detalları</h3>
            <p className="section-desc">Ətir məhsulu üçün əlavə məlumatlar doldurun.</p>
            
            <div className="form-row two">
              <div>
                <label>Həcm (ml)</label>
                <input 
                  type="text" 
                  value={parfumDetails.volume} 
                  onChange={(e) => setParfumDetails({...parfumDetails, volume: e.target.value})}
                  placeholder="Məsələn: 50ml, 100ml"
                />
              </div>
              <div>
                <label>Konsentrasiya</label>
                <input 
                  type="text" 
                  value={parfumDetails.concentration} 
                  onChange={(e) => setParfumDetails({...parfumDetails, concentration: e.target.value})}
                  placeholder="Məsələn: EDP, EDT, Parfum"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Marka</label>
                <input 
                  type="text" 
                  value={parfumDetails.brand} 
                  onChange={(e) => setParfumDetails({...parfumDetails, brand: e.target.value})}
                  placeholder="Məsələn: Chanel, Dior"
                />
              </div>
              <div>
                <label>Mənşə</label>
                <input 
                  type="text" 
                  value={parfumDetails.origin} 
                  onChange={(e) => setParfumDetails({...parfumDetails, origin: e.target.value})}
                  placeholder="Məsələn: Fransa, İtaliya"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Ailə</label>
                <input 
                  type="text" 
                  value={parfumDetails.family} 
                  onChange={(e) => setParfumDetails({...parfumDetails, family: e.target.value})}
                  placeholder="Məsələn: Çiçəkli, Ağaclı, Oriental"
                />
              </div>
              <div>
                <label>Notlar</label>
                <input 
                  type="text" 
                  value={parfumDetails.notes} 
                  onChange={(e) => setParfumDetails({...parfumDetails, notes: e.target.value})}
                  placeholder="Məsələn: Vanil, Lavanta, Sandal"
                />
              </div>
            </div>
            
          <div className="form-row two">
            <div>
                <label>Davamlılıq</label>
                <input 
                  type="text" 
                  value={parfumDetails.longevity} 
                  onChange={(e) => setParfumDetails({...parfumDetails, longevity: e.target.value})}
                  placeholder="Məsələn: 4-6 saat, 8+ saat"
                />
              </div>
              <div>
                <label>Yayılma</label>
                <input 
                  type="text" 
                  value={parfumDetails.sillage} 
                  onChange={(e) => setParfumDetails({...parfumDetails, sillage: e.target.value})}
                  placeholder="Məsələn: Zəif, Orta, Güclü"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Məqsəd</label>
                <input 
                  type="text" 
                  value={parfumDetails.occasion} 
                  onChange={(e) => setParfumDetails({...parfumDetails, occasion: e.target.value})}
                  placeholder="Məsələn: Gündəlik, Axşam, Xüsusi"
                />
            </div>
            <div>
                <label>Cinsiyyət</label>
                <input 
                  type="text" 
                  value={parfumDetails.gender} 
                  onChange={(e) => setParfumDetails({...parfumDetails, gender: e.target.value})}
                  placeholder="Məsələn: Qadın, Kişi, Unisex"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ayakkabı Detayları */}
        {product.productCategory === 'ayakkabi' && (
          <div className="form-row form-section">
            <h3>Ayaqqabı Detalları</h3>
            <p className="section-desc">Ayaqqabı məhsulu üçün əlavə məlumatlar doldurun.</p>
            
            <div className="form-row two">
              <div>
                <label>Material</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.material} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, material: e.target.value})}
                  placeholder="Məsələn: Dəri, Kətan, Sintetik"
                />
              </div>
              <div>
                <label>Daban növü</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.soleType} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, soleType: e.target.value})}
                  placeholder="Məsələn: Kauçuk, Dəri, Platform"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Daban hündürlüyü</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.heelHeight} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, heelHeight: e.target.value})}
                  placeholder="Məsələn: 5cm, Düz, Platform"
                />
              </div>
              <div>
                <label>Bağlama növü</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.closure} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, closure: e.target.value})}
                  placeholder="Məsələn: Fermuar, Cırma, Velcro"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Stil</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.style} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, style: e.target.value})}
                  placeholder="Məsələn: Klassik, Sport, Casual"
                />
              </div>
              <div>
                <label>Mövsüm</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.season} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, season: e.target.value})}
                  placeholder="Məsələn: Yaz, Qış, Bütün mövsüm"
                />
              </div>
            </div>
            
          <div className="form-row two">
            <div>
                <label>Marka</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.brand} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, brand: e.target.value})}
                  placeholder="Məsələn: Nike, Adidas, Puma"
                />
              </div>
              <div>
                <label>Mənşə</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.origin} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, origin: e.target.value})}
                  placeholder="Məsələn: TR, CN, EU"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Qulluq</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.care} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, care: e.target.value})}
                  placeholder="Məsələn: Əl təmizləmə, Maşın yuma"
                />
            </div>
            <div>
                <label>Rahatlıq</label>
                <input 
                  type="text" 
                  value={ayakkabiDetails.comfort} 
                  onChange={(e) => setAyakkabiDetails({...ayakkabiDetails, comfort: e.target.value})}
                  placeholder="Məsələn: Ortopedik, Yumşaq, Dəstəkli"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aksesuar Detayları */}
        {product.productCategory === 'aksesuar' && (
          <div className="form-row form-section">
            <h3>Aksesuar Detalları</h3>
            <p className="section-desc">Aksesuar məhsulu üçün əlavə məlumatlar doldurun.</p>
            
          <div className="form-row two">
            <div>
                <label>Material</label>
                <input 
                  type="text" 
                  value={aksesuarDetails.material} 
                  onChange={(e) => setAksesuarDetails({...aksesuarDetails, material: e.target.value})}
                  placeholder="Məsələn: Dəri, Metal, Plastik"
                />
              </div>
              <div>
                <label>Ölçü</label>
                <input 
                  type="text" 
                  value={aksesuarDetails.size} 
                  onChange={(e) => setAksesuarDetails({...aksesuarDetails, size: e.target.value})}
                  placeholder="Məsələn: Kiçik, Orta, Böyük"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Marka</label>
                <input 
                  type="text" 
                  value={aksesuarDetails.brand} 
                  onChange={(e) => setAksesuarDetails({...aksesuarDetails, brand: e.target.value})}
                  placeholder="Məsələn: Gucci, Prada, Zara"
                />
            </div>
            <div>
                <label>Növ</label>
                <input 
                  type="text" 
                  value={aksesuarDetails.type} 
                  onChange={(e) => setAksesuarDetails({...aksesuarDetails, type: e.target.value})}
                  placeholder="Məsələn: Çanta, Saat, Kəmər"
                />
              </div>
            </div>
          </div>
        )}

        {/* Makyaj Detayları */}
        {product.productCategory === 'makyaj' && (
          <div className="form-row form-section">
            <h3>Makiyaj Detalları</h3>
            <p className="section-desc">Makiyaj məhsulu üçün əlavə məlumatlar doldurun.</p>
            
          <div className="form-row two">
            <div>
                <label>Marka</label>
                <input 
                  type="text" 
                  value={makyajDetails.brand} 
                  onChange={(e) => setMakyajDetails({...makyajDetails, brand: e.target.value})}
                  placeholder="Məsələn: MAC, Dior, Maybelline"
                />
              </div>
              <div>
                <label>Növ</label>
                <input 
                  type="text" 
                  value={makyajDetails.type} 
                  onChange={(e) => setMakyajDetails({...makyajDetails, type: e.target.value})}
                  placeholder="Məsələn: Dodaq boyası, Göz kölgəsi"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Həcm</label>
                <input 
                  type="text" 
                  value={makyajDetails.volume} 
                  onChange={(e) => setMakyajDetails({...makyajDetails, volume: e.target.value})}
                  placeholder="Məsələn: 3.5g, 10ml"
                />
            </div>
            <div>
                <label>Bitmə tarixi</label>
                <input 
                  type="text" 
                  value={makyajDetails.expiryDate} 
                  onChange={(e) => setMakyajDetails({...makyajDetails, expiryDate: e.target.value})}
                  placeholder="Məsələn: 24 ay, 36 ay"
                />
              </div>
            </div>
          </div>
        )}

        {/* Elektronik Detayları */}
        {product.productCategory === 'elektronik' && (
          <div className="form-row form-section">
            <h3>Elektronika Detalları</h3>
            <p className="section-desc">Elektronika məhsulu üçün əlavə məlumatlar doldurun.</p>
            
            <div className="form-row two">
              <div>
                <label>Marka</label>
                <input 
                  type="text" 
                  value={elektronikDetails.brand} 
                  onChange={(e) => setElektronikDetails({...elektronikDetails, brand: e.target.value})}
                  placeholder="Məsələn: Apple, Samsung, Sony"
                />
              </div>
              <div>
                <label>Model</label>
                <input 
                  type="text" 
                  value={elektronikDetails.model} 
                  onChange={(e) => setElektronikDetails({...elektronikDetails, model: e.target.value})}
                  placeholder="Məsələn: iPhone 14, Galaxy S23"
                />
              </div>
            </div>
            
            <div className="form-row two">
              <div>
                <label>Zəmanət</label>
                <input 
                  type="text" 
                  value={elektronikDetails.warranty} 
                  onChange={(e) => setElektronikDetails({...elektronikDetails, warranty: e.target.value})}
                  placeholder="Məsələn: 1 il, 2 il"
                />
              </div>
              <div>
                <label>Güc</label>
                <input 
                  type="text" 
                  value={elektronikDetails.power} 
                  onChange={(e) => setElektronikDetails({...elektronikDetails, power: e.target.value})}
                  placeholder="Məsələn: 100W, 220V"
                />
            </div>
          </div>
        </div>
        )}

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


