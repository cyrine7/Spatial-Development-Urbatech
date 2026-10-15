import React, { useState, useEffect } from 'react';

export default function OfficeDashboard() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/demandes/')
      .then((res) => res.json())
      .then((data) => {
        setDemandes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des demandes:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <span>🏢</span> Tableau de Bord – Suivi des Demandes Clients
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Chargement des demandes...</p>
      ) : demandes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demandes.map((dem) => (
            <div key={dem.id} className="bg-[#0c192c] border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col justify-between gap-3">
              <div>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2 py-1 rounded border border-yellow-500/25 uppercase">
                  {dem.service}
                </span>
                <h4 className="text-sm font-bold text-white mt-3">👤 {dem.nom}</h4>
                <p className="text-xs text-gray-400 mt-1">📞 {dem.telephone}</p>
                <p className="text-xs text-gray-300 mt-3 bg-slate-900/60 p-3 rounded border border-slate-800">
                  💬 {dem.details || "Aucun détail fourni."}
                </p>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button 
                  onClick={() => alert(`Traitement de la demande de ${dem.nom}`)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded transition"
                >
                  Traiter
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0c192c] border border-slate-800 p-8 rounded-xl text-center">
          <p className="text-xs text-gray-400">Aucune demande reçue pour le moment.</p>
        </div>
      )}
    </div>
  );
}

