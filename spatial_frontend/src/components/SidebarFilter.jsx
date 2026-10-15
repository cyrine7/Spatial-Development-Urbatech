import React, { useEffect } from 'react';

export default function SidebarFilter({ 
  typeOffre, setTypeOffre,
  periodeLocation, setPeriodeLocation,
  setCategory, setSearchCity, setMaxPrice, maxPrice, 
  maxSuperficie, setMaxSuperficie, onSearch,
  currency, setCurrency, currencySymbol, rate,
  lang, setLang,
  installationPublique, setInstallationPublique,
  pays, setPays
}) {
  
  useEffect(() => {
    if (typeOffre === "location") {
      setMaxPrice(2000); 
    } else {
      setMaxPrice(10000000); 
    }
  }, [typeOffre, setMaxPrice]);

  const displayMaxPrice = Math.round(maxPrice * rate);

  // 🌍 Liste des pays
  const countries = [
    { code: "all", fr: "Tous les pays", en: "All countries", ar: "كل البلدان", flag: "🌍" },
    { code: "Afghanistan", fr: "Afghanistan", en: "Afghanistan", ar: "أفغانستان", flag: "🇦🇫" },
    { code: "Afrique du Sud", fr: "Afrique du Sud", en: "South Africa", ar: "جنوب إفريقيا", flag: "🇿🇦" },
    { code: "Algérie", fr: "Algérie", en: "Algeria", ar: "الجزائر", flag: "🇩🇿" },
    { code: "Allemagne", fr: "Allemagne", en: "Germany", ar: "ألمانيا", flag: "🇩🇪" },
    { code: "Arabie saoudite", fr: "Arabie saoudite", en: "Saudi Arabia", ar: "المملكة العربية السعودية", flag: "🇸🇦" },
    { code: "Belgique", fr: "Belgique", en: "Belgium", ar: "بلجيكا", flag: "🇧🇪" },
    { code: "Canada", fr: "Canada", en: "Canada", ar: "كندا", flag: "🇨🇦" },
    { code: "Égypte", fr: "Égypte", en: "Egypt", ar: "مصر", flag: "🇪🇬" },
    { code: "Émirats arabes unis", fr: "Émirats arabes unis", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", flag: "🇦🇪" },
    { code: "Espagne", fr: "Espagne", en: "Spain", ar: "إسبانيا", flag: "🇪🇸" },
    { code: "États-Unis", fr: "États-Unis", en: "United States", ar: "الولايات المتحدة", flag: "🇺🇸" },
    { code: "France", fr: "France", en: "France", ar: "فرنسا", flag: "🇫🇷" },
    { code: "Italie", fr: "Italie", en: "Italy", ar: "إيطاليا", flag: "🇮🇹" },
    { code: "Libye", fr: "Libye", en: "Libya", ar: "ليبيا", flag: "🇱🇾" },
    { code: "Maroc", fr: "Maroc", en: "Morocco", ar: "المغرب", flag: "🇲🇦" },
    { code: "Royaume-Uni", fr: "Royaume-Uni", en: "United Kingdom", ar: "المملكة المتحدة", flag: "🇬🇧" },
    { code: "Tunisie", fr: "Tunisie", en: "Tunisia", ar: "تونس", flag: "🇹🇳" },
    { code: "Turquie", fr: "Turquie", en: "Turkey", ar: "تركيا", flag: "🇹🇷" }
  ];

  const t = {
    fr: {
      title: "🔍 Filtres Avancés",
      offre: "Type d'offre",
      allOffres: "Tous les types",
      vente: "🏪 À Vendre",
      location: "🔑 À Louer",
      duree: "Durée du bail",
      an: "Par An", mois: "Par Mois", semaine: "Par Semaine", jour: "Par Jour",
      pays: "Pays / Région",
      ville: "Ville / Quartier",
      prix: "Prix Maximum",
      superficie: "Superficie Max",
      inst: "🏙️ Installations Publiques (Optionnel)",
      allInst: "Toutes les installations",
      ecole: "Écoles & Universités", transport: "Stations de Transport", admin: "Administrations & Municipalités",
      btn: "🚀 Appliquer les Filtres",
      deviseLabel: "💵 Devise",
      langLabel: "🌐 Langue du Site"
    },
    en: {
      title: "🔍 Advanced Filters",
      offre: "Offer Type",
      allOffres: "All Types",
      vente: "🏪 For Sale",
      location: "🔑 For Rent",
      duree: "Rental Period",
      an: "Per Year", mois: "Per Month", semaine: "Per Week", jour: "Per Day",
      pays: "Country / Region",
      ville: "City / Neighborhood",
      prix: "Maximum Price",
      superficie: "Max Area",
      inst: "🏙️ Public Facilities (Optional)",
      allInst: "All facilities",
      ecole: "Schools & Universities", transport: "Transport Stations", admin: "Municipalities & Admin",
      btn: "🚀 Apply Filters",
      deviseLabel: "💵 Currency",
      langLabel: "🌐 Site Language"
    },
    ar: {
      title: "🔍 تصفية البحث",
      offre: "نوع العرض",
      allOffres: "كل الأنواع",
      vente: "🏪 للبيع",
      location: "🔑 للكراء",
      duree: "مدة الكراء",
      an: "سنوي", mois: "شهري", semaine: "أسبوعي", jour: "يومي",
      pays: "البلد / المنطقة",
      ville: "المدينة / الحي",
      prix: "السعر الأقصى",
      superficie: "المساحة القصوى",
      inst: "🏙️ المنشآت العمومية (اختياري)",
      allInst: "كل المنشآت",
      ecole: "مدارس وجامعات", transport: "محطات النقل", admin: "إدارات وبلديات",
      btn: "🚀 تطبيق التصفية",
      deviseLabel: "💵 العملة",
      langLabel: "🌐 لغة الموقع"
    }
  };

  const currentT = t[lang] || t.fr;

  return (
    <div className="w-full lg:w-72 bg-[#050b14] border border-slate-900 p-5 rounded-xl shadow-2xl flex flex-col gap-4 text-slate-100">
      <div>
        <h3 className="font-black text-lg text-white tracking-wide mb-1">{currentT.title}</h3>
      </div>

      {/* CONFIGURATION: DEVISE & LANGUE */}
      <div className="grid grid-cols-2 gap-2 bg-[#0b121f] p-2.5 rounded-lg border border-slate-900">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{currentT.deviseLabel}</label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-[#030712] border border-slate-800 p-1.5 rounded text-[11px] font-bold text-yellow-500 focus:outline-none"
          >
            <option value="DT">DT (تـ.د)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{currentT.langLabel}</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-[#030712] border border-slate-800 p-1.5 rounded text-[11px] font-bold text-slate-200 focus:outline-none"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* CHOIX DU PAYS / REGION */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase">{currentT.pays}</label>
        <select 
          value={pays || "all"} 
          onChange={(e) => {
            setPays(e.target.value);
            // 💡 Kif tختار البلاد، نreset-iw el ville bch ma ysirouch clash fel filtre w yjib data el bled b kolha
            setSearchCity(""); 
            setTimeout(onSearch, 50);
          }} 
          className="w-full bg-[#0b121f] border border-slate-900 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code === "all" ? "all" : c.fr}>
              {c.flag} {c.fr}
            </option>
          ))}
        </select>
      </div>

      {/* VILLE / QUARTIER (Ma yna7ich el data mte3 el pays, ykammel y-filtfi fihom) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase">{currentT.ville}</label>
        <input 
          type="text" 
          onChange={(e) => {
            setSearchCity(e.target.value);
            setTimeout(onSearch, 50); 
          }} 
          placeholder="Ex: Tunis, Ajdabiya, Sfax..." 
          className="w-full bg-[#0b121f] border border-slate-900 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none placeholder:text-gray-700" 
        />
      </div>

      {/* TYPE D'OFFRE */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase">{currentT.offre}</label>
        <select 
          value={typeOffre} 
          onChange={(e) => {
            setTypeOffre(e.target.value);
            setTimeout(onSearch, 50);
          }} 
          className="w-full bg-[#0b121f] border border-slate-900 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
        >
          <option value="all">{currentT.allOffres}</option>
          <option value="vente">{currentT.vente}</option>
          <option value="location">{currentT.location}</option>
        </select>
      </div>

      {/* PÉRIODES DE LOCATION */}
      {typeOffre === "location" && (
        <div className="flex flex-col gap-1.5 bg-[#0b121f] p-2.5 rounded-lg border border-slate-900 animate-fade-in">
          <label className="text-[10px] font-black text-yellow-500 uppercase tracking-wider mb-1">{currentT.duree}</label>
          <div className="grid grid-cols-2 gap-2">
            {["an", "mois", "semaine", "jour"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriodeLocation(p);
                  setTimeout(onSearch, 50);
                }}
                className={`py-1 rounded text-[10px] font-black uppercase tracking-wider transition ${periodeLocation === p ? 'border border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border border-slate-900 text-gray-500 bg-[#050b14]'}`}
              >
                {currentT[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INSTALLATIONS PUBLIQUES */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase">{currentT.inst}</label>
        <select 
          value={installationPublique || "all"} 
          onChange={(e) => {
            const val = e.target.value === "all" ? "" : e.target.value;
            setInstallationPublique(val);
            setTimeout(onSearch, 50);
          }} 
          className="w-full bg-[#0b121f] border border-slate-900 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none font-medium cursor-pointer"
        >
          <option value="all">{currentT.allInst}</option>
          <option value="ecole">{currentT.ecole}</option>
          <option value="transport">{currentT.transport}</option>
          <option value="administration">{currentT.admin}</option>
        </select>
      </div>

      {/* SLIDER PRIX MULTI-DEVISE */}
      <div className="flex flex-col gap-1.5 bg-[#0b121f] p-3 rounded-lg border border-slate-900">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
          <span>{currentT.prix}</span>
          <span className="text-yellow-500 font-black">
            {displayMaxPrice.toLocaleString()} {currencySymbol} {typeOffre === "location" && `/${periodeLocation}`}
          </span>
        </div>
        <input 
          type="range" 
          min={typeOffre === "location" ? "50" : "10000"} 
          max={typeOffre === "location" ? "20000" : "10000000"} 
          step={typeOffre === "location" ? "10" : "50000"} 
          value={maxPrice} 
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setTimeout(onSearch, 50);
          }} 
          className="w-full accent-yellow-500 h-1 bg-[#050b14] rounded-lg cursor-pointer mt-1" 
        />
      </div>

      {/* SUPERFICIE */}
      <div className="flex flex-col gap-1.5 bg-[#0b121f] p-3 rounded-lg border border-slate-900">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
          <span>{currentT.superficie}</span>
          <span className="text-yellow-500 font-black">{maxSuperficie.toLocaleString()} m²</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="50000" 
          step="50" 
          value={maxSuperficie} 
          onChange={(e) => {
            setMaxSuperficie(Number(e.target.value));
            setTimeout(onSearch, 50);
          }} 
          className="w-full accent-yellow-500 h-1 bg-[#050b14] rounded-lg cursor-pointer mt-1" 
        />
      </div>

      <button type="button" onClick={onSearch} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-lg text-xs uppercase tracking-wider transition shadow-md cursor-pointer">
        {currentT.btn}
      </button>
    </div>
  );
}