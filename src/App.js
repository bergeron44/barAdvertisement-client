import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const BASE_API_URL = 'https://bangyourhead-server.onrender.com/api'; 

const App = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBarsView, setIsBarsView] = useState(true);

    // הבאת נתונים מה-API
    const fetchData = async (endpoint) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_API_URL}/${endpoint}`);
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // טעינת נתונים לפי מצב (ברים או אירועים)
    useEffect(() => {
        const endpoint = isBarsView ? 'bars' : 'events';
        fetchData(endpoint);
    }, [isBarsView]);

    // טעינת המפה והוספת המרקרים
    useEffect(() => {
        if (!mapContainerRef.current) return;
        
        // הסרת מפה קיימת במקרה שהיא נטענה כבר
        if (mapRef.current) {
            mapRef.current.remove();
        }

        // יצירת מפה חדשה
        mapRef.current = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);

        // הוספת מרקרים לפי הנתונים
        data.forEach((bar) => {
            var popupContent;
            var googleMapsLink;
            var barIcon;
            var iconUrl;
            var marker;
            if(isBarsView)
            {
                 iconUrl = bar.imageUrl ? `/img/${bar.name.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/default-bar.jpg';

                 barIcon = L.divIcon({
                    html: `<img src="${iconUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
                    iconSize: [60, 60],
                    className: 'custom-icon',
                });
    
                 marker = L.marker([bar.lat, bar.lng], { icon: barIcon }).addTo(mapRef.current);
    
                // יצירת popupContent רספונסיבי
                 googleMapsLink = `https://www.google.com/maps?q=${bar.lat},${bar.lng}`;
                 popupContent = `
                    <div style="text-align: center; font-family: Arial; padding: 10px; background: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); width: auto; max-width: 300px; border-radius: 10px;">
                        <h3 style="margin: 5px 0; color: #333; font-size: 16px;">${bar.name}</h3>
                        <div style="margin-bottom: 10px; font-size: 14px;">
                            ${bar.website ? 
                                `<a href="${bar.website}" target="_blank" style="color: #007bff;">Website</a>` 
                                : bar.instagram ? 
                                    `<a href="${bar.instagram}" target="_blank" style="color: #E1306C;"> Instagram</a>` 
                                    : '<span style="color: red;">Not Available</span>'
                            }
                        </div>
                          <div style="font-size: 14px; color: red; margin-bottom: 10px;">
                            <b>! מבצעים </b>
                        </div>
                        <div style="font-size: 12px; color: black; margin-bottom: 10px;">
                            ${bar.discountOne ? `<p>${bar.discountOne}</p>` : ''}
                            ${bar.discountSec ? `<p>${bar.discountSec}</p>` : ''}
                            ${bar.discountThi ? `<p>${bar.discountThi}</p>` : ''}
                        </div>
                        <button class="like-button" data-bar-name="${bar.name}" style="padding: 8px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; width: 100%;">מעוניין בארוע</button>
                        <p><a href="${googleMapsLink}" target="_blank" style="color: #007bff; font-size: 12px;">נווט לבר</a></p>
                    </div>
                `;
            }
            else
            {
                iconUrl = bar.photo ? `/img/${bar.type.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/default-bar.jpg';

                barIcon = L.divIcon({
                   html: `<img src="${iconUrl}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
                   iconSize: [60, 60],
                   className: 'custom-icon',
               });
   
                marker = L.marker([bar.location.lat, bar.location.lng], { icon: barIcon }).addTo(mapRef.current);
   
               // יצירת popupContent רספונסיבי
                googleMapsLink = `https://www.google.com/maps?q=${bar.location.lat},${bar.location.lng}`;
                popupContent = `
                   <div style="text-align: center; font-family: Arial; padding: 10px; background: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); width: auto; max-width: 300px; border-radius: 10px;">
                       <h3 style="margin: 5px 0; color: #333; font-size: 16px;">${bar.name}</h3>
                       <div style="margin-bottom: 10px; font-size: 14px;">
                           ${bar.website ? 
                               `<a href="${bar.website}" target="_blank" style="color: #007bff;">להזמנת כרטיסים</a>` 
                               : bar.instagram ? 
                                   `<a href="${bar.instagram}" target="_blank" style="color: #E1306C;">Instagram</a>` 
                                   : '<span style="color: red;">Not Available</span>'
                           }
                       </div>
                       <div style="font-size: 12px; color: green; margin-bottom: 10px;">
                           ${bar.description ? `<p>${bar.description}</p>` : ''}
                       </div>
                       <button class="like-button" data-bar-name="${bar.name}" style="padding: 8px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; width: 100%;">מעוניין בארוע</button>
                       <p><a href="${googleMapsLink}" target="_blank" style="color: #007bff; font-size: 12px;">נווט</a></p>
                   </div>
               `;



            }
           

            marker.bindPopup(popupContent);

            // האזנה ללחיצה על כפתור לייק
            marker.on('popupopen', () => {
                const likeButton = document.querySelector(`.like-button[data-bar-name="${bar.name}"]`);
                if (likeButton) {
                    likeButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await handleLikeClick(bar);
                    });
                }
            });
        });
    }, [data]);

    // פונקציה לטיפול בלחיצה על כפתור לייק
    const handleLikeClick = async (bar) => {
        try {
            console.log(bar);
            var data;
            if(isBarsView)
            {
                data =await axios.post(`${BASE_API_URL}/bars/${bar.name}/like`);
            }
            else
            {
               data= await axios.post(`${BASE_API_URL}/events/${bar._id}/like`);
            }
            console.log(data);

            alert(`You liked ${bar.name}!`);
        } catch (error) {
            console.error('Error while liking the bar:', error);
        }
    };

    const toggleView = () => {
        setIsBarsView(!isBarsView);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            <header style={headerStyles}>
            <button onClick={toggleView} style={toggleButtonStyles}>
                    {isBarsView ? 'מפת ארועים' : 'הברים'}
                </button>
            </header>
            <div ref={mapContainerRef} style={mapStyles} key={isBarsView ? 'bars-map' : 'events-map'} /> 
        </div>
    );
};

