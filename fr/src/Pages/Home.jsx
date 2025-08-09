import React, { useState } from 'react'
import './Home.css'
import { BsRocketFill } from "react-icons/bs";
import { MdSmartphone } from "react-icons/md";
import { CiCreditCard1 } from "react-icons/ci";
import { CiBitcoin } from "react-icons/ci";
import { useEffect } from 'react';

const Home = () => {
  const [showMore, setShowMore] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const faqData = [
    { q: 'Heshop nədir? Necə işləyir?', a: 'Heshop, məhsullarınızı və xidmətlərinizi onlayn satmaq üçün sadə və təhlükəsiz platformadır.' },
    { q: 'Heshop etibarlıdır? Təhlükəsizdirmi?', a: 'Bəli, bütün ödənişlər SSL ilə qorunur və şəxsi məlumatlarınız gizli saxlanılır.' },
    { q: 'Hesab açmaq üçün hansı sənədlər lazımdır?', a: 'Sadəcə telefon nömrəsi və e-mail kifayətdir. Əlavə sənəd tələb olunmur.' },
    { q: 'Hesab açmaq üçün yaş məhdudiyyəti varmı?', a: 'Bəli, minimum 18 yaş tələb olunur.' },
    { q: 'Komissiya və ödənişlər necədir?', a: 'Heshop-da ilk ay komissiya yoxdur, sonrakı dövrdə isə minimal komissiya tətbiq olunur.' },
    { q: 'Məhsul əlavə etmək üçün nə etməliyəm?', a: 'Paneldən “Məhsul əlavə et” düyməsini istifadə edin.' },
    { q: 'Ödənişlər necə köçürülür?', a: 'Ödənişlər bank hesabınıza həftəlik köçürülür.' },
    { q: 'Müştəri dəstəyi necə işləyir?', a: '24/7 canlı dəstək mövcuddur.' },
    { q: 'Mağazanı necə silə bilərəm?', a: 'Paneldən “Mağazanı sil” seçimini istifadə edin.' },
    { q: 'Bir neçə mağaza aça bilərəm?', a: 'Bəli, bir neçə mağaza açmaq mümkündür.' },
    { q: 'Satışlarımı necə izləyə bilərəm?', a: 'Paneldə satış statistikalarınızı görə bilərsiniz.' },
    { q: 'Promo kod əlavə etmək mümkündürmü?', a: 'Bəli, kampaniyalar üçün promo kod əlavə edə bilərsiniz.' },
    { q: 'Məhsul şəkilləri üçün limit varmı?', a: 'Hər məhsul üçün 10 şəkil yükləyə bilərsiniz.' },
  ];

  return (
    <>
      <section className='one' >
        <div className="container">
          <div className="left">
            <h1>Onlayn Satışa <strong>Asan Başla</strong></h1>
            <p>
              Öz məhsullarınızı və xidmətlərinizi sürətli, təhlükəsiz və komissiyasız şəkildə satmaq üçün Heshop platformasına qoşulun! Heç bir texniki bilik olmadan, bir neçə dəqiqəyə öz onlayn mağazanızı yaradın və satışlarınızı artırın.
            </p>

            <div className="features">
              <div className="feature">
                <span className="feature-icon"><BsRocketFill /></span>
                <span>1 dəqiqəyə qeydiyyat və dərhal satışa başla</span>
              </div>
              <div className="feature">
                <span className="feature-icon"><MdSmartphone /></span>
                <span>Mobil və masaüstü üçün tam uyğun interfeys</span>
              </div>
              <div className="feature">
                <span className="feature-icon"><CiCreditCard1 /></span>
                <span>Komissiyasız və təhlükəsiz ödəniş sistemi</span>
              </div>
              <div className="feature">
                <span className="feature-icon"><CiBitcoin /></span>
                <span>Satış və ödənişlərə real vaxtda nəzarət</span>
              </div>
            </div>
          </div>

          <div className="right">
            <img src="/back.webp" alt="Heshop Azərbaycan" />
          </div>
        </div>
      </section>

      <section className="testimonials-slider">
        <h2>Müştəri rəyləri</h2>
        <div className="testimonial-slider-track">
          {[
            { name: "Aysel M.", text: "Çox rahat və sürətli! Məhsulum tez satıldı." },
            { name: "Elvin Q.", text: "Heshop sayəsində yeni müştərilər qazandım." },
            { name: "Nigar R.", text: "Ödənişlər çox təhlükəsiz və problemsizdir." },
            { name: "Murad S.", text: "Platforma çox istifadəyə rahatdır." },
            { name: "Leyla T.", text: "Satışlarım artdı, təşəkkürlər!" },
            { name: "Rəşad B.", text: "Müştəri dəstəyi əladır." },
            { name: "Günel K.", text: "Mobil tətbiq çox işimə yaradı." },
            { name: "Samir D.", text: "Komissiyasız satış imkanı superdir." },
            { name: "Aytac F.", text: "Hər kəsə tövsiyə edirəm." },
            { name: "Orxan Z.", text: "Çatdırılma və ödəniş çox sürətli." },
            { name: "Zaur M.", text: "İlk satışımı 1 günə etdim!" },
            { name: "Sevinc N.", text: "İnterfeys çox sadə və rahatdır." },
            { name: "Kamran H.", text: "Məhsullarımı asanlıqla əlavə etdim." },
            { name: "Lalə Q.", text: "Hər şey avtomatik işləyir." },
            { name: "Tural S.", text: "Satıcılar üçün ideal platformadır." },
            { name: "Aygün V.", text: "Müştəri tapmaq çox asan oldu." },
            { name: "Rövşən E.", text: "Təhlükəsiz ödəniş sistemi çox rahatdır." },
            { name: "Nurlan P.", text: "Daim yenilənir və inkişaf edir." },
            { name: "Fidan Ş.", text: "Dostlarım da istifadə edir." },
            { name: "Elgün İ.", text: "Ən yaxşı e-ticarət platforması!" },
            { name: "Zəhra Y.", text: "Satışlarımda böyük artım oldu." },
            { name: "Səidə Ə.", text: "Hər şey üçün təşəkkürlər!" },
            { name: "Ramil K.", text: "Sürətli qeydiyyat və satış." },
            { name: "Ülviyyə M.", text: "Müştəri məmnuniyyəti yüksəkdir." },
            { name: "Əli C.", text: "Tövsiyə edirəm!" },
            { name: "Nigar S.", text: "Satıcılar üçün çox rahatdır." },
            { name: "Eldar T.", text: "Hər şey gözlədiyimdən yaxşıdır." },
            { name: "Aytən Q.", text: "Platforma çox funksionaldır." },
            { name: "Rəna H.", text: "Satışlarım asanlıqla idarə olunur." },
            { name: "Səid M.", text: "Əla dizayn və istifadə rahatlığı." }
          ].map((item, i) => (
            <div className="testimonial-slide" key={i}>
              <img style={{ width: '50px', height: '50px', borderRadius: '50%' }} src="/profil.png" alt="" />
              <div className="testimonial-stars">★★★★★</div>
              <p>“{item.text}”</p>
              <span className="testimonial-name">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-app-section">
        <div className="mobile-app-bg"></div>
        <div className="mobile-app-content">
          <div className="mobile-app-left">
            <h2>Mobil tətbiq ilə hər yerdə satış!</h2>
            <p>
              Sifarişləriniz və satışlarınız barədə anında məlumat alın, bütün e-ticarət əməliyyatlarınızı mobil cihazınızdan rahatlıqla idarə edin.
            </p>
            <div className="app-buttons">
              <a href="#" className="playstore-button">
                <span className="icon">
                  <svg
                    fill="currentcolor"
                    viewBox="-52.01 0 560.035 560.035"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655"
                      ></path>
                    </g>
                  </svg>
                </span>
                <span className="texts">
                  <span className="text-1">Download form</span>
                  <span className="text-2">App store</span>
                </span>
              </a>
              <a className="playstore-button" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="icon" viewBox="0 0 512 512">
                  <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
                </svg>
                <span className="texts">
                  <span className="text-1">GET IT ON</span>
                  <span className="text-2">Google Play</span>
                </span>
              </a>
            </div>
          </div>
          <div className="mobile-app-right">
            <img src="/tel.png" alt="Mobil tətbiq ekranı" />
          </div>
        </div>
      </section>

      <hr />

      <section className="faq-section" id="faq">
        <h2 className="faq-title">FAQ</h2>
        <div className="faq-list">
          {faqData.slice(0, showMore ? faqData.length : 5).map((item, i) => (
            <div className={`faq-item custom-accordion${openIndex === i ? ' open' : ''}`} key={i}>
              <button className="faq-summary" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{item.q}</span>
                <span className="faq-toggle-icon">{openIndex === i ? '-' : '+'}</span>
              </button>
              <div className="faq-answer" style={{
                maxHeight: openIndex === i ? '200px' : '0',
                opacity: openIndex === i ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s',
                overflow: 'hidden',
                padding: openIndex === i ? '0 22px 14px 22px' : '0 22px',
              }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="faq-more-btn" onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Daha az ⏶' : 'Daha çox ⏷ '}
        </button>
      </section>
      <hr />
      <section className='başla'>
        <div className="start">
          <h2>Praktik və peşəkar e-ticarət artıq mümkündür!</h2>
          <p>Hesab yaratmaq tamamilə pulsuzdur. Yalnız 3 dəqiqəyə satışa başlayın.</p>
          <button>Qeydiyyatdan keçin – Pulsuzdur</button>
        </div>
      </section>
    </>
  )
}

export default Home