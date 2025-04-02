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

sendWhatsApp("Hello from Dripsender!", "6285109190002");