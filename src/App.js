import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';


//const BASE_API_URL = 'https://bangyourhead-server.onrender.com/api'; 
const BASE_API_URL = 'https://final-project-server-sk27.onrender.com/api'; 

const locations = {
    "Beer Sheva": { lat: 31.252121, lng: 34.786609 },
    "Ben Gurion University of the Negev": { lat: 31.261436,lng: 34.799552},
    "Zalman Aranne Central Library": { lat: 31.262074, lng: 34.800803 },
    "Kreitman Building": { lat: 31.262092,lng: 34.802325 },
    "Mexicani Ben Gurion": { lat: 31.261990,lng: 34.804332},
    "The student house building 70": { lat: 31.263123, lng: 34.801976 },
    "Building 90 Ben Gurion University": { lat: 31.264854,  lng: 34.803088 },
    "Husidman Center for science-seeking youth": { lat: 31.261327, lng: 34.801319 },
    "Parking 1 Ben Gurion University": { lat: 31.263488, lng: 34.799791},
    "Sports Center Ben-Gurion University": { lat: 31.261853, lng:  34.807128 },
    "Gate of Mexico Ben Gurion University": { lat: 31.262344, lng: 34.805657},
    "Building 34 Ben Gurion University": { lat: 31.262046, lng: 34.803392 },
    "Ben Gurion Soroka Gate": { lat: 31.261276 , lng: 34.801194 },

    "Writers Park": { lat: 31.255490, lng: 34.788592},
    "Block": { lat: 31.259226, lng: 34.797065},
    "Soroka Medical Center": { lat: 31.258022,lng: 34.800301},
    "Performing Arts Center Beer Sheva": { lat: 31.251716, lng: 34.797173},
    "The old city of Beer Sheva": { lat: 31.239323, lng: 34.790232},
    "Carasso Science Park": { lat: 31.241991, lng: 34.786072},
    "Ofer Grand Canyon": { lat: 31.251187, lng: 34.771704},
    "Shchuna B": { lat: 31.255540, lng: 34.787802},
    "Shchuna D": { lat: 31.264954, lng:  34.795510},
    "Shchuna C": { lat: 31.253914, lng: 34.805580},
    "Big Beer Sheva": { lat: 31.245246, lng: 34.811500},
    "Gav-Yam Negev Advanced Technologies Park": { lat: 31.265103, lng: 34.814307},
    "Ramot": { lat: 31.273787,lng: 34.811362},
    "Turner Stadium": { lat: 31.274092,lng: 34.779327}, 
    "Forum club": { lat: 31.221058,  lng: 34.803028},
    "Beer Sheva River Park": { lat: 31.237292,  lng: 34.828784},
    "Beer Sheva Youth Center": { lat: 31.241839 ,  lng: 34.788323},
    
    
    "Rega B Park Beer Sheva": { lat: 31.257014, lng: 34.794165},
    "Bengi": { lat: 31.264579, lng: 34.797307},
    "Lee Office": { lat: 31.264396, lng: 34.798339},
    "BarGiora": { lat: 31.2612,lng: 34.7925},
    "Ashanhazman": { lat: 31.237619,lng: 34.788384},
    "SassonBar": { lat: 31.2401,lng: 34.7886},
    "Mileva": { lat: 31.2617,lng: 34.7965},
    "BarBaSaba": { lat: 31.2476,lng: 34.7988},
    "JEMS": { lat: 31.2634,lng: 34.8106},
    "nano": { lat: 31.2583,lng: 34.7932},
    "ringelblum13": { lat: 31.2675,lng: 34.8002},
    "מיני שני": { lat: 31.258708,lng: 34.794616},
   "החומוס של טחינה": { lat: 31.26511,lng: 34.80084},
   "Friends": { lat: 31.258293,lng:34.794646},
   "Pub Giza": { lat: 31.254511,lng: 34.790957},
   "Zalame ACB": { lat: 31.243063,lng: 34.804604},
   "Château D'Or": { lat: 31.240597,lng: 34.788716},
   "Roots Bar & Kitchen": { lat: 31.267882,lng: 34.800137},
   "halutz 33": { lat: 31.238207,lng: 34.788143},
};


