"use client";

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types';
import { formatIDR } from '../lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const { addToCart, itemCount } = useCart();
  const router = useRouter();

  // Fetch menu
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch menu", err);
        setLoading(false);
      });
  }, []);

  // Hero carousel auto-timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddToCart = (item: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(item);
    
    // Flying image animation to bottom cart icon
    const imgEl = document.getElementById(`menu-img-${item.id}`);
    const cartEl = document.getElementById('floating-cart-btn');

    if (imgEl && item.image) {
      const imgRect = imgEl.getBoundingClientRect();
      const flyingImg = document.createElement('img');
      
      flyingImg.src = item.image;
      flyingImg.style.position = 'fixed';
      flyingImg.style.left = `${imgRect.left}px`;
      flyingImg.style.top = `${imgRect.top}px`;
      flyingImg.style.width = `${imgRect.width}px`;
      flyingImg.style.height = `${imgRect.height}px`;
      flyingImg.style.borderRadius = '50%';
      flyingImg.style.objectFit = 'cover';
      flyingImg.style.zIndex = '9999';
      flyingImg.style.pointerEvents = 'none';
      flyingImg.style.transition = 'all 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      flyingImg.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';

      document.body.appendChild(flyingImg);
      void flyingImg.offsetWidth; // Force reflow
      
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight - 50;

      if (cartEl) {
        const cartRect = cartEl.getBoundingClientRect();
        targetX = cartRect.left + (cartRect.width / 2);
        targetY = cartRect.top + (cartRect.height / 2);
      }

      flyingImg.style.left = `${targetX - 20}px`;
      flyingImg.style.top = `${targetY - 20}px`;
      flyingImg.style.width = '40px';
      flyingImg.style.height = '40px';
      flyingImg.style.opacity = '0.2';
      flyingImg.style.transform = 'scale(0.2)';

      setTimeout(() => {
        if (document.body.contains(flyingImg)) {
          document.body.removeChild(flyingImg);
        }
      }, 550);
    }
  };

  // Filter items based on Category, Search Query, and Price Filter
  const displayedItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = maxPriceFilter ? item.price <= maxPriceFilter : true;
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [items, activeCategory, searchQuery, maxPriceFilter]);

  // Story circular categories with representative images
  const categoryList = [
    { key: 'All', label: 'Semua', image: '/images/menu/nasi_goreng.jpg' },
    { key: 'Mains', label: 'Mains', image: '/images/menu/sate_ayam.jpg' },
    { key: 'Sides', label: 'Sides', image: '/images/menu/truffle_fries.jpg' },
    { key: 'Beverages', label: 'Minuman', image: '/images/menu/kopi_susu.jpg' },
    { key: 'Desserts', label: 'Desserts', image: '/images/menu/pisang_bakar.jpg' },
  ];

  // Hero carousel slides data
  const slides = [
    {
      badge: 'PROMO TERBATAS 🔥',
      title: 'CRISPY. JUICY. IRRESISTIBLE.',
      desc: '100% Olahan Bahan Segar. Disajikan Panas & Gurih.',
      cta: 'Pesan Sekarang ➔',
      img: '/images/menu/ayam_bakar.jpg',
      targetCat: 'Mains'
    },
    {
      badge: 'BESTSELLER PILIHAN ⭐',
      title: 'AUTENTIK NUSANTARA',
      desc: 'Sate Ayam Madura & Nasi Goreng Spesial Bumbu Rahasia.',
      cta: 'Coba Menu Ini ➔',
      img: '/images/menu/nasi_goreng.jpg',
      targetCat: 'Mains'
    },
    {
      badge: 'QRIS CASHBACK 💳',
      title: 'HEMAT S/D 20% HARI INI',
      desc: 'Scan QRIS mudah via GoPay, BCA, OVO, DANA, & ShopeePay.',
      cta: 'Lihat Promo ➔',
      img: '/images/menu/pizza_margherita.jpg',
      targetCat: 'All'
    }
  ];

  return (
    <div style={{ paddingBottom: '1.5rem' }}>
      
      {/* 1. TOP MOBILE HEADER (Matches KFC screenshot) */}
      <header style={{
        padding: '0.85rem 1rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(250, 247, 242, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid rgba(0,0,0,0.03)'
      }}>
        {/* Left: Hamburger Button (Mobile only) */}
        <button 
          onClick={() => setShowDrawer(true)}
          className="mobile-only"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            flexShrink: 0
          }}
          aria-label="Buka Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="16" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Center: Brand & Greeting */}
        <div style={{ textAlign: 'center', flexGrow: 1, padding: '0 0.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <span>Hello, Food Lover!</span>
            <span>👋</span>
          </div>
          <div className="mobile-only" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#c92a2a', letterSpacing: '-0.5px', lineHeight: 1.1, justifyContent: 'center' }}>
            GLORIOUS
          </div>
          <div className="desktop-only" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px', lineHeight: 1.2, justifyContent: 'center' }}>
            Sensasi Kuliner Premium &amp; Fresh Selalu
          </div>
          <div style={{ fontSize: '0.68rem', color: '#8c857b', letterSpacing: '0.2px' }}>
            Pesan langsung dengan praktis, nikmati hidangan lezat hari ini.
          </div>
        </div>

        {/* Right: Notification & Cart Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Notification Button */}
          <button 
            onClick={() => setShowNotif(!showNotif)}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}
            aria-label="Notifikasi"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#e03131',
              color: 'white',
              fontSize: '0.62rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              3
            </span>
          </button>

          {/* Cart Bag Icon Button */}
          <Link 
            href="/cart"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}
            aria-label="Keranjang"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#c92a2a',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}>
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* NOTIFICATION POPOVER */}
      {showNotif && (
        <div style={{
          position: 'fixed',
          top: '65px',
          right: '1rem',
          maxWidth: '320px',
          width: 'calc(100vw - 2rem)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          border: '1px solid var(--border)',
          padding: '1rem',
          zIndex: 150,
          animation: 'slideDown 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Pemberitahuan Promo</span>
            <button onClick={() => setShowNotif(false)} style={{ background: 'none', color: '#adb5bd', fontSize: '1.1rem' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ background: '#fff5f5', padding: '0.6rem', borderRadius: '10px', fontSize: '0.78rem', borderLeft: '3px solid #c92a2a' }}>
              <strong>🎉 Diskon 20% Dine-In:</strong> Berlaku otomatis untuk pemesanan hari ini dengan QRIS!
            </div>
            <div style={{ background: '#f8f9fa', padding: '0.6rem', borderRadius: '10px', fontSize: '0.78rem' }}>
              <strong>🍕 Menu Baru:</strong> Coba Pizza Margherita Artisanal langsung dari oven!
            </div>
          </div>
        </div>
      )}

      {/* 2. SEARCH & FILTER BAR (Matches KFC search bar) */}
      <div className="mobile-px" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem' }}>
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: '14px',
          padding: '0 0.85rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#857e76" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Cari makanan atau minuman favoritmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', color: '#adb5bd', fontSize: '1rem', padding: '0.2rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter / Sliders Button */}
        <button 
          onClick={() => setShowFilterModal(!showFilterModal)}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: maxPriceFilter ? '#c92a2a' : '#ffffff',
            color: maxPriceFilter ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-label="Filter Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      {/* FILTER MODAL POPUP */}
      {showFilterModal && (
        <div className="mobile-px" style={{ marginTop: '0.6rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Filter Harga Cepat:</span>
              <button onClick={() => { setMaxPriceFilter(null); setShowFilterModal(false); }} style={{ background: 'none', color: '#c92a2a', fontSize: '0.75rem', fontWeight: 600 }}>
                Reset
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setMaxPriceFilter(null)} 
                style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: !maxPriceFilter ? '#c92a2a' : '#f5f1eb', color: !maxPriceFilter ? '#fff' : '#495057' }}
              >
                Semua Harga
              </button>
              <button 
                onClick={() => setMaxPriceFilter(30000)} 
                style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: maxPriceFilter === 30000 ? '#c92a2a' : '#f5f1eb', color: maxPriceFilter === 30000 ? '#fff' : '#495057' }}
              >
                &le; Rp 30.000
              </button>
              <button 
                onClick={() => setMaxPriceFilter(45000)} 
                style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: maxPriceFilter === 45000 ? '#c92a2a' : '#f5f1eb', color: maxPriceFilter === 45000 ? '#fff' : '#495057' }}
              >
                &le; Rp 45.000
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HERO CAROUSEL BANNER (Matches KFC "CRISPY. JUICY. IRRESISTIBLE.") */}
      <div className="mobile-px" style={{ marginTop: '1rem' }}>
        <div 
          className="hero-banner-box"
          style={{
            position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #18120e 0%, #291a12 100%)',
          color: '#ffffff',
          padding: '1.25rem',
          minHeight: '175px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Slide Content */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ maxWidth: '62%' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(255, 212, 59, 0.2)',
                color: '#ffd43b',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                padding: '2px 8px',
                borderRadius: '6px',
                marginBottom: '0.4rem',
                border: '1px solid rgba(255, 212, 59, 0.3)'
              }}>
                {slides[activeSlide].badge}
              </span>
              <h2 style={{
                fontSize: '1.18rem',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#ffffff',
                letterSpacing: '-0.3px',
                marginBottom: '0.35rem'
              }}>
                {slides[activeSlide].title}
              </h2>
              <p style={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.3,
                marginBottom: '0.75rem'
              }}>
                {slides[activeSlide].desc}
              </p>
              
              <button 
                onClick={() => {
                  const el = document.getElementById('menu-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  if (slides[activeSlide].targetCat !== 'All') {
                    setActiveCategory(slides[activeSlide].targetCat);
                  }
                }}
                style={{
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(201, 42, 42, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {slides[activeSlide].cta}
              </button>
            </div>

            {/* Slide Image with glow */}
            <div style={{
              width: '105px',
              height: '105px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
              border: '3px solid rgba(255,255,255,0.15)'
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={slides[activeSlide].img} 
                alt="Promo Banner" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Carousel Indicator Dots */}
          <div style={{ display: 'flex', gap: '5px', marginTop: '0.6rem', alignItems: 'center' }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: activeSlide === idx ? '#c92a2a' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.25s ease',
                  padding: 0
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. CIRCULAR CATEGORY STORY ROW (Matches KFC circles) */}
      <div style={{ marginTop: '1.25rem' }}>
        <div 
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            padding: '0 1rem',
            scrollSnapType: 'x mandatory'
          }}
        >
          {categoryList.map(cat => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={(e) => {
                  setActiveCategory(cat.key);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className="category-item"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className={`category-circle-wrapper ${isSelected ? 'active' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.label} className="category-circle-img" />
                </div>
                <span className={`category-label ${isSelected ? 'active' : ''}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. POPULAR COMBOS SECTION HEADER */}
      <div 
        id="menu-section"
        className="mobile-px" 
        style={{ 
          marginTop: '1.5rem', 
          marginBottom: '0.85rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
            {activeCategory === 'All' ? 'Menu Populer 🔥' : `Kategori: ${activeCategory}`}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {displayedItems.length} pilihan menu lezat siap disajikan
          </span>
        </div>

        {activeCategory !== 'All' ? (
          <button 
            onClick={() => setActiveCategory('All')}
            style={{ background: 'none', color: '#c92a2a', fontSize: '0.82rem', fontWeight: 700 }}
          >
            Lihat Semua ➔
          </button>
        ) : (
          <span style={{ color: '#c92a2a', fontSize: '0.82rem', fontWeight: 700 }}>
            Semua Menu ➔
          </span>
        )}
      </div>

      {/* 6. MOBILE 2-COLUMN PRODUCT GRID (KFC Reference Layout) */}
      <div className="mobile-px">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #ede7df', borderTop: '3px solid #c92a2a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menyiapkan menu lezat...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem 1rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <p style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Menu tidak ditemukan</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Coba ubah kata kunci pencarian atau filter harga.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); setMaxPriceFilter(null); }}
              className="btn-primary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.82rem' }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="product-grid-2col">
            {displayedItems.map((item, idx) => {
              const isFav = !!favorites[item.id];
              // Assign badge based on index / category
              let badgeText = 'BESTSELLER';
              let badgeClass = 'badge-bestseller';
              if (item.category === 'Beverages') {
                badgeText = 'FAVORITE';
                badgeClass = 'badge-save';
              } else if (item.category === 'Sides' || idx % 3 === 1) {
                badgeText = 'POPULAR';
                badgeClass = 'badge-popular';
              } else if (idx % 3 === 2) {
                badgeText = 'HEMAT 15%';
                badgeClass = 'badge-save';
              }

              return (
                <div key={item.id} className="mobile-product-card" style={{ opacity: item.isAvailable ? 1 : 0.65 }}>
                  
                  {/* Product Image & Badges */}
                  <div className="product-img-box">
                    <span className={badgeClass}>{badgeText}</span>

                    {/* Favorite Heart Button */}
                    <button 
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="btn-favorite"
                      aria-label="Sukai"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? '#e03131' : 'none'} stroke={isFav ? '#e03131' : '#6b7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Sold out overlay */}
                    {!item.isAvailable && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', padding: '3px 8px', border: '1.5px solid white', borderRadius: '4px', transform: 'rotate(-12deg)' }}>HABIS</span>
                      </div>
                    )}

                    {/* Image element with ID for flying cart animation */}
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img id={`menu-img-${item.id}`} src={item.image} alt={item.name} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '0.75rem' }}>No Image</div>
                    )}
                  </div>

                  {/* Title & Description Snippet */}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.25,
                      marginBottom: '0.2rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.name}
                    </h3>

                    <p style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.3,
                      marginBottom: '0.4rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description || 'Pilihan menu istimewa Glorious'}
                    </p>

                    {/* Rating Row (⭐ 4.8 (1.2k+)) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.6rem', fontSize: '0.72rem' }}>
                      <span style={{ color: '#f59f00', fontSize: '0.85rem' }}>★</span>
                      <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>4.8</strong>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.68rem' }}>(1.2k+)</span>
                    </div>

                    {/* Bottom Row: Price & Round '+' Button */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                        {formatIDR(item.price)}
                      </span>

                      {item.isAvailable ? (
                        <button
                          onClick={(e) => handleAddToCart(item, e)}
                          className="btn-add-plus"
                          title="Tambah ke Keranjang"
                          aria-label={`Tambah ${item.name}`}
                        >
                          +
                        </button>
                      ) : (
                        <button 
                          disabled 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dee2e6', color: '#868e96', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'not-allowed' }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. EXCLUSIVE PROMO BANNER (Matches KFC 30% OFF banner) */}
      <div id="promo-section" className="mobile-px" style={{ marginTop: '1.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #fff3e6 0%, #ffe8d6 100%)',
          borderRadius: '18px',
          padding: '1.1rem',
          border: '1px solid #ffd8a8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 14px rgba(230, 119, 0, 0.08)'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#d9480f', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              PENAWARAN SPESIAL
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#c92a2a', lineHeight: 1.15, marginTop: '2px', marginBottom: '4px' }}>
              Hemat Hingga 20%
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#495057', lineHeight: 1.3, marginBottom: '0.65rem' }}>
              Gunakan pembayaran QRIS pada saat checkout untuk pesanan hari ini.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: '#c92a2a',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '16px',
                boxShadow: '0 3px 8px rgba(201,42,42,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Pesan Sekarang ➔
            </button>
          </div>

          {/* Discount Badge Circle */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e03131 0%, #c92a2a 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 6px 14px rgba(201, 42, 42, 0.4)',
            border: '2px solid white'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>20%</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' }}>OFF</span>
          </div>
        </div>
      </div>

      {/* 8. SLIDE-IN MOBILE DRAWER (SIDEBAR) */}
      {showDrawer && (
        <>
          <div 
            onClick={() => setShowDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 998,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '82%',
            maxWidth: '340px',
            background: '#ffffff',
            zIndex: 999,
            boxShadow: '4px 0 25px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInLeft 0.25s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.5rem 1.25rem',
              background: 'linear-gradient(135deg, #18120e 0%, #2b1d14 100%)',
              color: 'white',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#c92a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', color: 'white', marginBottom: '0.75rem' }}>
                G
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>GLORIOUS RESTO</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Table &amp; Online Ordering System</p>
            </div>

            {/* Drawer Menu List */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1, overflowY: 'auto' }}>
              
              <div style={{ background: '#faf7f2', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Jam Operasional Resto:</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Setiap Hari: 10.00 - 22.00 WIB</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

              <Link 
                href="/" 
                onClick={() => setShowDrawer(false)}
                style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', color: '#c92a2a', background: '#fff5f5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <span>🏠</span> Home &amp; Menu
              </Link>

              <Link 
                href="/cart" 
                onClick={() => setShowDrawer(false)}
                style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🛍️</span> Keranjang Belanja
                </div>
                {itemCount > 0 && (
                  <span style={{ background: '#c92a2a', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noreferrer"
                style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <span>💬</span> Bantuan Kasir / Pelayan
              </a>

              <Link 
                href="/admin/login" 
                onClick={() => setShowDrawer(false)}
                style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <span>🔐</span> Admin &amp; Staff Login
              </Link>
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              &copy; {new Date().getFullYear()} Glorious Resto &bull; Mobile Web Experience
            </div>
          </div>
        </>
      )}

      {/* Spin animation helper */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
}
