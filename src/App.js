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
      // פונקציה לסינון הארועים לפי תאריך
      const filterEventsByDate = (events) => {
        const currentDate = new Date();
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate > currentDate; // מחזיר רק אירועים שהתאריך שלהם אחרי התאריך הנוכחי
        });
    };

    // הבאת נתונים מה-API
    const fetchData = async (endpoint) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_API_URL}/${endpoint}`);
            let filteredData = response.data;
            if (!isBarsView) {
                // אם אנחנו בתצוגת הארועים, נבצע סינון לפי תאריך
                filteredData = filterEventsByDate(filteredData);
            }
            setData(filteredData);
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
        window.handleLikeClick = handleLikeClick;
        if (!mapContainerRef.current) return;
        
        // הסרת מפה קיימת במקרה שהיא נטענה כבר
        if (mapRef.current) {
            mapRef.current.remove();
        }
         
        // יצירת מפה חדשה
        if(isBarsView)
          mapRef.current = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 14);
        else
          mapRef.current = L.map(mapContainerRef.current).setView([31.2622, 34.8013], 17);
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
                if(bar.id===1)
                {
                    iconUrl = bar.imageUrl ? `/img/${bar.name.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/sport.jpg';

                    barIcon = L.divIcon({
                       html: `<img src="${iconUrl}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
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
                        background: linear-gradient(135deg, #a8dadc, #f3c6c1);
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
                            <b>!חבילות בלעדיות למשחקי השתייה</b>
                        </div>
                        
                       <div style="
                            font-size: 12px; 
                            color: #333; 
                            margin-bottom: 15px; 
                            padding: 10px; 
                            border-radius: 10px; 
                            border: 1px solid #ddd;
                            background-color: white; /* רקע לבן */
                        ">
                            ${bar.discountOne ? `<p style="
                                margin: 5px 0; 
                                font-weight: bold; 
                                font-size: 14px; 
                                color: #e91e63; /* צבע אדום-ורוד */
                                text-transform: uppercase;
                            ">${bar.discountOne}</p>` : ''}
                            ${bar.discountSec ? `<p style="
                                margin: 5px 0; 
                                font-weight: normal; 
                                font-size: 14px; 
                                color: #9c27b0; /* צבע ארגמן */
                                text-transform: uppercase;
                            ">${bar.discountSec}</p>` : ''}
                            ${bar.discountThi ? `<p style="
                                margin: 5px 0; 
                                font-weight: normal; 
                                font-size: 14px; 
                                color: #f06292; /* צבע ורוד חזק */
                                text-transform: uppercase;
                            ">${bar.discountThi}</p>` : ''}
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
                          בא לי על ההנחה
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
                else if (bar.id === 0) {
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/sport.jpg';
                
                    barIcon = L.divIcon({
                        html: `<img src="${iconUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 3px solid white;" alt="University"/>`,
                        iconSize: [70, 70],
                        className: 'custom-icon',
                    });
                
                    marker = L.marker([bar.lat, bar.lng], { icon: barIcon }).addTo(mapRef.current);
                
                    popupContent = `
                    <div style="
                        text-align: center; 
                        font-family: 'Arial', sans-serif; 
                        padding: 20px; 
                        background: linear-gradient(135deg, #f8f9fa, #cfe8f3);
                        color: #333; 
                        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3); 
                        max-width: 350px; 
                        border-radius: 15px; 
                        border: 2px solid #007bff;
                    ">
                        <h3 style="
                            margin: 0 0 15px; 
                            font-size: 20px; 
                            font-weight: bold; 
                            color: #007bff;
                        ">University Campus</h3>
                        
                        <p style="
                            margin-bottom: 20px; 
                            font-size: 14px; 
                            color: #555;
                        "> האוניברסיטה</p>
                
                    </div>
                    `;
                
                }
                else
                {
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/sport.jpg';

                    barIcon = L.divIcon({
                        html: `<img src="${iconUrl}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
                        iconSize: [40, 40], // כאן קטנו את האייקון
                        className: 'custom-icon',
                     });
                     
                     marker = L.marker([bar.lat, bar.lng], { icon: barIcon }).addTo(mapRef.current);
                     
                     // יצירת popupContent חדש עם סדר חדש
                     googleMapsLink = `https://www.google.com/maps?q=${bar.lat},${bar.lng}`;
                     
                     popupContent = `
                         <div style="
                             text-align: center; 
                             font-family: 'Arial', sans-serif; 
                             padding: 20px; 
                             background: linear-gradient(135deg, #a8dadc, #ffffff); 
                             color: #333; 
                             box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3); 
                             max-width: 100%; 
                             width: 350px;
                             border-radius: 15px; 
                             border: 1px solid #ccc;
                             position: relative;
                             overflow: hidden;
                             box-sizing: border-box;
                         ">
                             <!-- תמונה בראש הפופאפ -->
                          <img src="img/student7.jpeg" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;"/>
                     
                             <!-- שם -->
                             <h3 style="
                                 margin: 0 0 15px; 
                                 font-size: 18px; 
                                 font-weight: bold; 
                                 color: #333;
                             ">${bar.name}</h3>
                     
                             <!-- הנחות -->
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
                                        padding: 10px; 
                                        border-radius: 10px; 
                                        border: 1px solid #ddd;
                                        background-color: white; /* רקע לבן */
                                    ">
                                        ${bar.discountOne ? `<p style="
                                            margin: 5px 0; 
                                            font-weight: bold; 
                                            font-size: 14px; 
                                            color: #e91e63; /* צבע אדום-ורוד */
                                            text-transform: uppercase;
                                        ">${bar.discountOne}</p>` : ''}
                                        ${bar.discountSec ? `<p style="
                                            margin: 5px 0; 
                                            font-weight: normal; 
                                            font-size: 14px; 
                                            color: #9c27b0; /* צבע ארגמן */
                                            text-transform: uppercase;
                                        ">${bar.discountSec}</p>` : ''}
                                        ${bar.discountThi ? `<p style="
                                            margin: 5px 0; 
                                            font-weight: normal; 
                                            font-size: 14px; 
                                            color: #f06292; /* צבע ורוד חזק */
                                            text-transform: uppercase;
                                        ">${bar.discountThi}</p>` : ''}
                                    </div>
                     
                                                            <!-- כפתור למימוש ההטבה (כמו כפתור לייק) -->
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
                                        onmouseout="this.style.background='linear-gradient(135deg, #333, #555)'; this.style.transform='scale(1)'"
                                        onclick="handleLikeClick('${bar.name}')">
                                            למימוש ההנחה 
                                        </button>
                     
                             <!-- ניווט למיקום -->
                             <p style="
                                 margin-top: 15px; 
                                 font-size: 12px; 
                                 color: #333; 
                                 font-weight: bold;">
                                 <a href="${googleMapsLink}" target="_blank" style="
                                     color: #007bff; 
                                     text-decoration: underline;">Navigate</a>
                             </p>
                         </div>
                     `;
                }
               
            }
            else
            {
                iconUrl = bar.photo ? `/img/${bar.type.toLowerCase().replace(/\s+/g, '-')}.jpeg` : '/img/default-bar.jpg';

                barIcon = L.divIcon({
                   html: `<img src="${iconUrl}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
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
                אני אגיע
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
                if(bar.id===2)
                {
                    const url = bar.website || bar.instagram;  
                    if (url) {
                        window.open(url, '_blank');
                    }
                    else
                    {
                        alert(`Get Loose ותחפש ברקוד של  ${bar.name} לך לבר `);
                    }
                }
            }
            else
            {
               data= await axios.post(`${BASE_API_URL}/events/${bar._id}/like`);
            }
            console.log(data);

            
        } catch (error) {
            console.error('Error while liking the bar:', error);
        }
    };

    const toggleView = () => {
        setIsBarsView(!isBarsView);
    };
    const handlePhoneClick=()=> {
        alert('יש לך הנחה או ארוע לסטודנטים שבא לך שנכניס התקשר  : 0547456817   ');
      }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            <header style={headerStyles}>
            <button onClick={toggleView} style={toggleButtonStyles}>
                    {isBarsView ? ' Top 10 לארועים' : 'Top 20 להנחות'}
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