const App = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBarsView, setIsBarsView] = useState(true);
    const [isFirstEnter, setFirstEnter] = useState(true);
    
    const filterAndSortEvents = (events) => {
        const currentDate = new Date();
        const thirtyDaysLater = new Date(currentDate);
        thirtyDaysLater.setDate(currentDate.getDate() + 30);
    
        console.log("Current Date:", currentDate);
        console.log("Thirty Days Later:", thirtyDaysLater);
    
        // סינון האירועים שמתקיימים תוך 30 ימים
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            console.log("Event Date:", eventDate);
            return eventDate > currentDate && eventDate <= thirtyDaysLater;
        });
        console.log("Filtered Events:", filteredEvents);
    
        // החזרת מערך האירועים
        return filteredEvents;
    };
    
    
    const filterClosestEvents = (events) => {
        const currentDate = new Date();
        // סינון אירועים עתידיים
        const futureEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate > currentDate;
        });
    
        // מיון לפי תאריך
        const sortedEvents = futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        // אם יש פחות מ-20, פשוט מחזירים את כל מה שיש
        console.log(sortedEvents);
        return sortedEvents.slice(0, 10);
    };


    // הבאת נתונים מה-API
    const fetchData = async (endpoint) => {
        setLoading(true);
        try {
            /*
            if(isFirstEnter)
            {
                const data =await axios.post(`${BASE_API_URL}/bars/benGurionUniversity/like`);
                console.log(data);
                setFirstEnter(false);
            }
             */
            console.log(isFirstEnter);
            const response = await axios.get(`${BASE_API_URL}/${endpoint}`);
            let filteredData = response.data;
            if (!isBarsView) {
                // אם אנחנו בתצוגת הארועים, נבצע סינון לפי תאריך
                filteredData = filterAndSortEvents(filteredData);
            }
            setData(filteredData);
            
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };
     // שליחת בקשת POST פעם אחת בכניסה לאתר
     
     useEffect(() => {
        const sendInitialLike = async () => {
            try {
                if (isFirstEnter) {
                    setFirstEnter(false); // מונע בקשות נוספות
                    const data=await axios.post(`${BASE_API_URL}/bars/benGurionUniversity/like`);
                    console.log("Initial like sent successfully!");
                    console.log(data.data);
                }
            } catch (err) {
                console.error("Failed to send initial like:", err);
            }
        };

        sendInitialLike();
    }, []); // useEffect רץ רק פעם אחת כאשר הקומפוננטה נטענת
     
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
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}` : '/img/sport.jpg';

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
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}` : '/img/bengurionuniversity.jpeg';
                
                    barIcon = L.divIcon({
                                            html: `<img src="${iconUrl}" 
                        style="width: 40px; 
                                height: 40px; 
                                border-radius: 50%; 
                                object-fit: cover; 
                                border: 3px solid white; 
                                transition: transform 0.3s ease;" 
                        onmouseover="this.style.transform='scale(1.3)'" 
                        onmouseout="this.style.transform='scale(1)'"
                        alt="University"/>`,
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
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}` : '/img/sport.jpg';

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
                                    background: url('img/student7bg.png'); 
                                    background-size: cover; 
                                    background-position: center center;
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
                      <h3 style="
                                 margin: 0 0 15px; 
                                 font-size: 18px; 
                                 font-weight: bold; 
                                 color: #333;
                             "></h3></br></br></br>
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
                iconUrl = bar.photo && bar.photo.trim() !== ""  ? `/img/${bar.photo.toLowerCase().replace(/\s+/g, '-')}`   : (bar.type && bar.type.trim() !== ""  ? `/img/type/${bar.type.toLowerCase().replace(/\s+/g, '-')}.jpeg`  : '/img/aguda.png');
                barIcon = L.divIcon({
                   html: `<img src="${iconUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
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
                        background: url('img/agudabest3.png'); 
                        background-size: cover; 
                        background-position: center center;
                        color: #000; 
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); 
                        max-width: 350px; 
                        border-radius: 20px; 
                        overflow: hidden; 
                        position: relative;
                        animation: popUp 0.6s ease-out;
                    ">
                    <br/><br/><br/><br/><br/>
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
                    
                }
                else
                {
                        alert(`Get Loose ותחפש ברקוד של  ${bar.name} לך לבר `);
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
        alert('יש לך הנחה או ארוע לסטודנטים שבא לך שנכניס שלח וואטצאפ למספר - 0547456817   ');
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
    zIndex: '1', /* המפה מתחת להדר */
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


