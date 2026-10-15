import React, { useState, useEffect } from 'react';

export default function PaymentModal({ bien, actionType, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('carte');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // حقول الدفع الحقيقي
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardType, setCardType] = useState('');
  
  const [flouciPhone, setFlouciPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // للتبادل (Échange)
  const [allBiens, setAllBiens] = useState([]);
  const [selectedExchangeBien, setSelectedExchangeBien] = useState('');

  const isAchat = actionType === 'acheter';
  const isLouer = actionType === 'louer';
  const isEchanger = actionType === 'echanger';

  // تحديد نوع البطاقة تلقائياً بناءً على أول 4 أرقام
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length >= 4) {
      const prefix4 = cleanNum.substring(0, 4);
      const prefix1 = cleanNum.charAt(0);
      
      if (prefix1 === '4') {
        setCardType('Visa');
      } else if (prefix1 === '5' || prefix1 === '2') {
        setCardType('Mastercard');
      } else if (prefix4 === '1000' || prefix4 === '3700') {
        setCardType('Konnect / CIB');
      } else {
        setCardType('Carte Bancaire');
      }
    } else {
      setCardType('');
    }
  }, [cardNumber]);

  // جلب العقارات للتبادل
  useEffect(() => {
    if (isEchanger) {
      fetch("http://127.0.0.1:8000/localisation-sigs/")
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(item => item.id !== bien.id);
          setAllBiens(filtered);
        })
        .catch(err => console.error("Error fetching biens for exchange:", err));
    }
  }, [isEchanger, bien.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isAchat || isLouer) {
      if (paymentMethod === 'carte' && (!cardNumber || !cardExpiry || !cardCvc)) {
        setErrorMessage("Veuillez remplir toutes les informations de la carte bancaire !");
        return;
      }
      if (paymentMethod === 'flouci' && !flouciPhone) {
        setErrorMessage("Veuillez entrer votre numéro de téléphone Flouci !");
        return;
      }
      if (paymentMethod === 'paypal' && !paypalEmail) {
        setErrorMessage("Veuillez entrer votre adresse email PayPal !");
        return;
      }
    } else if (isEchanger && !selectedExchangeBien) {
      setErrorMessage("Veuillez sélectionner un bien immobilier pour l'échange !");
      return;
    }

    setLoading(true);

    // محاكاة الاتصال الحقيقي ببوابة الدفع (Gateway API Simulation)
    // هنا يتم التحقق الفعلي هل الحساب فيه رصيد ولا لا
    setTimeout(() => {
      setLoading(false);

      // محاكاة قاعدة بيانات وهمية للمستخدم (مثال: رصيده 0 دينار أو بطاقة غير فارغة)
      // إذا كانت البطاقة تبدأ بـ '0000' أو فارغة محاكاة لرصيد صفر، نرفض العملية
      const cleanCard = cardNumber.replace(/\s+/g, '');
      const isBalanceZero = cleanCard.startsWith('0000') || bien.prix > 10000000; // مثال محاكاة

      if (!isEchanger && (cleanCard === '1234567812345678' || flouciPhone === '00000000' || isBalanceZero)) {
        setErrorMessage("❌ Échec du paiement : Solde insuffisant ou compte non approvisionné ! Veuillez vérifier votre solde.");
        return;
      }

      // إذا عدى التحقق بنجاح
      setSuccessMessage(isEchanger ? '🔄 Demande d\'échange enregistrée avec succès !' : '🎉 Paiement validé et sécurisé avec succès ! Transaction enregistrée.');
      
      // إرسال البيانات للـ Backend الخاص بك إذا لزم الأمر
      // fetch('http://127.0.0.1:8000/api/paiement/', { method: 'POST', ... })

      setTimeout(() => {
        onClose();
      }, 2200);

    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000,
      fontFamily: 'Inter, system-ui, sans-serif',
      direction: 'ltr',
      textAlign: 'left'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        color: '#f8fafc',
        padding: '30px',
        borderRadius: '20px',
        width: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
            {isAchat && '🛒 Achat Sécurisé'}
            {isLouer && '🔑 Location Sécurisée'}
            {isEchanger && '🔄 Échange de bien'}
          </h2>
          <button 
            onClick={onClose}
            style={{ background: '#334155', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Property Summary */}
        <div style={{ 
          background: '#0f172a', 
          border: '1px solid #334155', 
          padding: '14px 16px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          fontSize: '13px',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div>📍 <strong style={{color: '#cbd5e1'}}>Ville:</strong> {bien.ville || 'N/A'}</div>
          <div>🏠 <strong style={{color: '#cbd5e1'}}>Type:</strong> {bien.type_bien || 'N/A'}</div>
          <div>💰 <strong style={{color: '#cbd5e1'}}>Montant Total:</strong> <span style={{ color: '#34d399', fontWeight: '700' }}>{bien.prix || 0} DT</span></div>
        </div>

        {/* رسائل الخطأ أو النجاح الحقيقية */}
        {errorMessage && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', padding: '14px', borderRadius: '10px', fontWeight: '600', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        {successMessage ? (
          <div style={{ background: '#064e3b', color: '#34d399', border: '1px solid #059669', padding: '18px', borderRadius: '12px', fontWeight: '600', textAlign: 'center', fontSize: '15px' }}>
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isEchanger && (
              <>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                  Sélectionnez le mode de paiement :
                </label>
                
                {/* Options Logos Payment Methods */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  
                  {/* Carte Bancaire */}
                  <div 
                    onClick={() => setPaymentMethod('carte')}
                    style={{
                      background: paymentMethod === 'carte' ? '#334155' : '#0f172a',
                      border: paymentMethod === 'carte' ? '2px solid #38bdf8' : '1px solid #334155',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>💳</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#f8fafc' }}>Carte Bancaire</span>
                  </div>

                  {/* Flouci Logo */}
                  <div 
                    onClick={() => setPaymentMethod('flouci')}
                    style={{
                      background: paymentMethod === 'flouci' ? '#334155' : '#0f172a',
                      border: paymentMethod === 'flouci' ? '2px solid #38bdf8' : '1px solid #334155',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '26px', 
                      height: '26px', 
                      background: 'linear-gradient(135deg, #f97316, #ea580c)', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>فل</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#f8fafc' }}>Flouci</span>
                  </div>

                  {/* PayPal Logo */}
                  <div 
                    onClick={() => setPaymentMethod('paypal')}
                    style={{
                      background: paymentMethod === 'paypal' ? '#334155' : '#0f172a',
                      border: paymentMethod === 'paypal' ? '2px solid #38bdf8' : '1px solid #334155',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '26px', 
                      height: '26px', 
                      background: '#003087', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#0079C1',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <span style={{ color: '#0079C1', textShadow: '0 0 1px #003087' }}>P</span>
                      <span style={{ color: '#00457C', marginLeft: '-3px' }}>P</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#f8fafc' }}>PayPal</span>
                  </div>
                </div>

                {/* تفاصيل البطاقة البنكية */}
                {paymentMethod === 'carte' && (
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Numéro de carte</label>
                      {cardType && (
                        <span style={{ background: '#0284c7', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          ✨ {cardType}
                        </span>
                      )}
                    </div>
                    <input 
                      type="text" 
                      placeholder="4000 1234 5678 9010" 
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '14px', outline: 'none', letterSpacing: '1px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Expiration</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>CVC</label>
                        <input 
                          type="password" 
                          placeholder="123" 
                          maxLength="3"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* تفاصيل تطبيق فلوسي */}
                {paymentMethod === 'flouci' && (
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>فل</div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Compte Flouci (Téléphone)</label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="+216 20 123 456" 
                      value={flouciPhone}
                      onChange={(e) => setFlouciPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                )}

                {/* تفاصيل حساب باي بال */}
                {paymentMethod === 'paypal' && (
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#003087', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0079C1', fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic' }}>P</div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Email PayPal</label>
                    </div>
                    <input 
                      type="email" 
                      placeholder="nom.utilisateur@gmail.com" 
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                )}
              </>
            )}

            {/* عملية التبادل (Échange) */}
            {isEchanger && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                  Sélectionnez votre bien pour l'échange :
                </label>
                <select 
                  value={selectedExchangeBien} 
                  onChange={(e) => setSelectedExchangeBien(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #475569', fontSize: '13px', background: '#0f172a', color: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Choisissez un de vos biens --</option>
                  {allBiens.map((item) => (
                    <option key={item.id} value={item.id}>
                      📍 {item.ville} - {item.type_bien} ({item.prix} DT)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  flex: 1, 
                  background: isEchanger ? '#059669' : '#0284c7', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  transition: 'background 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Vérification du solde & Paiement...' : (isEchanger ? 'Confirmer l\'échange' : `Payer ${bien.prix || 0} DT`)}
              </button>
              <button 
                type="button" 
                onClick={onClose}
                style={{ 
                  background: '#334155', 
                  color: '#cbd5e1', 
                  border: 'none', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}