import React, { useState } from 'react';
import api from '../services/api';

export default function LoginModal({ onClose }) {
  const [profileType, setProfileType] = useState('Client'); // 'Client' أو 'Vendeur'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('auth/login/', {
        email: email,
        mot_de_passe: password,
      });

      const userRole = response.data.user.role;
      if (userRole !== profileType) {
        setError(`Ce compte n'est pas un compte ${profileType}.`);
        return;
      }

      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Connexion réussie !');
      window.location.reload();
      
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      console.error(err);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
    }}>
      <div style={{ background: '#0b1329', padding: '30px', borderRadius: '12px', width: '400px', color: 'white', position: 'relative' }}>
        
        {/* زر الإغلاق */}
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>
          ✕
        </button>

        <h2 style={{ color: '#ffc107', marginBottom: '20px', fontSize: '18px' }}>CONNEXION À L'ESPACE</h2>
        
        {error && <p style={{ color: '#ff4d4d', fontSize: '13px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            type="button"
            onClick={() => setProfileType('Client')}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              background: profileType === 'Client' ? '#ffc107' : '#1f293d', 
              color: profileType === 'Client' ? '#000' : '#fff' 
            }}
          >
            🛒 CLIENT
          </button>
          <button 
            type="button"
            onClick={() => setProfileType('Vendeur')}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              background: profileType === 'Vendeur' ? '#ffc107' : '#1f293d', 
              color: profileType === 'Vendeur' ? '#000' : '#fff' 
            }}
          >
            🏢 VENDEUR
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>ADRESSE EMAIL</label>
          <input 
            type="email" 
            placeholder="name@spatial.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#050b14', color: 'white', marginBottom: '15px' }}
          />

          <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>MOT DE PASSE</label>
          <input 
            type="password" 
            placeholder="********" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#050b14', color: 'white', marginBottom: '20px' }}
          />

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#ffc107', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
            SE CONNECTER
          </button>
        </form>
      </div>
    </div>
  );
}