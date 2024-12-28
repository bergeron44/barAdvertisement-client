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
const phoneNumbers={
    "Bengi": "972",
    "Lee Office": "972",
    "BarGiora": "972526469647",
    "Ashanhazman": "972544358915",
    "SassonBar": "972526890151",
    "Mileva": "972504800077",
    "BarBaSaba": "972544988414",
    "JEMS": "972507864130",
    "nano": "972548183925",
    "ringelblum13": "972522796201",
    "מיני שני": "972",
   "Friends": "972",
   "Pub Giza": "972",
   "Zalame ACB": "972",
   "Château D'Or": "972",
   "Roots Bar & Kitchen": "972",
   "halutz 33": "972",
}


const App = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBarsView, setIsBarsView] = useState(true);
    const [isFirstEnter, setFirstEnter] = useState(true);
    const [location, setLocation] = useState(null);
    const [ip, setIp] = useState(null);
    const hasSentToServer = useRef(false); // וידוא שהשליחה מתבצעת רק פעם אחת
    const hasDidLike = useRef(false);
    
    const filterAndSortEvents = (events) => {
        const currentDate = new Date();
        const thirtyDaysLater = new Date(currentDate);
        thirtyDaysLater.setDate(currentDate.getDate() + 30);
    
    
        // סינון האירועים שמתקיימים תוך 30 ימים
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate > currentDate && eventDate <= thirtyDaysLater;
        });
    
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

     ////////////////
     //נסיון הכנסה מיקום ואיי פי של מכשיר
     ////////////////
     const sendToServer = async () => {
        if (!hasSentToServer.current && ip && location) {            
            try {
                await axios.post(`${BASE_API_URL}/visited/create`, {
                    ip, // כתובת ה-IP של המכשיר
                    latitude: location.latitude, // קואורדינטת רוחב
                    longitude: location.longitude, // קואורדינטת אורך
                });
                console.log('Visited instance created successfully:', { ip, ...location });
                hasSentToServer.current = true; // סימון שהשליחה התבצעה
            } catch (error) {
                console.error('Error sending visited data to server:', error);
            }
            
        }
      };
    
      useEffect(() => {
        // פונקציה לקבלת מיקום
        const fetchLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
              },
              (error) => {
                console.error('Error fetching location:', error);
              }
            );
          } else {
            console.error('Geolocation is not supported by this browser.');
          }
        };
    
        // פונקציה לקבלת IP
        const fetchIP = async () => {
          try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIp(response.data.ip);
          } catch (error) {
            console.error('Error fetching IP:', error);
          }
        };
    
        fetchLocation();
        fetchIP();
      }, []); // הרצה פעם אחת בעת טעינת הקומפוננטה
    
      useEffect(() => {
        // שליחת הנתונים לשרת אם כל הנתונים קיימים
        if (ip && location) {
          sendToServer();
        }
      }, [ip, location]); // מפעיל את הפונקציה כאשר ה-IP או המיקום מתעדכנים
      ////////////
      //סוף
      ////////////


     useEffect(() => {
        const sendInitialLike = async () => {
            try {
                if (isFirstEnter) {
                    setFirstEnter(false); // מונע בקשות נוספות
                    const data=await axios.post(`${BASE_API_URL}/bars/benGurionUniversity/like`);
                    console.log("Initial like sent successfully!");
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
        window.handleFormSubmit=handleFormSubmit;
        window.handleWhatsAppClick=handleWhatsAppClick;
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
                       html: `<img src="${iconUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
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
                                    background: url('img/getloosecard5.png'); 
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
                                "><br/><br/><br/>
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
                              color: #000000; 
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
                            style="width: 60px; 
                                    height: 60px; 
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
                        ">! הדעה שלך חשובה לנו מאוד !</h3>
                        
                        <p style="
                            margin-bottom: 20px; 
                            font-size: 14px; 
                            color: #555;
                        ">  🎁!מלאו את דעתכם וכנסו להגרלה על הטבה🎁</p>
                
                        <!-- טופס חוות דעת -->
                      <form id="feedbackForm" style="display: flex; flex-direction: column; align-items: center; width: 80%; margin: 0 auto;">
    <input type="email" id="email" name="email" placeholder="הכנס את המייל שלך" required
           style="width: 80%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;">
    
    <textarea id="feedback" name="feedback" placeholder="הכנס את חוות הדעת שלך" required
              style="width: 80%; padding: 10px; height: 100px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
    
    <button type="button" 
            style="padding: 12px 20px; 
                   background: linear-gradient(135deg, #333, #555); 
                   color: white; 
                   border: none; 
                   border-radius: 10px; 
                   font-size: 14px; 
                   cursor: pointer; 
                   width: 100%; 
                   text-transform: uppercase;
                   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                   transition: all 0.3s ease-in-out;"
            onmouseover="this.style.background='linear-gradient(135deg, #555, #777)'; this.style.transform='scale(1.05)'" 
            onmouseout="this.style.background='linear-gradient(135deg, #333, #555)'; this.style.transform='scale(1)'"
            onclick="handleFormSubmit(event)">
        שלח
    </button>
</form>
                    </div>
                    `;
                
                    // הצגת הפופאפ
                    //marker.bindPopup(popupContent).openPopup();
                }
                else if(bar.id===3)
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
                                        background: url('img/agudabest3.png'); 
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
                else
                {
                    iconUrl = bar.imageUrl ? `/img/${bar.imageUrl.toLowerCase().replace(/\s+/g, '-')}` : '/img/sport.jpg';

                    barIcon = L.divIcon({
                        html: `<img src="${iconUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white;" alt="${bar.name}"/>`,
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
                        background: url('img/newaguda.png'); 
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
                    <br/><br/><br/><br/><br/><br/>
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
                        
                  ${bar.likes > 5 ? 
                                    `<div style="
                                        margin: 15px 0; 
                                        font-size: 16px; 
                                        font-weight: 500; 
                                        background: linear-gradient(135deg, #ff0000, #ffffff); 
                                        padding: 8px; /* גובה מוקטן */
                                        border-radius: 15px; 
                                        color: black; 
                                        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); 
                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
                                        text-align: center;">
                                        <h4 style="margin: 0; font-size: 18px;">  לייקים  ${bar.likes} 👍</h4>
                                    </div>` 
                                    : 
                                    `<div style="
                                        margin: 15px 0; 
                                        font-size: 16px; 
                                        font-weight: 500; 
                                        background: linear-gradient(135deg, #1e3a8a, #87ceeb, #ffffff);
                                        padding: 8px; /* גובה מוקטן */
                                        border-radius: 15px; 
                                        color: black; 
                                        text-align: center; 
                                        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); 
                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
                                        <h4 style="margin: 0; font-size: 18px;">  👇 ? מה לא  תבואו 👇  </h4>
                                    </div>`
                                }
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
                          בא לי על הארוע
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
            let data;
    
            if (isBarsView) {
                // שליחת לייק לבר
                data = await axios.post(`${BASE_API_URL}/bars/${bar.name}/like`);
    
                // בדיקת ID של הבר
                if (bar.id === 2 || bar.id === 3) {
                    const url = bar.website || bar.instagram;
                    if (url) {
                        window.location.href = url; // הפניה ישירה
                    } else {
                        alert("אין קישור זמין עבור הבר הזה.");
                    }
                } else {
                    if (phoneNumbers[bar.name]) {
                        handleBarToWhatsUpClick(bar.name);
                    } else {
                        alert(`לך לבר ${bar.name} ותחפש ברקוד של Get Loose`);
                    }
                    
                }
            } else {
                    data = await axios.post(`${BASE_API_URL}/events/${bar._id}/like`);
                    hasDidLike.current = true;
                    const url = bar.website || bar.instagram;
                    if (url) {
                        window.location.href = url; // הפניה ישירה
                    } else {
                        alert("אין קישור זמין עבור האירוע הזה.");
                    }
                
            }
        } catch (error) {
            console.error("Error while liking the bar:", error);
        }
    };
    const toggleView = () => {
        setIsBarsView(!isBarsView);
    };
    const handlePhoneClick=()=> {
        alert('יש לך הנחה או ארוע לסטודנטים שבא לך שנכניס שלח וואטצאפ למספר - 0547456817   ');
      }
    const handleFormSubmit = async (event) => {
        event.preventDefault(); // מניעת רענון הדף
        const email = document.getElementById('email').value;
        const feedback = document.getElementById('feedback').value;
        console.log(email);
        console.log(feedback);


        const userData = {
            email: email,
            review: feedback
        };
    
        try {
            // יצירת הבקשה עם BASE_API_URL כמו שעשית ב-axios
            const response = await fetch(`${BASE_API_URL}/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // אם התשובה לא בסדר (status לא 2xx), נזרוק שגיאה
            if (!response.ok) {
                throw new Error('הייתה בעיה עם בקשת השרת');
            }
    
            // ממתינים לתגובה מהשרת
            const data = await response.json();
            if (data.date && data.date !== "") {
                alert(' נכנסת להגרלה ,הפרסים שתוכל לזכות בעמוד האינסטגרם');
                // שלח לעמוד האינסטגרם
                window.location.href = "https://www.instagram.com/get_l0ose";
            } else {
                alert('הייתה בעיה ביצירת המשתמש: ' + data.message);
            }
        } catch (error) {
            console.error('שגיאה בשליחה:', error);
            alert('אירעה שגיאה בשליחה. אנא נסה שוב.');
        }
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = '972547456817'; // פורמט בינלאומי (לישראל 972) ללא 0 מוביל
        const message = encodeURIComponent('יש לי הנחהֿֿ|אירוע לסטודנטים');
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank'); // פתיחת הקישור בלשונית חדשה
      };
    const handleBarToWhatsUpClick = (barName) => {
        const phoneNumber = phoneNumbers[barName]; // קבל את מספר הטלפון מתוך המילון
        const message = encodeURIComponent(' שלום! 😇 Get Loose סיפרו לי עליך והייתי שמח להזמין מקום ולהתחיל לשחק🍻 🤩💸 ');
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.location.href = url;
          };

    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            <header style={headerStyles}>
            <button onClick={toggleView} style={toggleButtonStyles}>
                    {isBarsView ? ' לאירועים' : ' להנחות'}
                </button>
                <button onClick={handleWhatsAppClick} style={phoneButtonStyles}>
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

const mapButtonStyles = `
    .leaflet-control-zoom {
        position: absolute;
        bottom: 20px; /* מיקום מלמטה */
        left: 10px; /* מיקום משמאל */
        z-index: 1000; /* מבטיח שהכפתורים יהיו מעל למפה */
    }
`;

// הוספת ה-CSS למסמך
const styleElement = document.createElement("style");
styleElement.textContent = mapButtonStyles;
document.head.appendChild(styleElement);

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
    right: '1px',                // Right margin (right corner)
    zIndex: '10',                 // Ensures the button is above other elements
  };

// עיצוב כותרת
const headerStyles = {
    position: 'fixed', /* שמירה על המיקום */
    textAlign: 'center',
    backgroundImage: 'url("/img/newlogo.png")',
    backgroundSize: 'cover',  /* עדכון ל-cover כדי שהרקע יכסה הכל */
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: 'white',
    height: '60px',
    width: '100%',
    fontWeight: 'bold',
    fontSize: '24px',  /* גודל גופן של הכותרת */
    zIndex: 10, /* מבטיח שה-header מעל המפה */
    display: 'flex', /* שימוש ב-flex עבור יישור הכותרת */
    alignItems: 'center', /* יישור אנכי */
    justifyContent: 'center', /* יישור אופקי */
};

export default App;


