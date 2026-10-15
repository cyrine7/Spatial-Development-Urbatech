import React, { useState, useEffect } from 'react';

export default function ServiceCommercial() {
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom: '', tel: '', details: '' });

  const [offices, setOffices] = useState([]);
  const [loadingOffices, setLoadingOffices] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user')) || { role: 'client' }; 
  const isAdminOrOffice = currentUser.role === 'admin' || currentUser.role === 'office'; 

  useEffect(() => {
    fetch('http://127.0.0.1:8000/office-consulting/')
      .then((res) => res.json())
      .then((data) => {
        setOffices(data);
        setLoadingOffices(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des offices:", err);
        setLoadingOffices(false);
      });
  }, []);

  const servicesData = [
    {
      id: "juridique",
      title: "Service Juridique",
      icon: "⚖️",
      desc: "Suivi légal complet, validation des contrats de vente, et mise en conformité des titres fonciers.",
      details: "Notre équipe d'experts vérifie la validité des Titres Bleus, rédige les compromis de vente sécurisés et vous accompagne chez le notaire pour éviter tout litige foncier en Tunisie."
    },
    {
      id: "urbanistique",
      title: "Service d'Étude Urbanistique",
      icon: "📐",
      desc: "Analyses géospatiales poussées, plans de lotissement et études d'impact.",
      details: "Nous réalisons des divisions de parcelles, l'analyse des plans d'aménagement urbain (PAU), et l'évaluation technique de l'accessibilité aux réseaux d'infrastructure (STEG, SONEDE)."
    },
    {
      id: "commercial",
      title: "Service Commercial",
      icon: "💼",
      desc: "Négociation stratégique, mise en valeur des parcelles et mise en relation investisseurs.",
      details: "Nous gérons la promotion de votre bien auprès d'un réseau d'investisseurs qualifiés nationaux et internationaux pour garantir une vente rapide au meilleur prix du marché."
    },
    {
      id: "paiement",
      title: "Service Paiement",
      icon: "💳",
      desc: "Transactions sécurisées, passerelles bancaires et solutions de financement.",
      details: "Sécurisation totale des fonds via séquestre ou virement bancaire certifié. Nous vous orientons également vers les meilleures solutions de crédit immobilier."
    }
  ];

  const closeModal = () => {
    setSelectedService(null);
    setShowForm(false);
    setFormData({ nom: '', tel: '', details: '' });
  };

  // 🔄 التعديل الأساسي هنا: إرسال الداتا بـ POST request عوضاً عن الـ alert القديم
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/demandes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedService.title,
          nom: formData.nom,
          telephone: formData.tel,
          details: formData.details,
        }),
      });

      if (response.ok) {
        alert(`🚀 Succès! Demande pour [${selectedService.title}] envoyée et enregistrée avec succès.`);
        closeModal();
      } else {
        alert("Oups! Erreur lors de l'enregistrement de la demande dans la base de données.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Impossible de contacter le serveur Django. Vérifiez qu'il est bien en marche !");
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
        <span>📋</span> Vos Services Immobiliers &amp; Urbanistiques
      </h3>

      {/* GRID DES SERVICES CLIQUABLES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {servicesData.map((svc) => (
          <div 
            key={svc.id}
            onClick={() => setSelectedService(svc)}
            className="bg-[#0c192c] border border-slate-800 p-5 rounded-xl shadow-xl hover:border-yellow-500 transition-all duration-300 cursor-pointer hover:-translate-y-1 group flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl p-2 bg-slate-900 w-fit rounded-lg mb-3 border border-slate-800 group-hover:border-yellow-500/40 transition">
                {svc.icon}
              </div>
              <h4 className="font-bold text-sm text-yellow-500 mb-2 tracking-wide group-hover:text-yellow-400">
                {svc.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {svc.desc}
              </p>
            </div>
            <div className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-wider mt-4 flex items-center gap-1 group-hover:text-yellow-400">
              En savoir plus <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION OFFRES (Visible Admin/Office فقط) */}
      {isAdminOrOffice && (
        <div className="mt-8 bg-[#0c192c]/50 border border-slate-800 p-5 rounded-xl">
          <h4 className="text-sm font-bold text-yellow-500 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span>🏢</span> Offices de Consulting Connectés (Django API)
          </h4>
          {loadingOffices ? (
            <p className="text-xs text-gray-400">Chargement des bureaux...</p>
          ) : offices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {offices.map((office) => (
                <div key={office.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">{office.nom_office}</span>
                  <span className="text-[11px] text-gray-400">📞 {office.telephone || 'Non spécifié'}</span>
                  <span className="text-[11px] text-gray-400">✉️ {office.email || 'Non spécifié'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Aucun office enregistré pour le moment.</p>
          )}
        </div>
      )}

      {/* MODAL POPUP */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#0c192c] border border-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full transition-all">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedService.icon}</span>
                <h3 className="text-lg font-black text-yellow-500">{selectedService.title}</h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            {/* Content Switch: Info ou Formulaire */}
            {!showForm ? (
              <>
                <p className="text-sm text-gray-300 leading-relaxed mb-6 bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                  {selectedService.details}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowForm(true)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black py-2.5 rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    🤝 Demander ce service
                  </button>
                  <button onClick={closeModal} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs px-4 rounded-lg text-gray-400 transition">
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              /* FORMULAIRE DE DEMANDE */
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
                <p className="text-[11px] text-yellow-500 font-bold uppercase tracking-wider bg-yellow-500/5 p-2 rounded border border-yellow-500/20">
                  📝 Formulaire de contact – Consulting Office
                </p>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Nom complet</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Mohamed Ali" 
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white focus:border-yellow-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Numéro de Téléphone</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="Ex: +216 98 765 432" 
                    value={formData.tel}
                    onChange={(e) => setFormData({...formData, tel: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white focus:border-yellow-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Détails de votre projet / Ref Bien</label>
                  <textarea 
                    rows="3" 
                    placeholder="Décrivez brièvement votre besoin ou insérez la référence du bien..." 
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white focus:border-yellow-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black py-2.5 rounded-lg transition uppercase tracking-wider">
                    🚀 Envoyer la demande
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs px-4 rounded-lg text-gray-400 transition">
                    Retour
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}