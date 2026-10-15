import React, { useState } from "react";
import SidebarFilter from "./components/SidebarFilter";
import MapView from "./components/MapView";
import ChatBot from "./components/ChatBot";
import ServiceCommercial from "./components/ServiceCommercial";
import api from "./services/api"; 
import OfficeDashboard from "./components/OfficeDashboard"; 

export default function App() {
  const [activePage, setActivePage] = useState("accueil"); 
  const [cart, setCart] = useState([]);
  
  // GESTION DU COMPTE & AUTHENTIFICATION
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // false = Login, true = Register
  const [userAccount, setUserAccount] = useState(null); 
  const [regRole, setRegRole] = useState("Client"); // "Client" ou "Vendeur"
  
  // حقول الإدخال للنظام الجديد
  const [regNom, setRegNom] = useState("");
  const [regPrenom, setRegPrenom] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTelephone, setRegTelephone] = useState("");
  const [regRib, setRegRib] = useState("");
  const [authError, setAuthError] = useState("");

  // CONFIGURATION MULTI-DEVISE & LANGUE
  const [currency, setCurrency] = useState("DT"); 
  const [lang, setLang] = useState("fr"); 
  const [installationPublique, setInstallationPublique] = useState("all");

  const rates = { DT: 1, EUR: 0.30, USD: 0.32 };
  const currencySymbols = { DT: "DT", EUR: "€", USD: "$" };

  // Filter States
  const [pays, setPays] = useState("");
  const [typeOffre, setTypeOffre] = useState("all");
  const [periodeLocation, setPeriodeLocation] = useState("mois"); 
  const [searchCity, setSearchCity] = useState("");
  const [maxPriceDT, setMaxPriceDT] = useState(10000000); 
  const [maxSuperficie, setMaxSuperficie] = useState(50000);

  const [searchTrigger, setSearchTrigger] = useState({
    pays: "", typeOffre: "all", periodeLocation: "mois", searchCity: "", maxPriceDT: 10000000, maxSuperficie: 50000, installationPublique: "all"
  });

  const handleSearchSubmit = () => {
    let cleanPays = pays;
    if (pays && pays.includes(" ")) {
      cleanPays = pays.split(" ").slice(1).join(" ");
    }

    setSearchTrigger({ 
      pays: cleanPays, 
      typeOffre, 
      periodeLocation, 
      searchCity, 
      maxPriceDT, 
      maxSuperficie, 
      installationPublique 
    });
  };

  const handleAddToCart = (item) => {
    if (cart.find(i => i.id === item.id)) return;
    setCart([...cart, { id: item.id, title: item.title, priceDT: item.priceDT }]);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (isRegistered) {
        await api.post('auth/register/', {
          nom: regNom,
          prenom: regPrenom,
          email: regEmail,
          mot_de_passe: regPassword,
          telephone: regTelephone,
          role: regRole,
          rib: regRole === 'Vendeur' ? regRib : ''
        });
        alert("Compte créé avec succès ! Veuillez vous connecter.");
        setIsRegistered(false); 
      } else {
        const response = await api.post('auth/login/', {
          email: regEmail,
          mot_de_passe: regPassword
        });

        const userData = response.data.user;
        setUserAccount(userData);
        setShowAuthModal(false);
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans flex flex-col antialiased relative">
      
      {/* NAVBAR */}
      <header className="bg-[#0c192c] border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-[5000]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage("accueil")}>
          <div className="bg-yellow-500 text-black font-black px-3 py-1.5 rounded-lg text-xl shadow-md">S</div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white">SPATIAL DEVELOPMENT</h1>
          </div>
        </div>
        
        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActivePage("accueil")}
            className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${activePage === "accueil" ? "bg-yellow-500 text-black shadow-md" : "bg-slate-900 border border-slate-800 text-gray-300 hover:bg-slate-800"}`}
          >
            🏠 Accueil
          </button>

          <button 
            onClick={() => setActivePage("consulting")}
            className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${activePage === "consulting" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-900 border border-slate-800 text-yellow-500 hover:bg-slate-800"}`}
          >
            🏢 Consulting Office
          </button>

          {/* زر الداشبورد يظهر للآدمن فقط في الـ Navbar */}
          {userAccount && (userAccount.is_staff || userAccount.is_superuser || userAccount.role === "Admin") && (
            <button 
              onClick={() => setActivePage("office-dashboard")}
              className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${activePage === "office-dashboard" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800"}`}
            >
              📊 Dashboard Office
            </button>
          )}

          {/* 👤 COMPTE UTILISATEUR */}
          {userAccount ? (
            <div className="flex items-center gap-2 bg-[#050b14] border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-bold text-gray-300">{userAccount.nom} {userAccount.prenom} <span className="text-[10px] text-yellow-500">({userAccount.role})</span></span>
              <button onClick={() => setUserAccount(null)} className="text-red-500 ml-1 font-black">✕</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-bold text-white transition"
            >
              👤 Espace Compte
            </button>
          )}
        </div>
      </header>

      {/* MODAL AUTHENTIFICATION (LOGIN / REGISTER) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#0c192c] border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-black text-sm text-yellow-500 uppercase tracking-wide">
                {isRegistered ? "Création de Compte Spatial" : "Connexion à l'Espace"}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 text-xs">✕</button>
            </div>

            {authError && <p className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-2 rounded mb-3">{authError}</p>}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              
              {isRegistered && (
                <>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Nom</label>
                      <input type="text" required value={regNom} onChange={(e) => setRegNom(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="Ben Ali" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Prénom</label>
                      <input type="text" required value={regPrenom} onChange={(e) => setRegPrenom(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="Ahmed" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Téléphone</label>
                    <input type="text" required value={regTelephone} onChange={(e) => setRegTelephone(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="+216 ..." />
                  </div>
                </>
              )}

              {/* SÉLECTION DU RÔLE */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Type de profil</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button type="button" onClick={() => setRegRole("Client")} className={`py-2 text-xs font-black uppercase rounded transition ${regRole === "Client" ? "bg-yellow-500 text-black" : "bg-[#050b14] text-gray-400 border border-slate-800"}`}>
                    🛒 Client
                  </button>
                  <button type="button" onClick={() => setRegRole("Vendeur")} className={`py-2 text-xs font-black uppercase rounded transition ${regRole === "Vendeur" ? "bg-blue-600 text-white" : "bg-[#050b14] text-gray-400 border border-slate-800"}`}>
                    🏪 Vendeur
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Adresse Email</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="name@spatial.com" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Mot de passe</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="********" />
              </div>

              {isRegistered && regRole === 'Vendeur' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">RIB Bancaire</label>
                  <input type="text" required value={regRib} onChange={(e) => setRegRib(e.target.value)} className="bg-[#050b14] border border-slate-800 p-2 rounded text-xs text-white" placeholder="FR76 ..." />
                </div>
              )}

              <button type="submit" className="bg-yellow-500 text-black font-black text-xs py-2.5 rounded uppercase mt-2">
                {isRegistered ? "Créer mon Compte" : "Se Connecter"}
              </button>

              <button type="button" onClick={() => setIsRegistered(!isRegistered)} className="text-[11px] text-gray-500 underline hover:text-white mt-1 text-center">
                {isRegistered ? "J'ai déjà un compte, se connecter" : "Nouveau ? Créer un compte Vendeur ou Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* APP INTERFACES CONTAINER */}
      {activePage === "accueil" && (
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <SidebarFilter 
              pays={pays} setPays={setPays}
              typeOffre={typeOffre} setTypeOffre={setTypeOffre}
              periodeLocation={periodeLocation} setPeriodeLocation={setPeriodeLocation}
              setCategory={() => {}} setSearchCity={setSearchCity}
              setMaxPrice={setMaxPriceDT} maxPrice={maxPriceDT} maxSuperficie={maxSuperficie} setMaxSuperficie={setMaxSuperficie}
              onSearch={handleSearchSubmit} 
              currency={currency} setCurrency={setCurrency} currencySymbol={currencySymbols[currency]} rate={rates[currency]}
              lang={lang} setLang={setLang}
              installationPublique={installationPublique} setInstallationPublique={setInstallationPublique}
            />
            
            <div className="flex-1 w-full">
              <MapView 
                filters={searchTrigger} 
                onAddToCart={handleAddToCart}
                currencySymbol={currencySymbols[currency]}
                rate={rates[currency]}
              />
            </div>
            <ChatBot />
          </div>
        </main>
      )}

      {activePage === "consulting" && (
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto animate-fade-in">
          <div className="flex justify-between items-center bg-[#0c192c] border border-slate-800 p-4 rounded-xl mb-6">
            <div>
              <h2 className="text-lg font-black text-yellow-500 uppercase tracking-wider">🏢 Office de Consulting International</h2>
            </div>
          </div>
          <ServiceCommercial cart={cart} setCart={setCart} />
        </main>
      )}

      {/* عرض واجهة الداشبورد الخاصة بالآدمن */}
      {activePage === "office-dashboard" && userAccount && (userAccount.is_staff || userAccount.is_superuser || userAccount.role === "Admin") && (
        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto animate-fade-in">
          <OfficeDashboard />
        </main>
      )}
    </div>
  );
}