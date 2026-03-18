import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import { API_BASE_URL } from '../config/apiBaseUrl';

const API_BASE = `${API_BASE_URL}/logistique`;

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = {
        menu: '/menu-items',
        promotions: '/promotions',
        suppliers: '/suppliers',
        franchises: '/franchises'
      };
      
      const response = await fetch(`${API_BASE}${endpoints[activeTab]}`);
      if (!response.ok) throw new Error('Impossible de charger les données');
      const data = await response.json();
      
      const setters = {
        menu: setMenuItems,
        promotions: setPromotions,
        suppliers: setSuppliers,
        franchises: setFranchises
      };
      setters[activeTab](data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoints = {
      menu: '/menu-items',
      promotions: '/promotions',
      suppliers: '/suppliers',
      franchises: '/franchises'
    };
    
    const url = editingItem 
      ? `${API_BASE}${endpoints[activeTab]}/${editingItem.id}`
      : `${API_BASE}${endpoints[activeTab]}`;
    
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Impossible de sauvegarder');
      await fetchData();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    const endpoints = {
      menu: '/menu-items',
      promotions: '/promotions',
      suppliers: '/suppliers',
      franchises: '/franchises'
    };

    try {
      const response = await fetch(`${API_BASE}${endpoints[activeTab]}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Impossible de supprimer');
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(false);
  };

  const renderTabs = () => (
    <div className="admin-tabs">
      <button 
        className={activeTab === 'menu' ? 'active' : ''} 
        onClick={() => { setActiveTab('menu'); resetForm(); }}
      >
        Menu
      </button>
      <button 
        className={activeTab === 'promotions' ? 'active' : ''} 
        onClick={() => { setActiveTab('promotions'); resetForm(); }}
      >
        Promotions
      </button>
      <button 
        className={activeTab === 'suppliers' ? 'active' : ''} 
        onClick={() => { setActiveTab('suppliers'); resetForm(); }}
      >
        Fournisseurs
      </button>
      <button 
        className={activeTab === 'franchises' ? 'active' : ''} 
        onClick={() => { setActiveTab('franchises'); resetForm(); }}
      >
        Franchises
      </button>
    </div>
  );

  const renderForm = () => {
    if (!showForm) return null;

    const formFields = {
      menu: (
        <>
          <div className="form-group">
            <label>Nom *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="ex: Burger Classique" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="ex: Steak de bœuf juteux" rows="3" />
          </div>
          <div className="form-group">
            <label>Prix (€) *</label>
            <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} required step="0.01" min="0" placeholder="ex: 12.99" />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {formData.image && <div className="image-preview"><img src={formData.image} alt="Aperçu" /></div>}
          </div>
        </>
      ),
      promotions: (
        <>
          <div className="form-group">
            <label>Nom de la promotion *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="ex: Happy Hour" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="2" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type || 'percentage'} onChange={handleInputChange}>
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Valeur *</label>
              <input type="number" name="value" value={formData.value || ''} onChange={handleInputChange} required step="0.01" placeholder="ex: 20" />
            </div>
          </div>
          <div className="form-group">
            <label>Code promo</label>
            <input type="text" name="code" value={formData.code || ''} onChange={handleInputChange} placeholder="ex: SUMMER20" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date début *</label>
              <input type="datetime-local" name="startDate" value={formData.startDate || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Date fin *</label>
              <input type="datetime-local" name="endDate" value={formData.endDate || ''} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="active" checked={formData.active !== false} onChange={handleInputChange} />
              Promotion active
            </label>
          </div>
        </>
      ),
      suppliers: (
        <>
          <div className="form-group">
            <label>Nom de l'entreprise *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="ex: Boucherie Dupont" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact *</label>
              <input type="text" name="contact" value={formData.contact || ''} onChange={handleInputChange} required placeholder="Nom du contact" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required placeholder="contact@exemple.fr" />
            </div>
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="ex: 06 12 34 56 78" />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows="2" />
          </div>
          <div className="form-group">
            <label>Catégories</label>
            <input type="text" name="categories" value={formData.categories?.join(', ') || ''} onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value.split(',').map(s => s.trim()) }))} placeholder="ex: viande, légumes, boissons" />
          </div>
        </>
      ),
      franchises: (
        <>
          <div className="form-group">
            <label>Nom du restaurant *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="ex: Good Food Rouen" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ville *</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} required placeholder="ex: Rouen" />
            </div>
            <div className="form-group">
              <label>Code postal *</label>
              <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={handleInputChange} required placeholder="ex: 76000" />
            </div>
          </div>
          <div className="form-group">
            <label>Adresse *</label>
            <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} required placeholder="ex: 36 rue Saint-Sever" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gérant</label>
              <input type="text" name="manager" value={formData.manager || ''} onChange={handleInputChange} placeholder="Nom du gérant" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="restaurant@goodfood.fr" />
            </div>
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="ex: 02 35 12 34 56" />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="active" checked={formData.active !== false} onChange={handleInputChange} />
              Restaurant actif
            </label>
          </div>
        </>
      )
    };

    const titles = {
      menu: editingItem ? 'Modifier l\'article' : 'Ajouter un article',
      promotions: editingItem ? 'Modifier la promotion' : 'Créer une promotion',
      suppliers: editingItem ? 'Modifier le fournisseur' : 'Ajouter un fournisseur',
      franchises: editingItem ? 'Modifier la franchise' : 'Ajouter une franchise'
    };

    return (
      <div className="form-modal">
        <div className="form-content">
          <h3>{titles[activeTab]}</h3>
          <form onSubmit={handleSubmit}>
            {formFields[activeTab]}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>Annuler</button>
              <button type="submit" className="submit-btn">{editingItem ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const data = { menu: menuItems, promotions, suppliers, franchises }[activeTab];
    
    if (loading) return <div className="admin-loading">Chargement...</div>;
    
    const emptyMessages = {
      menu: 'Aucun article. Cliquez sur "Ajouter" pour commencer.',
      promotions: 'Aucune promotion active.',
      suppliers: 'Aucun fournisseur enregistré.',
      franchises: 'Aucune franchise enregistrée.'
    };

    if (data.length === 0) {
      return <div className="empty-state">{emptyMessages[activeTab]}</div>;
    }

    return (
      <div className="data-grid">
        {activeTab === 'menu' && data.map(item => (
          <div key={item.id} className="data-card">
            {item.image && <div className="card-image"><img src={item.image} alt={item.name} /></div>}
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="card-price">{parseFloat(item.price).toFixed(2)}€</span>
            </div>
            <p className="card-desc">{item.description || 'Pas de description'}</p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>Modifier</button>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        
        {activeTab === 'promotions' && data.map(item => (
          <div key={item.id} className="data-card">
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="card-badge">{item.type === 'percentage' ? `${item.value}%` : `${item.value}€`}</span>
            </div>
            <p className="card-desc">{item.description || 'Pas de description'}</p>
            <p className="card-meta">
              {item.code && <span>Code: <strong>{item.code}</strong></span>}
              <span>{new Date(item.startDate).toLocaleDateString('fr-FR')} - {new Date(item.endDate).toLocaleDateString('fr-FR')}</span>
            </p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>Modifier</button>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        
        {activeTab === 'suppliers' && data.map(item => (
          <div key={item.id} className="data-card">
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="card-badge secondary">{item.categories?.join(', ') || 'N/A'}</span>
            </div>
            <p className="card-meta">
              <span>{item.contact}</span>
              <span>{item.email}</span>
              {item.phone && <span>{item.phone}</span>}
            </p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>Modifier</button>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        
        {activeTab === 'franchises' && data.map(item => (
          <div key={item.id} className="data-card">
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="card-badge">{item.city}</span>
            </div>
            <p className="card-desc">{item.address}</p>
            <p className="card-meta">
              {item.manager && <span>{item.manager}</span>}
              {item.phone && <span>{item.phone}</span>}
            </p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>Modifier</button>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const addLabels = {
    menu: '+ Ajouter un article',
    promotions: '+ Créer une promotion',
    suppliers: '+ Ajouter un fournisseur',
    franchises: '+ Ajouter une franchise'
  };

  const countLabels = {
    menu: 'Articles',
    promotions: 'Promotions',
    suppliers: 'Fournisseurs',
    franchises: 'Franchises'
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel Admin - Good Food</h1>
        <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {renderTabs()}

      <div className="admin-content">
        <div className="admin-toolbar">
          <h2>{countLabels[activeTab]} ({activeTab === 'menu' ? menuItems.length : activeTab === 'promotions' ? promotions.length : activeTab === 'suppliers' ? suppliers.length : franchises.length})</h2>
          <button className="add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            {addLabels[activeTab]}
          </button>
        </div>

        {renderContent()}
      </div>

      {showForm && renderForm()}
    </div>
  );
}

export default AdminDashboard;
