const form = document.getElementById('chat-form');
const mytextInput = document.getElementById('mytext-input');  // Update this to match your actual element ID
const responseTextarea = document.getElementById('response');
const submitButton = document.getElementById('submit');
const promptInput = document.getElementById('prompt-Selecter');

const keyForm = document.getElementById('keyForm');
const keySubmit = document.getElementById('keySubmit');
const keyInput = document.getElementById('keyInput');
const popup = document.getElementById('popup');

// Base64 encoding and decoding functions
function encodeCookie(value) {
    return btoa(value); // Base64 encode
}

function decodeCookie(value) {
    return atob(value); // Base64 decode
}

// Set a cookie with Base64 encoding
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeCookie(value) + ";" + expires + ";path=/";
}

// Get a cookie with Base64 decoding
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return decodeCookie(c.substring(nameEQ.length, c.length));
    }
    return null;
}

keySubmit.onclick = function() {
    setCookie("API_KEY", keyInput.value, 7); // Set cookie with Base64 encoding
    console.log("API_KEY set:", getCookie("API_KEY")); // Logs the decoded cookie value
    hidePopup();
}

function removeAPI() {
    document.cookie = "API_KEY=; max-age=0; path=/;";
    console.log("API_KEY removed:", getCookie("API_KEY")); // This will log undefined or an empty string after deletion
    keyInput.value = "";
}

window.onload = function() {
    const apiKey = getCookie("API_KEY");
    if (apiKey) {
        console.log("API_KEY exists:");
        banner.innerHTML = "";
        popup.style.display = "none";
        document.getElementById("keyInput").value = apiKey;
    } else {
        console.log("API_KEY does not exist.");
        // Actions if the cookie does not exist
    }
}

function hidePopup() {
    popup.style.display = "none";
}

function showPopup() {
    popup.style.display = "";
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mytext = mytextInput.value.trim();
    const promptType = promptInput.value;

    if (mytext) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie("API_KEY")}`, // Set Authorization header with API key
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',  // Use the correct model name
                    messages: [{ role: 'user', content: 'You are a prompt Generator. Create a short ' + promptType + ' with the topic: ' + mytext + '. It should be descriptive and provide many possibilities to take the story, but only between 1 - 1.5 sentences' }],
                    temperature: 1.0,
                    top_p: 0.7,
                    n: 1,
                    stream: false,
                    presence_penalty: 0,
                    frequency_penalty: 0,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                responseTextarea.innerHTML = data.choices[0].message.content;
                responseTextarea.style.removeProperty("max-height");
            } else {
                const errorData = await response.json();
                responseTextarea.innerHTML = 'Error: ' + (errorData.error?.message || 'Unable to process your request.');
                console.error('API Error:', errorData);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            responseTextarea.innerHTML = 'Error: Unable to process your request.';
        }
    }
});
