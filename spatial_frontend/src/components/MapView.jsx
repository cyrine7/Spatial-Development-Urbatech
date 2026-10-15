import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../App.css";
import PaymentModal from './PaymentModal';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const STYLES = {
  sat: "mapbox://styles/mapbox/satellite-v9",
  osm: "mapbox://styles/mapbox/streets-v12",
  building3d: "mapbox://styles/mapbox/standard"
};

export default function MapView({ filters, onAddToCart, currencySymbol, rate }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const localisationsDataRef = useRef([]);
  
  const [baseMapType, setBaseMapType] = useState('building3d');
  const [urbanProjects, setUrbanProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const [show3DModel, setShow3DModel] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(1.5);
  const [isExpanded, setIsExpanded] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPaymentItem, setCurrentPaymentItem] = useState(null);
  const [currentActionType, setCurrentActionType] = useState('acheter');

  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  const handleTransactionAction = (actionType, item) => {
    setCurrentPaymentItem(item);
    setCurrentActionType(actionType);
    setPaymentModalOpen(true);
  };

  const addMarkersToMap = (data) => {
    if (!mapRef.current) return;
    const baseUrl = "http://127.0.0.1:8000"; 
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    data.forEach((item, index) => {
      let lng, lat;
      if (item.coordonnees?.coordinates) {
        lng = item.coordonnees.coordinates[0];
        lat = item.coordonnees.coordinates[1];
      } else if (item.longitude && item.latitude) {
        lng = item.longitude;
        lat = item.latitude;
      }

      if (lng === undefined || lat === undefined) {
        console.warn(`Item #${index} does not have valid coordinates:`, item);
        return;
      }

      const container = document.createElement('div');
      container.className = 'custom-popup-content';

      let mediaHtml = '';
      if (item.medias && item.medias.length > 0) {
        item.medias.forEach(m => {
          if (m.type_media === 'photo') {
            mediaHtml += `
              <div class="popup-img-container" style="text-align: center; cursor: pointer; margin-bottom: 5px;" data-img-url="${m.file}">
                <img src="${m.file}" style="width:100%; height:140px; object-fit:cover; border-radius:4px; border: 1px solid #ccc;" />
                <span style="font-size: 10px; color: #555; font-style: italic; display: block; margin-top: 2px;">🔍 Cliquez pour agrandir</span>
              </div>
            `;
          } else if (m.type_media === 'video' && m.file) {
            const videoUrl = m.file.startsWith('http') ? m.file : `${baseUrl}${m.file}`;
            mediaHtml += `<video controls style="width:100%; height:140px; background:black; margin-bottom:5px; border-radius:4px;"><source src="${videoUrl}" type="video/mp4"></video>`;
          }
        });
      }

      container.innerHTML = `
        <h3 class="popup-title">📍 ${item.ville?.toUpperCase() || 'N/A'}</h3>
        ${mediaHtml} 
        <div class="popup-data">
            <p><strong>Type de bien:</strong> ${item.type_bien || 'N/A'}</p>
            <p><strong>Prix:</strong> ${item.prix ? item.prix * (rate || 1) : '0'} ${currencySymbol || 'DT'}</p>
            <p><strong>Superficie:</strong> ${item.superficie || '0'} m²</p>
            <p><strong>Statut:</strong> ${item.statut || 'N/A'}</p>
            <p><strong>Pays:</strong> ${item.pays || 'N/A'}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
          <div style="display: flex; gap: 6px;">
            <button id="buy-btn-${item.id}" style="flex: 1; background: #ffc107; color: #000; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">🛒 Acheter</button>
            <button id="rent-btn-${item.id}" style="flex: 1; background: #007bff; color: #fff; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">🔑 Louer</button>
          </div>
          <button id="exchange-btn-${item.id}" style="width: 100%; background: #28a745; color: #fff; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">🔄 Échanger / Changer</button>
        </div>

        <button class="hide-btn" style="width: 100%; margin-top: 8px; background: #dc3545; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: bold;">❌ Fermer</button>
      `;

      setTimeout(() => {
        const buyBtn = container.querySelector(`#buy-btn-${item.id}`);
        const rentBtn = container.querySelector(`#rent-btn-${item.id}`);
        const exchangeBtn = container.querySelector(`#exchange-btn-${item.id}`);

        if (buyBtn) buyBtn.onclick = () => handleTransactionAction('acheter', item);
        if (rentBtn) rentBtn.onclick = () => handleTransactionAction('louer', item);
        if (exchangeBtn) exchangeBtn.onclick = () => handleTransactionAction('echanger', item);

        const imgContainers = container.querySelectorAll('.popup-img-container');
        imgContainers.forEach(el => {
          const imgUrl = el.getAttribute('data-img-url');
          el.onclick = () => {
            setSelectedImageForModal(imgUrl);
          };
        });
      }, 0);

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setDOMContent(container);
      container.querySelector('.hide-btn').addEventListener('click', () => popup.remove());
      
      const newMarker = new mapboxgl.Marker({ color: "#ffc107" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(newMarker);
    });
  };

  const fetchAndAddMarkers = () => {
    let url = "http://127.0.0.1:8000/localisation-sigs/?";
    
    if (filters) {
      if (filters.pays && filters.pays !== "all" && filters.pays !== "") {
        url += `pays=${encodeURIComponent(filters.pays)}&`;
      }
      if (filters.typeOffre && filters.typeOffre !== "all") {
        url += `type_bien=${encodeURIComponent(filters.typeOffre)}&`;
      }
      if (filters.searchCity) {
        url += `ville=${encodeURIComponent(filters.searchCity)}&`;
      }
      if (filters.maxPriceDT) {
        url += `prix_max=${filters.maxPriceDT}&`;
      }
      if (filters.maxSuperficie) {
        url += `superficie_max=${filters.maxSuperficie}&`;
      }
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        localisationsDataRef.current = data;
        addMarkersToMap(data);
      })
      .catch(error => console.error('Error fetching localisations:', error));
  };

  const zoomToLayer = () => {
    if (!mapRef.current || localisationsDataRef.current.length === 0) {
      alert("⚠️ لا توجد بيانات مسجلة مطابقة حالياً!");
      return;
    }
    
    const bounds = new mapboxgl.LngLatBounds();
    let count = 0;

    localisationsDataRef.current.forEach(item => {
      let lng, lat;
      if (item.coordonnees?.coordinates) {
        lng = item.coordonnees.coordinates[0];
        lat = item.coordonnees.coordinates[1];
      } else if (item.longitude && item.latitude) {
        lng = item.longitude;
        lat = item.latitude;
      }

      if (lng !== undefined && lat !== undefined) {
        bounds.extend([lng, lat]);
        count++;
      }
    });

    if (count > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: 1000
      });
    } else {
      alert("⚠️ تعذر العثور على إحداثيات صالحة لعمل Zoom to Layer!");
    }
  };

  // Initialisation de la carte Mapbox
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: STYLES[baseMapType],
      center: [10.7603, 34.7406], 
      zoom: 13,
      pitch: 60,
      bearing: -20,
      antialias: true
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    mapRef.current.on('zoom', () => {
      setCurrentZoom(mapRef.current.getZoom());
    });

    mapRef.current.on("load", () => {
      fetchAndAddMarkers(); 
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // Récupération des projets 3D
  useEffect(() => {
    fetch("http://127.0.0.1:8000/urban-projects/")
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) return;
        setUrbanProjects(data);
        setActiveProject(data[0]);
      })
      .catch(error => console.error('Error fetching 3D projects:', error));
  }, []);

  // Mise à jour lors du changement des filtres
  useEffect(() => {
    if (mapRef.current) {
      fetchAndAddMarkers();
    }
  }, [filters]);

  // Écouteur d'événements pour l'ajout en temps réel d'une localisation
  useEffect(() => {
    const handleDataUpdate = () => {
      fetchAndAddMarkers();
    };

    window.addEventListener('localisationAdded', handleDataUpdate);

    return () => {
      window.removeEventListener('localisationAdded', handleDataUpdate);
    };
  }, []);

  // Changement du style de la carte de base
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(STYLES[baseMapType]);
    
    mapRef.current.once('style.load', () => {
      fetchAndAddMarkers();
    });
  }, [baseMapType]);

  const toggleBaseMap = () => {
    setBaseMapType(prev => {
      if (prev === 'building3d') return 'sat';
      if (prev === 'sat') return 'osm';
      return 'building3d';
    });
  };

  const rotateCamera = (angle) => { 
    if (mapRef.current) mapRef.current.easeTo({ bearing: mapRef.current.getBearing() + angle, duration: 500 }); 
  };
  
  const tiltCamera = (pitchVal) => { 
    if (mapRef.current) mapRef.current.easeTo({ pitch: pitchVal, duration: 500 }); 
  };

  const handleSelectProject = (e) => {
    const projId = e.target.value;
    const selected = urbanProjects.find(p => String(p.id) === String(projId));
    if (selected) {
      setActiveProject(selected);
      if (selected.longitude && selected.latitude && mapRef.current) {
        mapRef.current.flyTo({ center: [selected.longitude, selected.latitude], zoom: 16, pitch: 60 });
      }
    }
  };

  const shouldDisplay3D = show3DModel && currentZoom >= 14 && activeProject && activeProject.model_file;

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <div ref={mapContainer} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {shouldDisplay3D && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: isExpanded ? "calc(100% - 40px)" : "380px",
          height: isExpanded ? "calc(100% - 40px)" : "420px",
          transition: "all 0.3s ease-in-out",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          zIndex: 2000,
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "3px solid #ffc107"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "8px", zIndex: 2010 }}>
            <span style={{ fontWeight: "bold", fontSize: "13px", color: "#333" }}>
              🏗️ visualisation 3D
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }} 
                style={{ background: "#f8f9fa", border: "1px solid #ccc", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", zIndex: 2020 }}
              >
                {isExpanded ? "🗜️ تصغير" : "🔲 تكبير"}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShow3DModel(false);
                }} 
                style={{ background: "#dc3545", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", zIndex: 2020 }}
              >
                ❌
              </button>
            </div>
          </div>

          {urbanProjects.length > 1 && (
            <div style={{ width: "100%", marginBottom: "8px", zIndex: 2015 }}>
              <select 
                value={activeProject.id} 
                onChange={handleSelectProject}
                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "12px", background: "#f1f3f5", cursor: "pointer" }}
              >
                {urbanProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📍 {p.nom || `Projet #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <model-viewer
            src={activeProject.model_file}
            alt="Urban 3D Model"
            auto-rotate={false}
            camera-controls
            touch-action="pan-y"
            shadow-intensity="2"
            exposure="1.5"
            camera-orbit="20deg 45deg 100%"
            min-camera-orbit="auto auto 5%"
            max-camera-orbit="auto auto 300%"
            style={{ width: "100%", height: "100%", borderRadius: "12px", background: "#e9ecef", zIndex: 2005 }}
          ></model-viewer>
        </div>
      )}
      
      <div style={{ 
        position: "absolute", 
        top: 10, 
        left: 10, 
        zIndex: 1000, 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "8px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px",
        borderRadius: "8px",
        backdropFilter: "blur(5px)"
      }}>
        <button 
          onClick={toggleBaseMap}
          style={{ cursor: "pointer", padding: "6px 12px", borderRadius: "4px", border: "none", background: "#007bff", color: "#fff", fontWeight: "bold" }}
        >
          🗺️ BaseMap: {baseMapType === 'building3d' ? '3D Standard' : baseMapType === 'sat' ? 'Satellite' : 'OSM Streets'}
        </button>

        <button 
          onClick={zoomToLayer}
          style={{ cursor: "pointer", padding: "6px 12px", borderRadius: "4px", border: "none", background: "#17a2b8", color: "#fff", fontWeight: "bold" }}
        >
          🔍 Zoom to Layer
        </button>

        <button 
          onClick={() => setShow3DModel(!show3DModel)}
          style={{ 
            cursor: "pointer", 
            padding: "6px 12px", 
            borderRadius: "4px", 
            border: "none", 
            background: show3DModel ? "#28a745" : "#6c757d", 
            color: "#fff", 
            fontWeight: "bold" 
          }}
        >
          {show3DModel ? "👁️ Masquer 3D" : "👁️ Afficher 3D"}
        </button>

        <button 
          onClick={() => rotateCamera(45)}
          style={{ cursor: "pointer", padding: "6px 12px", borderRadius: "4px", border: "none", background: "#ffc107", color: "#000", fontWeight: "bold" }}
        >
          🔄 Tourner
        </button>

        <button 
          onClick={() => tiltCamera(75)}
          style={{ cursor: "pointer", padding: "6px 12px", borderRadius: "4px", border: "none", background: "#28a745", color: "#fff", fontWeight: "bold" }}
        >
          📐 Inclinaison Max
        </button>
      </div>

      {paymentModalOpen && currentPaymentItem && (
        <PaymentModal 
          bien={currentPaymentItem} 
          actionType={currentActionType} 
          onClose={() => {
            setPaymentModalOpen(false);
            setCurrentPaymentItem(null);
          }} 
        />
      )}

      {selectedImageForModal && (
        <div 
          onClick={() => setSelectedImageForModal(null)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImageForModal(null)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              ✕ Fermer
            </button>
            <img 
              src={selectedImageForModal} 
              alt="Plan 2D Complet" 
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 5px 25px rgba(0,0,0,0.5)',
                background: 'white'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}