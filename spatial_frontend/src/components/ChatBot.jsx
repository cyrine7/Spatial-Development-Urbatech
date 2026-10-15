import React, { useState } from 'react';

function ChatBot() {
    const [messages, setMessages] = useState([
        { text: "3aslama! Ena el-Chatbot mta3 URBATECH, kifech tnejjem n3awnek?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInput('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. On affiche la réponse textuelle du bot
                setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);

                // 2. Si le backend a trouvé des propriétés, on peut les afficher ou les passer à la carte
                if (data.properties && data.properties.length > 0) {
                    // Formater la liste des biens pour l'afficher proprement dans le chat
                    const propertiesText = data.properties.map(p => 
                        `📍 ${p.type_bien || 'Bien'} à ${p.ville} - ${p.prix ? p.prix + ' TND' : 'Prix non spécifié'} (${p.superficie ? p.superficie + ' m²' : ''})`
                    ).join('\n');

                    setMessages(prev => [...prev, { text: `النتائج الموجودة:\n${propertiesText}`, sender: 'bot' }]);
                    
                    // TODO: Si tu veux centrer la carte sur ces coordonnées, tu peux les propager ici 
                    // (par exemple en utilisant un callback parent: onPropertiesFound(data.properties))
                }
            } else {
                setMessages(prev => [...prev, { text: "Thamma moshkila fil-Backend.", sender: 'bot' }]);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { text: "Erreur de connexion au serveur.", sender: 'bot' }]);
        }
    };

    return (
        <>
            {/* 1. L-Icone el-sghira elli tatla3 louta 3la limine ki ybda el-chat msaker */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#ffc107',
                        color: '#111',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        fontSize: '28px',
                        cursor: 'pointer',
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    💬
                </button>
            )}

            {/* 2. El-Boîte mta3 el-Chat ki t-7alha */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                    width: '350px',
                    height: '450px',
                    backgroundColor: '#111c24',
                    border: '1px solid #223344',
                    borderRadius: '12px',
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden',
                    fontFamily: 'sans-serif'
                }}>
                    {/* Header mta3 el-Chat fih bouton Sakker */}
                    <div style={{
                        backgroundColor: '#ffc107',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between', // Correction de 'between' en 'space-between'
                        alignItems: 'center',
                        color: '#111',
                        fontWeight: 'bold'
                    }}>
                        <span style={{ flex: 1 }}>🤖 URBATECH Chatbot</span>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#111',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            ✖
                        </button>
                    </div>

                    {/* Blaset el-messages */}
                    <div style={{
                        flex: 1,
                        padding: '10px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    backgroundColor: msg.sender === 'user' ? '#ffc107' : '#223344',
                                    color: msg.sender === 'user' ? '#111' : '#fff',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    maxWidth: '80%',
                                    fontSize: '14px',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Blaset l-écriture (Input) */}
                    <div style={{ padding: '10px', display: 'flex', gap: '5px', borderTop: '1px solid #223344' }}>
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ekteb message..."
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #334455',
                                backgroundColor: '#1a2b3c',
                                color: '#fff'
                            }}
                        />
                        <button 
                            onClick={sendMessage}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: '#ffc107',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatBot;