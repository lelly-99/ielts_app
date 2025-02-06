class VoiceTranscription {
    constructor(options = {}) {
        this.language = options.language || 'en-US';
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = this.language;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // Bind methods
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
    }

    startRecording() {
        return new Promise((resolve, reject) => {
            try {
                this.recognition.start();
                
                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    resolve(transcript);
                };

                this.recognition.onerror = (event) => {
                    reject(event.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    stopRecording() {
        this.recognition.stop();
    }
}

// Utility function for API submission
async function submitResponse(endpoint, studentId, userResponse, additionalData = {}) {
    try {
        const payload = {
            student_id: studentId,
            user_response: userResponse,
            ...additionalData
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (error) {
        console.error('Submission error:', error);
        throw error;
    }
}

// Utility for displaying conversation
function addMessage(container, message, type = 'user') {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-bubble', `${type}-bubble`);
    messageEl.textContent = message;
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

export { 
    VoiceTranscription, 
    submitResponse,
    addMessage
};