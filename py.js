// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    /*************** GEMINI API CONFIGURATION ***************/
    const GEMINI_API_KEY = "AIzaSyDdM6h4HDQH7pgqbR9SafsgjHNyGTtDLNY"; // User-provided API Key
    const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    /********************************************************/

    /******************** FIREBASE SETUP ********************/
    let db, auth;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'wellness-center-app';
    try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        if (Object.keys(firebaseConfig).length > 0) {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(auth, __initial_auth_token);
                        } else {
                            await signInAnonymously(auth);
                        }
                    } catch (authError) {
                        console.error("Firebase auth failed:", authError);
                    }
                }
            });
        } else {
            console.warn("Firebase config is missing. Feedback functionality will be disabled.");
        }
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
    /********************************************************/

    // General Elements
    const preloader = document.getElementById("preloader");
    const appContent = document.getElementById("app-content");
    const navLinks = document.querySelectorAll(".nav-link");
    const pageContents = document.querySelectorAll(".page-content");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // Triage Elements
    const triageResultsContainer = document.getElementById('triage-results-container');
    const symptomsEl = document.getElementById("symptoms");
    const triageBtn = document.getElementById("triageBtn");
    const loader = document.getElementById("loader");
    const riskBadge = document.getElementById("riskBadge");
    const emergencyBanner = document.getElementById("emergencyBanner");
    const conditionsEl = document.getElementById("conditions");
    const explanationEl = document.getElementById("explanation");
    const adviceEl = document.getElementById("advice");
    const medicineEl = document.getElementById("medicine");
    const remediesEl = document.getElementById("remedies");
    const youtubeLinksEl = document.getElementById("youtube-links");
    const micBtn = document.getElementById("micBtn");
    const playBtn = document.getElementById("playBtn");
    const findHospitalsBtn = document.getElementById("findHospitalsBtn");
    const resultError = document.getElementById("resultError");
    const mapStatus = document.getElementById("mapStatus");
    const languageSelect = document.getElementById("languageSelect");
    const consultAiDoctorBtn = document.getElementById('consultAiDoctorBtn');
    const thumbUpBtn = document.getElementById('thumbUp');
    const thumbDownBtn = document.getElementById('thumbDown');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const conditionsLabel = document.getElementById('conditionsLabel');
    const explanationLabel = document.getElementById('explanationLabel');
    const adviceLabel = document.getElementById('adviceLabel');
    const medicineLabel = document.getElementById('medicineLabel');
    const remediesLabel = document.getElementById('remediesLabel');
    const youtubeLabel = document.getElementById('youtubeLabel');
    const healthTipsContainer = document.getElementById('health-tips-container');

    // AI Doctor Elements
    const aiDoctorContainer = document.getElementById('ai-doctor-container');
    const aiDoctorChatWindow = document.getElementById('ai-doctor-chat-window');
    const aiDoctorInputContainer = document.getElementById('ai-doctor-input-container');
    const aiDoctorInput = document.getElementById('ai-doctor-input');
    const aiDoctorSendBtn = document.getElementById('ai-doctor-send');
    const quickRepliesContainer = document.getElementById('quick-replies-container');
    const aiDoctorStatus = document.getElementById('ai-doctor-status');
    const aiAssistantTitle = document.getElementById('ai-assistant-title');

    // Emergency Page Elements
    const emergencyContactsList = document.getElementById('emergency-contacts-list');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationMessage = document.getElementById('location-message');

    let lastOutcome = null;
    let chatHistory = [];
    let chatMode = 'general'; // 'general' or 'emergency'
    let availableVoices = [];

    /********************** THEME SWITCHER **********************/
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'light') {
            htmlEl.classList.remove('dark');
        } else {
            htmlEl.classList.add('dark');
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = htmlEl.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }


    /********************** Preloader & Initial Animation **********************/
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            appContent.classList.remove('opacity-0');

            displayHealthTips();
            populateEmergencyContacts();
            switchPage(window.location.hash || '#home');
        }, 4000);

        const ekgPath = document.querySelector('.preloader-path');
        if (ekgPath) {
            setTimeout(() => {
                ekgPath.classList.add('drawn');
            }, 2500);
        }
    });

    /********************** 3D Background Animation *************************/
    let scene, camera, renderer, dna;
    function initDnaAnimation() {
        const canvas = document.getElementById('bg-3d-animation');
        if (!canvas) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        dna = new THREE.Group();
        scene.add(dna);

        const radius = 1;
        const height = 15;
        const pointsPerStrand = 50;
        const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x4ade80,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        const rungMaterial = new THREE.LineBasicMaterial({
            color: 0x4ade80,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        for (let i = 0; i < pointsPerStrand; i++) {
            const y = (i / pointsPerStrand - 0.5) * height;
            const angle = i * 0.5;

            const p1 = new THREE.Mesh(particleGeometry, particleMaterial);
            p1.position.x = radius * Math.cos(angle);
            p1.position.y = y;
            p1.position.z = radius * Math.sin(angle);
            dna.add(p1);

            const p2 = new THREE.Mesh(particleGeometry, particleMaterial);
            p2.position.x = radius * Math.cos(angle + Math.PI);
            p2.position.y = y;
            p2.position.z = radius * Math.sin(angle + Math.PI);
            dna.add(p2);

            const rungGeometry = new THREE.BufferGeometry().setFromPoints([p1.position, p2.position]);
            const rung = new THREE.Line(rungGeometry, rungMaterial);
            dna.add(rung);
        }

        camera.position.z = 8;

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            dna.rotation.y = elapsedTime * 0.1;
            dna.rotation.x = elapsedTime * 0.05;

            renderer.render(scene, camera);
        };
        animate();
    }

    window.addEventListener('resize', () => {
        if(camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });

    initDnaAnimation();

    /********************** SPA Navigation Logic *************************/
    function switchPage(targetId) {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

        pageContents.forEach(page => page.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        const targetPage = document.querySelector(targetId);
        const activeLinks = document.querySelectorAll(`.nav-link[href="${targetId}"]`);

        if (targetPage) targetPage.classList.add('active');
        activeLinks.forEach(link => link.classList.add('active'));

        if (targetId === '#recommend' && chatMode !== 'emergency') {
            initGeneralChat();
        } else if (targetId !== '#recommend') {
            chatMode = 'general';
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            window.location.hash = targetId;
        });
    });

    window.addEventListener('hashchange', () => switchPage(window.location.hash || '#home'));

    /********************** Map Functionality *************************/
    findHospitalsBtn.addEventListener('click', () => {
        mapStatus.textContent = 'Fetching your location...';
        mapStatus.classList.remove('text-red-400', 'text-green-400');
        findHospitalsBtn.disabled = true;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    mapStatus.textContent = 'Redirecting to Google Maps...';
                    mapStatus.classList.add('text-green-400');

                    const url = `https://www.google.com/maps/search/hospitals/@$${latitude},${longitude},14z`;

                    setTimeout(() => {
                        window.open(url, '_blank');
                        findHospitalsBtn.disabled = false;
                    }, 1000);
                },
                (error) => {
                    let errorMessage = 'Could not access location. ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += "You denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage += "The request to get user location timed out.";
                            break;
                        case error.UNKNOWN_ERROR:
                            errorMessage += "An unknown error occurred.";
                            break;
                    }
                    mapStatus.textContent = errorMessage;
                    mapStatus.classList.add('text-red-400');
                    findHospitalsBtn.disabled = false;
                }
            );
        } else {
            mapStatus.textContent = 'Geolocation is not supported by your browser.';
            mapStatus.classList.add('text-red-400');
            findHospitalsBtn.disabled = false;
        }
    });

    /******************** Other JS Logic (Triage, AI, etc.) ********************/
    const translations = {
        "en-US": {
            probableConditions: "Probable conditions:",
            explanation: "Explanation:",
            advice: "Advice:",
            medicine: "Recommended Medicine:",
            remedies: "Home Remedies:",
            youtube: "Related Videos:",
            consultDoctor: "Please consult a doctor for a prescription.",
            noRemedies: "No specific home remedies recommended. Follow medical advice.",
            noVideos: "No videos found."
        },
        "hi-IN": {
            probableConditions: "संभावित स्थितियां:",
            explanation: "स्पष्टीकरण:",
            advice: "सलाह:",
            medicine: "अनुशंसित दवा:",
            remedies: "घरेलू उपचार:",
            youtube: "संबंधित वीडियो:",
            consultDoctor: "कृपया प्रिस्क्रिप्शन के लिए डॉक्टर से सलाह लें।",
            noRemedies: "कोई विशिष्ट घरेलू उपचार की सिफारिश नहीं की गई है। चिकित्सीय सलाह का पालन करें।",
            noVideos: "कोई वीडियो नहीं मिला।"
        },
        "mr-IN": {
            probableConditions: "संभाव्य परिस्थिती:",
            explanation: "स्पष्टीकरण:",
            advice: "सल्ला:",
            medicine: "शिफारस केलेले औषध:",
            remedies: "घरगुती उपाय:",
            youtube: "संबंधित व्हिडिओ:",
            consultDoctor: "कृपया प्रिस्क्रिप्शनसाठी डॉक्टरांचा सल्ला घ्या.",
            noRemedies: "कोणत्याही विशिष्ट घरगुती उपायांची शिफारस केलेली नाही. वैद्यकीय सल्ल्याचे पालन करा.",
            noVideos: "कोणतेही व्हिडिओ आढळले नाहीत."
        },
        "bn-IN": {
            probableConditions: "সম্ভাব্য শর্তাবলী:",
            explanation: "ব্যাখ্যা:",
            advice: "পরামর্শ:",
            medicine: "প্রস্তাবিত ঔষধ:",
            remedies: "ঘরোয়া প্রতিকার:",
            youtube: "সম্পর্কিত ভিডিও:",
            consultDoctor: "অনুগ্রহ করে একটি প্রেসক্রিপশনের জন্য একজন ডাক্তারের সাথে পরামর্শ করুন।",
            noRemedies: "কোনো নির্দিষ্ট ঘরোয়া প্রতিকারের সুপারিশ করা হয়নি। ডাক্তারের পরামর্শ অনুসরণ করুন।",
            noVideos: "কোনো ভিডিও খুঁজে পাওয়া যায়নি।"
        },
        "ta-IN": {
            probableConditions: "சாத்தியமான நிபந்தனைகள்:",
            explanation: "விளக்கம்:",
            advice: "ஆலோசனை:",
            medicine: "பரிந்துரைக்கப்பட்ட மருந்து:",
            remedies: "வீட்டு வைத்தியம்:",
            youtube: "தொடர்புடைய வீடியோக்கள்:",
            consultDoctor: "மருந்துச் சீட்டுக்கு மருத்துவரை அணுகவும்.",
            noRemedies: "குறிப்பிட்ட வீட்டு வைத்தியம் எதுவும் பரிந்துரைக்கப்படவில்லை. மருத்துவ ஆலோசனையைப் பின்பற்றவும்.",
            noVideos: "வீடியோக்கள் எதுவும் இல்லை."
        },
        "te-IN": {
            probableConditions: "సంభావ్య పరిస్థితులు:",
            explanation: "వివరణ:",
            advice: "సలహా:",
            medicine: "సిఫార్సు చేయబడిన మందు:",
            remedies: "ఇంటి నివారణలు:",
            youtube: "సంబంధిత వీడియోలు:",
            consultDoctor: "ప్రిస్క్రిప్షన్ కోసం దయచేసి వైద్యుడిని సంప్రదించండి.",
            noRemedies: "నిర్దిష్ట ఇంటి నివారణలు ఏవీ సిఫార్సు చేయబడలేదు. వైద్య సలహాను అనుసరించండి.",
            noVideos: "వీడియోలు కనుగొనబడలేదు."
        },
        "kn-IN": {
            probableConditions: "ಸಂಭಾವ್ಯ ಪರಿಸ್ಥಿತಿಗಳು:",
            explanation: "ವಿವರಣೆ:",
            advice: "ಸಲಹೆ:",
            medicine: "ಶಿಫಾರಸು ಮಾಡಲಾದ ಔಷಧಿ:",
            remedies: "ಮನೆಮದ್ದುಗಳು:",
            youtube: "ಸಂಬಂಧಿತ ವೀಡಿಯೊಗಳು:",
            consultDoctor: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಾಗಿ ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            noRemedies: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಮನೆಮದ್ದುಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ. ವೈದ್ಯಕೀಯ ಸಲಹೆಯನ್ನು ಅನುಸರಿಸಿ.",
            noVideos: "ಯಾವುದೇ ವೀಡಿಯೊಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
        },
        "gu-IN": {
            probableConditions: "સંભવિત પરિસ્થિતિઓ:",
            explanation: "સમજૂતી:",
            advice: "સલાહ:",
            medicine: "ભલામણ કરેલ દવા:",
            remedies: "ઘરગથ્થુ ઉપચાર:",
            youtube: "સંબંધિત વિડિઓઝ:",
            consultDoctor: "પ્રિસ્ક્રિપ્શન માટે કૃપા કરીને ડૉક્ટરની સલાહ લો.",
            noRemedies: "કોઈ ચોક્કસ ઘરગથ્થુ ઉપચારની ભલામણ કરવામાં આવતી નથી. તબીબી સલાહ અનુસરો.",
            noVideos: "કોઈ વિડિઓઝ મળ્યાં નથી."
        },
        "pa-IN": {
            probableConditions: "ਸੰਭਾਵਿਤ ਸਥਿਤੀਆਂ:",
            explanation: "ਵਿਆਖਿਆ:",
            advice: "ਸਲਾਹ:",
            medicine: "ਸਿਫ਼ਾਰਸ਼ੀ ਦਵਾਈ:",
            remedies: "ਘਰੇਲੂ ਉਪਚਾਰ:",
            youtube: "ਸੰਬੰਧਿਤ ਵੀਡੀਓਜ਼:",
            consultDoctor: "ਨੁਸਖ਼ੇ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
            noRemedies: "ਕੋਈ ਖਾਸ ਘਰੇਲੂ ਉਪਚਾਰ ਦੀ ਸਿਫਾਰਸ਼ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ। ਡਾਕਟਰੀ ਸਲਾਹ ਦੀ ਪਾਲਣਾ ਕਰੋ।",
            noVideos: "ਕੋਈ ਵੀਡੀਓ ਨਹੀਂ ਮਿਲਿਆ।"
        }
    };

    function updateUIText(lang) {
        const langStrings = translations[lang] || translations["en-US"];
        conditionsLabel.textContent = langStrings.probableConditions;
        explanationLabel.textContent = langStrings.explanation;
        adviceLabel.textContent = langStrings.advice;
        medicineLabel.textContent = langStrings.medicine;
        remediesLabel.textContent = langStrings.remedies;
        youtubeLabel.textContent = langStrings.youtube;
    }

    languageSelect.addEventListener('change', (e) => updateUIText(e.target.value));

    function extractJSONFromText(text) {
        if (!text || typeof text !== "string") throw new Error("Empty AI response");
        try {
            const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
            return JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON parsing failed for text:", text, e);
            throw new Error("Could not parse the AI's response.");
        }
    }

    const healthTips = [
        { icon: 'fas fa-apple-alt', title: 'Eat Healthy', description: 'A balanced diet is crucial for good health and nutrition.' },
        { icon: 'fas fa-tint', title: 'Stay Hydrated', description: 'Drink plenty of water throughout the day to stay hydrated.' },
        { icon: 'fas fa-walking', title: 'Exercise Regularly', description: 'Aim for at least 30 minutes of moderate physical activity daily.' },
    ];

    function displayHealthTips() {
        if (!healthTipsContainer) return;
        let tipsHTML = '';
        healthTips.forEach(tip => {
            tipsHTML += `
                <div class="health-tip-card card p-6 rounded-lg text-center">
                    <i class="${tip.icon} text-3xl text-green-500 dark:text-green-400 mb-4"></i>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${tip.title}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${tip.description}</p>
                </div>
            `;
        });
        healthTipsContainer.innerHTML = tipsHTML;
    }

    triageBtn.onclick = async () => {
        const symptomsText = symptomsEl.value.trim();
        if (!symptomsText) {
            resultError.textContent = "Please describe your symptoms.";
            symptomsEl.focus();
            return;
        }

        loader.classList.remove("hidden");
        triageBtn.disabled = true;
        resultError.textContent = "";
        feedbackMessage.textContent = "";
        consultAiDoctorBtn.classList.add('hidden');

        const selectedLang = languageSelect.value;
        const languageMap = {
            "en-US": "English",
            "hi-IN": "Hindi",
            "mr-IN": "Marathi",
            "bn-IN": "Bengali",
            "ta-IN": "Tamil",
            "te-IN": "Telugu",
            "kn-IN": "Kannada",
            "gu-IN": "Gujarati",
            "pa-IN": "Punjabi"
        };
        const languageName = languageMap[selectedLang] || "English";

        const prompt = `You are an expert AI medical triage assistant. Analyze symptoms: "${symptomsText}". Respond ONLY in ${languageName} with a valid JSON object.
- The JSON keys must be in English.
- The string values for "probable_conditions", "explanation", "advice", "recommended_medicine", "home_remedies", and youtube link titles must be in ${languageName}.
- For "risk" level "HIGH", "EMERGENCY SOON", or "EMERGENCY NOW", "recommended_medicine" and "home_remedies" arrays MUST be empty. The "advice" MUST strongly urge consulting a doctor immediately.
- For "risk" level "LOW" or "MODERATE", you may suggest common over-the-counter medicines and simple, safe home remedies.
- Find 1-2 relevant YouTube videos for the home remedies or condition. If none are appropriate, return an empty array.

JSON Schema:
{
  "risk": "LOW" | "MODERATE" | "HIGH" | "EMERGENCY SOON" | "EMERGENCY NOW",
  "probable_conditions": ["Condition in ${languageName}"],
  "explanation": "Explanation in ${languageName}.",
  "advice": "Actionable advice in ${languageName}.",
  "recommended_medicine": ["Medicine name in ${languageName}"],
  "home_remedies": ["Remedy in ${languageName}"],
  "youtube_links": [{"title": "Video title in ${languageName}", "url": "https://youtube.com/watch?v=..."}]
}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "risk": { "type": "STRING" },
                        "probable_conditions": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "explanation": { "type": "STRING" },
                        "advice": { "type": "STRING" },
                        "recommended_medicine": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "home_remedies": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "youtube_links": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": { "type": "STRING" },
                                    "url": { "type": "STRING" }
                                },
                                "required": ["title", "url"]
                            }
                        }
                    },
                    required: ["risk", "probable_conditions", "explanation", "advice", "recommended_medicine", "home_remedies", "youtube_links"]
                }
            }
        };

        try {
            const res = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error?.message || `API error: ${res.status}`);
            }

            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            const outcome = extractJSONFromText(rawText);
            lastOutcome = outcome;
            updateUI(outcome);
            triageResultsContainer.classList.remove('hidden');
            document.getElementById('triage-results').scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (e) {
            console.error(e);
            resultError.textContent = "⚠️ " + e.message;
        } finally {
            loader.classList.add("hidden");
            triageBtn.disabled = false;
        }
    };

    function updateUI(o) {
        const risk = (o.risk || "UNKNOWN").toUpperCase().replace(/_/g, " ");
        const lang = languageSelect.value;
        riskBadge.textContent = risk;
        riskBadge.className = "badge";
        riskBadge.classList.remove("hidden");
        const isEmergency = risk.includes("EMERGENCY") || risk === "HIGH";

        if (risk === "LOW") riskBadge.classList.add("ok");
        else if (isEmergency) riskBadge.classList.add("danger");
        else riskBadge.classList.add("warn");

        emergencyBanner.classList.toggle("hidden", !isEmergency);
        consultAiDoctorBtn.classList.toggle('hidden', !isEmergency);


        conditionsEl.innerHTML = Array.isArray(o.probable_conditions) && o.probable_conditions.length ? o.probable_conditions.map(c => `<li>${c}</li>`).join("") : "<li>—</li>";
        explanationEl.textContent = o.explanation || "—";
        adviceEl.textContent = o.advice || "—";

        if (Array.isArray(o.recommended_medicine) && o.recommended_medicine.length) {
            medicineEl.innerHTML = o.recommended_medicine.map(m => `<li>${m}</li>`).join("");
        } else {
            medicineEl.innerHTML = `<li>${translations[lang]?.consultDoctor || translations['en-US'].consultDoctor}</li>`;
        }

        if (Array.isArray(o.home_remedies) && o.home_remedies.length) {
            remediesEl.innerHTML = o.home_remedies.map(r => `<li>${r}</li>`).join("");
        } else {
            remediesEl.innerHTML = `<li>${translations[lang]?.noRemedies || translations['en-US'].noRemedies}</li>`;
        }

        if (Array.isArray(o.youtube_links) && o.youtube_links.length) {
            youtubeLinksEl.innerHTML = o.youtube_links.map(link => `<li><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(link.title)}" target="_blank" class="text-green-600 dark:text-green-400 hover:underline"><i class="fab fa-youtube mr-2"></i>${link.title}</a></li>`).join("");
        } else {
            youtubeLinksEl.innerHTML = `<li>${translations[lang]?.noVideos || translations['en-US'].noVideos}</li>`;
        }

        playBtn.disabled = !(o.explanation || o.advice);
    }

    async function handleFeedback(feedbackValue) {
        if (!lastOutcome) {
            resultError.textContent = "No result to give feedback on.";
            return;
        }
        if (!db) {
            resultError.textContent = "Feedback system is offline.";
            return;
        }

        thumbUpBtn.disabled = true;
        thumbDownBtn.disabled = true;

        try {
            const feedbackCollection = collection(db, `/artifacts/${appId}/public/data/triage_feedback`);
            await addDoc(feedbackCollection, {
                symptoms: symptomsEl.value.trim(),
                triageResult: lastOutcome,
                feedback: feedbackValue,
                timestamp: serverTimestamp()
            });

            feedbackMessage.textContent = "Thank you for your feedback!";
            if (feedbackValue === 'good') {
                thumbUpBtn.style.backgroundColor = 'var(--primary-green-dark)';
            } else {
                thumbDownBtn.style.backgroundColor = '#ef4444';
            }

        } catch (e) {
            console.error("Error submitting feedback:", e);
            resultError.textContent = "Could not submit feedback.";
            thumbUpBtn.disabled = false;
            thumbDownBtn.disabled = false;
        }
    }
    thumbUpBtn.addEventListener('click', () => handleFeedback('good'));
    thumbDownBtn.addEventListener('click', () => handleFeedback('bad'));

    consultAiDoctorBtn.addEventListener('click', () => {
        chatMode = 'emergency';
        initEmergencyChat();
        window.location.hash = '#recommend';
    });

    function resetAiDoctor() {
        aiAssistantTitle.textContent = 'AI Assistant';
        aiDoctorStatus.textContent = 'Online';
        aiDoctorStatus.classList.remove('text-red-400');
        aiDoctorStatus.classList.add('text-green-600', 'dark:text-green-400');
        aiDoctorChatWindow.innerHTML = '';
        aiDoctorInput.placeholder = "Ask a health-related question...";
        chatHistory = [];
    }

    function initGeneralChat() {
        resetAiDoctor();
        const welcomeMessage = "Hello! I am your AI Health Assistant. You can ask me about general health topics, symptoms, or nutrition. How can I help you today? \n\nPlease note: I am not a substitute for professional medical advice.";
        addMessageToChat(welcomeMessage, 'ai');
        chatHistory = [{ role: 'model', parts: [{ text: welcomeMessage }] }];
        showQuickReplies([
            "What are the symptoms of the flu?",
            "Tell me about a balanced diet.",
            "How can I reduce stress?"
        ]);
    }

    function addMessageToChat(text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        bubble.textContent = text;
        aiDoctorChatWindow.appendChild(bubble);
        aiDoctorChatWindow.scrollTop = aiDoctorChatWindow.scrollHeight;
        return bubble;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        aiDoctorChatWindow.appendChild(indicator);
        aiDoctorChatWindow.scrollTop = aiDoctorChatWindow.scrollHeight;
        return indicator;
    }

    function initEmergencyChat() {
        if (!lastOutcome) return;
        resetAiDoctor();

        aiAssistantTitle.textContent = 'AI Emergency Assistant';
        aiDoctorInput.placeholder = 'Ask a follow-up question...';

        const initialMessage = `I understand you're in a high-risk situation. I'm here to help you stay calm and prepared while you wait for professional medical assistance. Please remember to keep your line open for emergency services.

Have you already contacted your local emergency number (like 102 or 112)?`;

        addMessageToChat(initialMessage, 'ai');
        chatHistory = [{ role: 'model', parts: [{ text: initialMessage }] }];

        aiDoctorStatus.textContent = `Assisting with: ${lastOutcome.probable_conditions[0]}`;
        aiDoctorStatus.classList.add('text-red-500', 'dark:text-red-400');
        aiDoctorStatus.classList.remove('text-green-600', 'dark:text-green-400');

        showQuickReplies([
            "Yes, help is on the way.",
            "What should I do now?",
            "Help me stay calm.",
        ]);
    }

    function showQuickReplies(replies) {
        quickRepliesContainer.innerHTML = '';
        if (replies.length > 0) {
            quickRepliesContainer.style.display = 'flex';
            replies.forEach(replyText => {
                const button = document.createElement('button');
                button.className = 'quick-reply-btn';
                button.textContent = replyText;
                button.onclick = () => {
                    handleAiDoctorQuery(replyText);
                };
                quickRepliesContainer.appendChild(button);
            });
        } else {
            quickRepliesContainer.style.display = 'none';
        }
    }

    async function handleAiDoctorQuery(text = null) {
        const userText = text || aiDoctorInput.value.trim();
        if (!userText) return;

        addMessageToChat(userText, 'user');
        aiDoctorInput.value = '';
        aiDoctorInput.disabled = true;
        aiDoctorSendBtn.disabled = true;
        showQuickReplies([]);

        const typingIndicator = showTypingIndicator();

        chatHistory.push({ role: 'user', parts: [{ text: userText }] });

        let systemPrompt;
        if (chatMode === 'emergency') {
            systemPrompt = `You are an AI Emergency Medical Assistant. Your user is in a high-risk medical situation based on this triage: Symptoms: "${symptomsEl.value.trim()}", Possible Conditions: "${lastOutcome.probable_conditions.join(', ')}".
Your role is to:
1.  **Stay Calm and Reassuring:** Use a calm, empathetic, and simple tone.
2.  **Reinforce Professional Help:** ALWAYS prioritize instructions from emergency services (like 112, 102). Your primary message is that professional help is on the way and is the best source of guidance.
3.  **Provide Safe, Simple Instructions:** Offer clear, actionable, and safe advice for what to do *while waiting* for help. Examples: unlocking the door, gathering medications, finding a comfortable position that doesn't worsen their condition (e.g., sitting up if short of breath).
4.  **DO NOT Diagnose or Prescribe:** Do not offer new diagnoses, suggest medications, or give complex medical advice. Defer to the paramedics/doctors.
5.  **Be Concise:** Keep responses short and easy to read.`;
        } else {
            systemPrompt = `You are a helpful and knowledgeable AI Health Assistant. Your role is to provide clear, safe, and general information about health, wellness, symptoms, and nutrition.
- DO NOT provide a diagnosis or prescribe medication.
- ALWAYS recommend consulting a healthcare professional for personal medical advice.
- Keep your answers concise and easy to understand.`
        }

        const payload = {
            contents: [
                { role: 'user', parts: [{text: systemPrompt }] },
                ...chatHistory
            ]
        };

        try {
            const res = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("API failed to respond.");

            const data = await res.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            aiDoctorChatWindow.removeChild(typingIndicator);
            addMessageToChat(aiResponse, 'ai');
            chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });

        } catch (e) {
            aiDoctorChatWindow.removeChild(typingIndicator);
            addMessageToChat("I'm having trouble connecting right now. Please focus on contacting emergency services. Stay on the line with them if possible.", 'ai');
        } finally {
            aiDoctorInput.disabled = false;
            aiDoctorSendBtn.disabled = false;
            aiDoctorInput.focus();
        }
    }

    aiDoctorSendBtn.addEventListener('click', () => handleAiDoctorQuery());
    aiDoctorInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAiDoctorQuery();
        }
    });

    function populateEmergencyContacts() {
        const contacts = [
            { name: 'National Emergency Number', number: '112', icon: 'fas fa-globe' },
            { name: 'Police', number: '100', icon: 'fas fa-user-shield' },
            { name: 'Ambulance', number: '102', icon: 'fas fa-ambulance' },
            { name: 'Fire', number: '101', icon: 'fas fa-fire-extinguisher' },
            { name: 'Women Helpline', number: '1091', icon: 'fas fa-female' },
            { name: 'Child Helpline', number: '1098', icon: 'fas fa-child' }
        ];

        emergencyContactsList.innerHTML = '';
        contacts.forEach(contact => {
            const card = `
                <a href="tel:${contact.number}" class="card emergency-contact-card bg-gray-100 dark:bg-gray-800/80 p-6 rounded-lg text-center flex flex-col items-center justify-center">
                    <i class="${contact.icon} text-4xl text-red-500 dark:text-red-400 mb-4"></i>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${contact.name}</h4>
                    <p class="text-2xl font-bold text-red-600 dark:text-red-300 tracking-widest">${contact.number}</p>
                </a>
            `;
            emergencyContactsList.innerHTML += card;
        });
    }

    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationMessage.textContent = 'Fetching your location...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    locationMessage.textContent = `Location acquired. Displaying national emergency numbers. For local numbers specific to your area (Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}), please search online.`;
                    locationMessage.classList.add('text-green-600');
                },
                (error) => {
                    locationMessage.textContent = 'Could not access location. Please enable location services in your browser.';
                    locationMessage.classList.add('text-red-500');
                }
            );
        } else {
            locationMessage.textContent = 'Geolocation is not supported by your browser.';
        }
    });

    function populateVoices() {
        availableVoices = speechSynthesis.getVoices();
    }

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    playBtn.onclick = () => {
        if (!lastOutcome) return;
        const textToSpeak = [lastOutcome.advice, lastOutcome.explanation].filter(Boolean).join('. ');
        if (!textToSpeak || !window.speechSynthesis) return;

        speechSynthesis.cancel(); // Stop any previous speech

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const selectedLang = languageSelect.value || "en-US";
        utterance.lang = selectedLang;

        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            console.warn("Speech synthesis voices not loaded yet.");
        }

        let voice = voices.find(v => v.lang === selectedLang);

        if (!voice) {
            const langPart = selectedLang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPart));
        }

        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No specific voice found for ${selectedLang}. Using browser default. Playback may not be correct.`);
        }

        speechSynthesis.speak(utterance);
    };

    micBtn.onclick = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { resultError.textContent = "Speech recognition not supported."; return; }
        const rec = new SR();
        rec.lang = languageSelect.value || "en-US";
        micBtn.disabled = true;
        micBtn.textContent = "🎙️ Listening...";
        rec.onresult = e => {
            const t = e.results?.[0]?.[0]?.transcript || "";
            if (t) symptomsEl.value += (symptomsEl.value ? " " : "") + t;
        };
        rec.onerror = e => { resultError.textContent = "STT error: " + (e.error || "unknown"); };
        rec.onend = () => { micBtn.disabled = false; micBtn.textContent = "🎙️ Record"; };
        rec.start();
    };

    document.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
            if(document.activeElement === symptomsEl) {
                triageBtn.click();
            }
        }
    });

    if(loginForm){
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            console.log(`Login attempt with email: ${email}`);
            window.location.hash = '#home';
        });
    }
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            console.log('"Continue with Google" clicked. In a real app, this would trigger the Google Sign-In flow.');
            window.location.hash = '#home';
        });
    }
});