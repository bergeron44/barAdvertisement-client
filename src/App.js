import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';


//const BASE_API_URL = 'https://bangyourhead-server.onrender.com/api'; 
const BASE_API_URL = 'https://final-project-server-sk27.onrender.com/api'; 

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
        if(isBarsView)
          mapRef.current = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 15);
        else
        mapRef.current = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 20);
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
                 <div style="
                     text-align: center; 
                     font-family: 'Arial', sans-serif; 
                     padding: 20px; 
                     background: linear-gradient(135deg, #f5f5f5, #e6e6e6); 
                     color: #333; 
                     box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3); 
                     max-width: 350px; 
                     border-radius: 15px; 
                     border: 1px solid #ccc;
                     position: relative;
                     overflow: hidden;
                 ">
                     <h3 style="
                         margin: 0 0 15px; 
                         font-size: 18px; 
                         font-weight: bold; 
                         color: #333;
                     ">${bar.name}</h3>
                     
                     <div style="
                         margin-bottom: 15px; 
                         font-size: 14px; 
                         color: #555;
                     ">
                         ${bar.website ? 
                             `<a href="${bar.website}" target="_blank" style="
                                 color: #007bff; 
                                 text-decoration: underline; 
                                 font-weight: bold;">Website</a>` 
                             : bar.instagram ? 
                                 `<a href="${bar.instagram}" target="_blank" style="
                                     color: #555; 
                                     text-decoration: underline; 
                                     font-weight: bold;">Instagram</a>` 
                                 : '<span style="color: #999;">Not Available</span>'
                         }
                     </div>
                     
                     <div style="
                         font-size: 14px; 
                         color: #d9534f; 
                         margin-bottom: 10px; 
                         font-weight: bold;">
                         <b>!מבצעים</b>
                     </div>
                     
                     <div style="
                         font-size: 12px; 
                         color: #333; 
                         margin-bottom: 15px; 
                         background: rgba(255, 255, 255, 0.85); 
                         padding: 10px; 
                         border-radius: 10px; 
                         border: 1px solid #ddd;">
                         ${bar.discountOne ? `<p style="margin: 5px 0;">${bar.discountOne}</p>` : ''}
                         ${bar.discountSec ? `<p style="margin: 5px 0;">${bar.discountSec}</p>` : ''}
                         ${bar.discountThi ? `<p style="margin: 5px 0;">${bar.discountThi}</p>` : ''}
                     </div>
                     
                     <button class="like-button" data-bar-name="${bar.name}" style="
                         padding: 12px 20px; 
                         background: linear-gradient(135deg, #333, #555); 
                         color: white; 
                         border: none; 
                         border-radius: 10px; 
                         font-size: 14px; 
                         cursor: pointer; 
                         width: 100%; 
                         text-transform: uppercase;
                         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                         transition: all 0.3s ease-in-out;
                     "
                     onmouseover="this.style.background='linear-gradient(135deg, #555, #777)'; this.style.transform='scale(1.05)'"
                     onmouseout="this.style.background='linear-gradient(135deg, #333, #555)'; this.style.transform='scale(1)'">
                         מעוניין בארוע
                     </button>
                     
                     <p style="
                         margin-top: 15px; 
                         font-size: 12px; 
                         color: #333; 
                         font-weight: bold;">
                         <a href="${googleMapsLink}" target="_blank" style="
                             color: #007bff; 
                             text-decoration: underline;">נווט לבר</a>
                     </p>
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
    <div style="
        text-align: center; 
        font-family: 'Poppins', Arial, sans-serif; 
        padding: 20px; 
        background: linear-gradient(135deg, #ff9a9e, #fad0c4, #fbc2eb); 
        color: #000; 
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); 
        max-width: 350px; 
        border-radius: 20px; 
        overflow: hidden; 
        position: relative;
        animation: popUp 0.6s ease-out;
    ">
        <div style="
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.4), transparent); 
            pointer-events: none;">
        </div>
        <h3 style="
            margin: 0; 
            font-size: 22px; 
            font-weight: bold; 
            color: #000; 
            text-shadow: none;
        ">${bar.name}</h3>
        <div style="
            margin: 15px 0; 
            font-size: 16px; 
            font-weight: 500; 
            background: rgba(255, 255, 255, 0.8); 
            padding: 10px; 
            border-radius: 10px;
        ">
            ${bar.website ? 
                `<a href="${bar.website}" target="_blank" style="
                    color: #007bff; 
                    text-decoration: underline; 
                    font-weight: bold;">להזמנת כרטיסים</a>` 
                : bar.instagram ? 
                    `<a href="${bar.instagram}" target="_blank" style="
                        color: #007bff; 
                        text-decoration: underline; 
                        font-weight: bold;">Instagram</a>` 
                    : '<span style="color: red;">Not Available</span>'
            }
        </div>
        <div style="
            margin-bottom: 15px; 
            font-size: 14px; 
            color: #000; 
            background: rgba(255, 255, 255, 0.8); 
            padding: 10px; 
            border-radius: 10px;">
            ${bar.description ? `<p>${bar.description}</p>` : ''}
        </div>
        <div style="
            margin-bottom: 15px; 
            font-size: 14px; 
            color: #000; 
            font-weight: bold;">
            ${bar.date ? `<p>📅 תאריך: ${new Date(bar.date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
        </div>
        <button class="like-button" data-bar-name="${bar.name}" style="
            padding: 12px 20px; 
            background: linear-gradient(135deg, #ff758c, #ff7eb3); 
            color: white; 
            border: none; 
            border-radius: 15px; 
            font-size: 14px; 
            cursor: pointer; 
            width: 100%; 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
            transition: all 0.4s ease-in-out;
        " 
        onmouseover="this.style.background='linear-gradient(135deg, #ff4a78, #ff758c)'; this.style.transform='scale(1.05)'" 
        onmouseout="this.style.background='linear-gradient(135deg, #ff758c, #ff7eb3)'; this.style.transform='scale(1)'">
            מעוניין בארוע
        </button>
        <p style="
            margin-top: 15px; 
            font-size: 14px; 
            font-weight: bold;">
            <a href="${googleMapsLink}" target="_blank" style="
                color: #007bff; 
                text-decoration: underline;">נווט</a>
        </p>
    </div>

    <style>
        @keyframes popUp {
            from {
                transform: scale(0.8);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    </style>
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
    const handlePhoneClick=()=> {
        alert('ליצירת קשר : 0547456817   ');
      }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            <header style={headerStyles}>
            <button onClick={toggleView} style={toggleButtonStyles}>
                    {isBarsView ? ' לארועים' : 'להנחות'}
                </button>
                <button onClick={handlePhoneClick} style={phoneButtonStyles}>
                      📞
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
    padding: '0',                // מבטל ריווח פנימי כדי לשלוט טוב יותר על הגודל
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',            // גודל גופן קטן
    position: 'absolute',        // מיקום מוחלט
    top: '10%',                  // ממקם מלמעלה ביחס לגובה
    left: '2%',                 // ממקם משמאל ביחס לרוחב
    zIndex: '10',                // מעל כל אלמנט אחר
    width: '15%',                // רוחב 20% מהאלמנט ההורה
    height: '80%',               // גובה 80% מהאלמנט ההורה
    display: 'flex',             // מאפשר מרכזיות בתוכן
    alignItems: 'center',        // מרכז אנכית
    justifyContent: 'center',    // מרכז אופקית
};
const phoneButtonStyles = {
    padding: '7px 12px',          // Small button size
    background: 'white',        // Button background color (blue)
    color: 'white',               // White text color
    border: '1px solid #007bff', // Matches the button's background color
    borderRadius: '5px',          // Rounded corners
    cursor: 'pointer',            // Pointer cursor on hover
    fontSize: '20px',             // Small font size
    position: 'absolute',         // Position relative to the container
    top: '10px',                  // Top margin (higher up)
    right: '40px',                // Right margin (right corner)
    zIndex: '10',                 // Ensures the button is above other elements
  };

// עיצוב כותרת
const headerStyles = {
    position: 'fixed', /* שמירה על המיקום */
    textAlign: 'center',
    padding: '0',
    backgroundImage: 'url("/img/logo.png")',
    backgroundSize: '60%',  
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