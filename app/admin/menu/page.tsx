"use client";

import { useEffect, useState } from 'react';
import { MenuItem } from '../../../types';
import { formatIDR } from '../../../lib/utils';

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [image, setImage] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, category, image })
      });
      if (res.ok) {
        setName(''); setDescription(''); setPrice(''); setImage(''); setCategory('Mains');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to update availability');
    }
  };

  if (loading) return <h2>Loading Menu...</h2>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Menu Management</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* ADD ITEM FORM */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New Item</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name*</label>
              <input type="text" required className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
              <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Price (IDR)*</label>
              <input type="number" step="100" required className="input-field" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 25000" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Category*</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Starters">Starters</option>
                <option value="Mains">Mains</option>
                <option value="Sides">Sides</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Image URL / Path (Optional)</label>
              <input type="text" placeholder="https://... atau /images/menu/nama_file.jpg" className="input-field" value={image} onChange={e => setImage(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={formLoading} style={{ marginTop: '1rem' }}>
              {formLoading ? 'Adding...' : 'Add Menu Item'}
            </button>
          </form>
        </div>

        {/* LIST EXISTING ITEMS */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Current Menu Items</h3>
          
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items yet. Add one to see it here.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#e9ecef', flexShrink: 0, borderRadius: '4px' }}>
                    {item.image ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : null}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.category} • {formatIDR(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button 
                      onClick={() => handleToggleAvailable(item)}
                      style={{ 
                        background: item.isAvailable ? '#d3f9d8' : '#ffe3e3', 
                        color: item.isAvailable ? '#2b8a3e' : '#c92a2a', 
                        border: '1px solid',
                        borderColor: item.isAvailable ? '#b2f2bb' : '#ffc9c9',
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.isAvailable ? '✓ Tersedia' : '✕ Habis'}
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', color: '#868e96', border: '1px solid #dee2e6', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