// עיצוב המפה (רספונסיבי לניידים)
const mapStyles = {
    width: '100%',
    height: 'calc(100vh - 60px)',
};

// עיצוב כפתור מעבר בין תצוגות (רספונסיבי)
const toggleButtonStyles = {
    padding: '5px 10px',          // גודל קטן יותר של כפתור
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',             // גודל גופן קטן
    position: 'absolute',         // מיקום מוחלט
    top: '10px',                  // מרווח מלמעלה (יותר גבוה)
    left: '10px',                // מרווח מימין (פינה ימנית)
    zIndex: '10',                 // מוודא שהכפתור יהיה מעל כל אלמנט אחר
};

// עיצוב כותרת
const headerStyles = {
    textAlign: 'center',
    padding: '0',
    backgroundImage: 'url("/img/logo.png")',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: 'white',
    height: '60px',
    width: '100%',
    fontWeight: 'bold',
    position: 'relative',       // מוודא שהכפתור יוכל להיות ממוקם יחסית לכותרת
    fontSize: '24px',           // גודל גופן של הכותרת
    paddingLeft: '40px', 
};

export default App;




/*
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
                    <div style="text-align: center; font-family: Arial, sans-serif; padding: 15px; border-radius: 15px; background: rgba(255, 255, 255, 0.9); box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); width: 250px;">
                        <h3 style="margin: 5px 0; color: #333; font-size: 18px; font-weight: bold;">${bar.name}</h3>
                        <div style="margin-bottom: 10px;">
                            ${bar.website ? 
                                `<a href="${bar.website}" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 14px;">Visit Website</a>` 
                                : bar.instagram ? 
                                    `<a href="${bar.instagram}" target="_blank" style="color: #E1306C; text-decoration: underline; font-size: 14px;">Follow Instagram</a>` 
                                    : '<span style="color: red; font-size: 14px;">Not Available</span>'
                            }
                        </div>
                    
                        <div style="margin-bottom: 10px;">
                            <strong style="font-size: 16px; color: #333;"><b>Drink Game Discounts</b></strong>
                        </div>
                    
                        <div style="font-size: 14px; color: green; margin-bottom: 10px;">
                            ${bar.discountOne ? `<p>${bar.discountOne}</p>` : ''}
                            ${bar.discountSec ? `<p>${bar.discountSec}</p>` : ''}
                            ${bar.discountThi ? `<p>${bar.discountThi}</p>` : ''}
                        </div>
                    
                        <div style="margin-top: 10px;">
                            <p><a href="${googleMapsLink}" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 14px;" data-bar-name="${bar.name}" class="google-maps-link">Get Directions</a></p>
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
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)', // צלליות למראה מודגש
    fontWeight: 'bold', // הדגשה
    letterSpacing: '1px', // ריווח בין אותיות
    lineHeight: '1.2',
};

// CSS to make it responsive and interactive
const responsiveStyles = `
    @media (max-width: 768px) {
        ${headerStyles} {
            font-size: 28px;
            padding: 30px 0;
        }
        .leaflet-container {
            width: 100%;
            height: 70vh;
        }
    }

    @media (max-width: 480px) {
        ${headerStyles} {
            font-size: 22px;
            padding: 20px 0;
        }
        .leaflet-container {
            width: 100%;
            height: 60vh;
        }
    }
`;

export default App;
*/