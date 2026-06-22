// Page Management
let currentPage = 1;
const totalPages = 6;
let dateData = {};
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://dating-web-glkg.onrender.com';

// Get elements
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const okayBtn = document.getElementById('okayBtn');
const timeForm = document.getElementById('timeForm');
const foodForm = document.getElementById('foodForm');
const adventureForm = document.getElementById('adventureForm');
const startOverBtn = document.getElementById('startOverBtn');
const fireworksContainer = document.getElementById('fireworks');
const dateInput = document.getElementById('dateInput');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');

// Set minimum date to today
const today = new Date();
const minDate = today.toISOString().split('T')[0];
dateInput.setAttribute('min', minDate);

// Page functions
function showPage(pageNum) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`page${pageNum}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    currentPage = pageNum;
    
    // Create fireworks on congratulations page
    if (pageNum === 2) {
        createFireworks();
    }
}

// Fireworks effect
function createFireworks() {
    const emojis = ['🎉', '✨', '💕', '🎊', '🌟', '💫', '🎈', '💖'];
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            firework.style.setProperty('--tx', tx + 'px');
            firework.style.setProperty('--ty', ty + 'px');
            
            fireworksContainer.appendChild(firework);
            
            setTimeout(() => firework.remove(), 1000);
        }, i * 50);
    }
}

// NO Button - Moves away when hovered or clicked
noBtn.addEventListener('mouseover', moveButtonNormal);
noBtn.addEventListener('mousemove', moveButtonNormal);
noBtn.addEventListener('mouseenter', moveButtonNormal);
noBtn.addEventListener('focus', moveButtonFast);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveButtonNormal(e);
});
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveButtonNormal(e);
});

// Prevent tab focus on No button - detect Tab key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Check if any element is trying to focus on noBtn
        setTimeout(() => {
            if (document.activeElement === noBtn) {
                e.preventDefault();
                moveButtonFast();
            }
        }, 10);
    }
});

let lastMoveTime = 0;

function moveButtonNormal(e) {
    if (e) e.preventDefault();
    
    // Debounce to prevent too frequent moves (every 100ms)
    const now = Date.now();
    if (now - lastMoveTime < 100) {
        return;
    }
    lastMoveTime = now;
    
    // Get random position (normal distance)
    const randomX = Math.random() * 300 - 150;
    const randomY = Math.random() * 300 - 150;
    
    noBtn.style.setProperty('--moveX', randomX + 'px');
    noBtn.style.setProperty('--moveY', randomY + 'px');
    noBtn.classList.add('moving');
    noBtn.classList.remove('moving-fast');
    
    // Make it harder by disabling pointer events
    noBtn.style.pointerEvents = 'none';
    
    // Reset after animation
    setTimeout(() => {
        noBtn.classList.remove('moving');
        noBtn.style.pointerEvents = 'auto';
    }, 200);
}

function moveButtonFast(e) {
    if (e) e.preventDefault();
    
    // Faster movement when tabbing (only slightly faster)
    const randomX = Math.random() * 350 - 175;
    const randomY = Math.random() * 350 - 175;
    
    noBtn.style.setProperty('--moveX', randomX + 'px');
    noBtn.style.setProperty('--moveY', randomY + 'px');
    noBtn.classList.add('moving-fast');
    
    // Make it impossible to focus
    noBtn.blur();
    noBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        noBtn.classList.remove('moving-fast');
        noBtn.style.pointerEvents = 'auto';
    }, 150);
}

// YES Button - Go to congratulations
yesBtn.addEventListener('click', () => {
    showPage(2);
});

// Okay Button - Go to time form
okayBtn.addEventListener('click', () => {
    showPage(3);
});

// Time Form submission
timeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedDate = dateInput.value;
    const selectedTime = document.querySelector('input[name="time"]:checked');
    
    if (!selectedDate || !selectedTime) {
        alert('Please select both a date and time! ⏰');
        return;
    }
    
    // Format date for display
    const dateObj = new Date(selectedDate);
    const dateString = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    dateData.date = dateString;
    dateData.time = selectedTime.value;
    
    // Show loading state
    const submitBtn = timeForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending notification... ⏳';
    submitBtn.disabled = true;
    
    try {
        // Get email from user
        const userEmail = prompt('📧 Enter your email to receive date confirmation:', '');
        
        if (!userEmail || !userEmail.includes('@')) {
            alert('Please enter a valid email address!');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Send date notification
        const response = await fetch(`${API_BASE_URL}/api/send-date-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: selectedDate,
                time: selectedTime.value,
                email: userEmail
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            dateData.email = userEmail;
            alert('✅ Email sent! Check your inbox for date confirmation!');
        } else {
            alert('⚠️ Could not send email right now, but you can continue!');
        }
        
        showPage(4);
    } catch (error) {
        console.error('Error:', error);
        alert('⚠️ Server not running, but you can continue with the date selection!');
        showPage(4);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Date input change event - show selected date
dateInput.addEventListener('change', (e) => {
    if (e.target.value) {
        const dateObj = new Date(e.target.value);
        const dateString = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        selectedDateDisplay.textContent = `✨ You selected: ${dateString}`;
    } else {
        selectedDateDisplay.textContent = '';
    }
});

// Food Form submission
foodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedFoods = Array.from(document.querySelectorAll('input[name="food"]:checked'))
        .map(input => input.value);
    
    if (selectedFoods.length === 0) {
        alert('Please select at least one food! 😋');
        return;
    }
    
    dateData.foods = selectedFoods;
    showPage(5);
});

