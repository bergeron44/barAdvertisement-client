import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';  
import 'leaflet/dist/leaflet.css'; 
import axios from 'axios';

const App = () => {
    const mapContainerRef = useRef(null);
    const [bars, setBars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBars = async () => {
            try {
                const response = await axios.get('https://baradvertisement-server.onrender.com/api/bars');
                setBars(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch bars data. Please try again.");
                setLoading(false);
            }
        };
        fetchBars();
    }, []);

    useEffect(() => {
        if (bars.length > 0) {
            const map = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 15);
    
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
    
            bars.forEach(bar => {
                const iconUrl = bar.imageUrl ? `/img/${bar.name.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/default-bar.jpg';

                // יצירת אייקון עגול עם border-radius
                const barIcon = L.divIcon({
                    html: `<img src="${iconUrl}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
                    iconSize: [60, 60],
                    className: 'custom-icon' // כיתה מותאמת אישית לאייקון
                });

                const marker = L.marker([bar.lat, bar.lng], { icon: barIcon }).addTo(map);
                const googleMapsLink = `https://www.google.com/maps?q=${bar.lat},${bar.lng}`;

                // יצירת תוכן הפופ-אפ עם פרטי הבר
                const popupContent = `
                    <div style="text-align: center; font-family: Arial, sans-serif; padding: 15px; border: 2px solid #ddd; border-radius: 8px; width: 250px; background-color: #f9f9f9;">
                        <h3 style="margin: 5px 0; color: #333; font-size: 18px;">${bar.name}</h3>
                        <div style="margin-bottom: 10px;">
                            ${bar.website ? 
                                `<a href="${bar.website}" target="_blank" style="color: blue; text-decoration: underline; font-size: 14px;">בקרו באתר</a>` 
                                : bar.instagram ? 
                                    `<a href="${bar.instagram}" target="_blank" style="color: #E1306C; text-decoration: underline; font-size: 14px;">עקוב אחרי האינסטגרם</a>` 
                                    : '<span style="color: red; font-size: 14px;">לא זמין</span>'
                            }
                        </div>
                    
                        <div style="margin-bottom: 10px;">
                            <strong style="font-size: 16px; color: #333;"><b>הנחות משחקי השתייה</b></strong>
                        </div>
                    
                        <div style="font-size: 14px; color: green; margin-bottom: 10px;">
                            ${bar.discountOne ? `<p>${bar.discountOne}</p>` : ''}
                            ${bar.discountSec ? `<p>${bar.discountSec}</p>` : ''}
                            ${bar.discountThi ? `<p>${bar.discountThi}</p>` : ''}
                        </div>
                    
                        <div style="margin-top: 10px;">
                            <p><a href="${googleMapsLink}" target="_blank" style="color: blue; text-decoration: underline; font-size: 14px;" data-bar-name="${bar.name}" class="google-maps-link">הגעה לגוגל מפות</a></p>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);

                // פתיחת אירוע popupopen להוספת הקשבה ללחיצה על הלייק
                marker.on('popupopen', () => {
                    const likeLink = document.querySelector(`[data-bar-name="${bar.name}"]`);
                    if (likeLink) {
                        likeLink.addEventListener('click', (e) => {
                            e.preventDefault(); // מונע פתיחה אוטומטית של הלינק
                            handleLikeClick(bar.name)
                                .then(() => {
                                    // פתיחת הלינק לאחר טיפול בלייק
                                    window.open(googleMapsLink, '_blank'); 
                                })
                                .catch(err => {
                                    console.error('Error while liking the bar:', err);
                                    window.open(googleMapsLink, '_blank');
                                });
                        });
                    }
                });
            });
    
            // ניקוי המפה בפריקה
            return () => map.remove();
        }
    }, [bars]);
    
    const handleLikeClick = async (barName) => {
        try {
            console.log("In handle click for:", barName);
            await axios.post(`https://baradvertisement-server.onrender.com/api/bars/${barName}/like`);
        } catch (error) {
            console.error('Error while liking the bar:', error);
        }
    };
    

    if (loading) return <div>Loading Bars...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <header style={headerStyles}> </header>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
        </div>
    );
};

// סגנון לכותרת המפה עם תמונה כרקע
const headerStyles = {
    textAlign: 'center',
    padding: '0', // הסרת padding למראה מותאם
    fontSize: '36px', // גודל טקסט גדול יותר
    backgroundImage: 'url("/img/logo.png")', // נתיב לתמונה בתיקיית public
    backgroundSize: 'contain', // הבטחה שהתמונה לא תיחתך
    backgroundRepeat: 'no-repeat', // מניעת חזרה של התמונה
    backgroundPosition: 'center', // מרכז את התמונה
    color: 'white', // צבע הטקסט
    fontFamily: 'Arial, sans-serif', // סגנון הפונט
    height: '12.5vh', // גובה של שמינית מגובה התצוגה
    width: '100%', // מבטיח שהרוחב יהיה 100% מרוחב המסך
};

// CSS to make it responsive
const responsiveStyles = `
    @media (max-width: 768px) {
        ${headerStyles} {
            font-size: 24px;
            padding: 30px 0;
        }
        .leaflet-container {
            width: 100%;
            height: 70vh;
        }
    }

    @media (max-width: 480px) {
        ${headerStyles} {
            font-size: 20px;
            padding: 20px 0;
        }
        .leaflet-container {
            width: 100%;
            height: 60vh;
        }
    }
`;

export default App;
