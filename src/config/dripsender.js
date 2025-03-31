const axios = require('axios');

async function sendWhatsApp(text, phone) {
    const url = 'https://api.dripsender.id/send';
    const apiKey = '464c2821-47c0-4a4e-9e31-fb0b9fe3fc60';
    
    const body = {
        api_key: apiKey,
        text: text,
        phone: phone
    };

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
        throw error; // Re-throw the error if you want calling code to handle it
    }
}

// Example usage:
// sendMessage("Hello there!", "6281234567890")
//   .then(data => console.log(data))
//   .catch(err => console.error(err));

export default sendWhatsApp;

// Example usage:
// sendWhatsApp('6281234567890', 'Hello from Dripsender!')
//   .then(response => console.log('Success:', response))
//   .catch(error => console.error('Error:', error.message));