// Adventure Form submission
adventureForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedAdventures = Array.from(document.querySelectorAll('input[name="adventure"]:checked'))
        .map(input => input.value);
    
    if (selectedAdventures.length === 0) {
        alert('Please select at least one adventure! 🎢');
        return;
    }
    
    dateData.adventures = selectedAdventures;
    showSummary();
    showPage(6);
});

// Download Calendar Function
function generateAndDownloadICS() {
    // Parse date
    const dateObj = new Date(dateInput.value);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // Time mapping
    const timeMap = {
        'morning': '09:00',
        'afternoon': '14:00',
        'evening': '18:00',
        'night': '20:00'
    };
    const time = timeMap[dateData.time] || '14:00';
    
    // Create ICS content
    const dtstart = `${year}${month}${day}T${time.replace(':', '')}00`;
    const dtend = `${year}${month}${day}T${String(parseInt(time) + 2).padStart(2, '0')}0000`;
    
    const foodList = dateData.foods.map(f => {
        const foodLabels = {
            'pizza': 'Pizza',
            'burger': 'Burger',
            'coffee': 'Coffee',
            'tea': 'Tea',
            'momos': 'Momos',
            'pasta': 'Pasta',
            'icecream': 'Ice Cream',
            'sushi': 'Sushi'
        };
        return foodLabels[f] || f;
    }).join(', ');
    
    const adventureList = dateData.adventures.map(a => {
        const adventureLabels = {
            'amusement_park': 'Amusement Park',
            'water_park': 'Water Park',
            'hiking': 'Hiking',
            'comedy_show': 'Comedy Show',
            'movie': 'Movie Night',
            'picnic': 'Picnic',
            'car_ride': 'Car Ride',
            'travelling': 'Travelling',
            'gaming_zone': 'Gaming Zone'
        };
        return adventureLabels[a] || a;
    }).join(', ');
    
    const description = `Our Perfect Date!\\n\\nFood: ${foodList}\\n\\nAdventures: ${adventureList}`;
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dating App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@datingapp.com
DTSTAMP:${new Date().toISOString().replace(/[:\-]/g, '').split('.')[0]}Z
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:Our Perfect Date! 💕
DESCRIPTION:${description}
LOCATION:Our Special Place
SEQUENCE:0
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    
    // Download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent));
    element.setAttribute('download', 'perfect-date.ics');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert('📅 Calendar file downloaded! Import it to Google Calendar or any calendar app!');
}

// Show Summary
function showSummary() {
    // Time with Date
    const timeLabels = {
        'morning': 'Morning ☀️ (8AM - 12PM)',
        'afternoon': 'Afternoon 🌤️ (12PM - 5PM)',
        'evening': 'Evening 🌅 (5PM - 8PM)',
        'night': 'Night 🌙 (8PM onwards)'
    };
    
    const timeAndDate = `${dateData.date} - ${timeLabels[dateData.time]}`;
    document.getElementById('summaryTime').textContent = timeAndDate;
    
    // Foods
    const foodLabels = {
        'pizza': 'Pizza 🍕',
        'burger': 'Burger 🍔',
        'coffee': 'Coffee ☕',
        'tea': 'Tea 🍵',
        'momos': 'Momos 🥟',
        'pasta': 'Pasta 🍝',
        'icecream': 'Ice Cream 🍦',
        'sushi': 'Sushi 🍣'
    };
    
    const foodsText = dateData.foods.map(f => foodLabels[f]).join(', ');
    document.getElementById('summaryFood').textContent = foodsText;
    
    // Adventures
    const adventureLabels = {
        'amusement_park': 'Amusement Park 🎡',
        'water_park': 'Water Park 🌊',
        'hiking': 'Hiking ⛰️',
        'comedy_show': 'Comedy Show 🎭',
        'movie': 'Movie Night 🎬',
        'picnic': 'Picnic 🧺',
        'car_ride': 'Car Ride 🚗',
        'travelling': 'Travelling ✈️',
        'gaming_zone': 'Gaming Zone 🎮'
    };
    
    const adventuresText = dateData.adventures.map(a => adventureLabels[a]).join(', ');
    document.getElementById('summaryAdventure').textContent = adventuresText;
}

// Start Over
startOverBtn.addEventListener('click', () => {
    currentPage = 1;
    dateData = {};
    
    // Reset forms
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });
    
    dateInput.value = '';
    selectedDateDisplay.textContent = '';
    
    showPage(1);
});

// Initialize
showPage(1);
