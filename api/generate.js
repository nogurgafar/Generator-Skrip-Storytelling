module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { topic, audienceAge } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured.' });
    }
    
    if (!topic || !audienceAge) {
        return res.status(400).json({ error: 'Missing topic or audience age.' });
    }

    const prompt = `
Persona: Kamu adalah seorang copywriter spesialis storytelling video pendek.
Action: Buatkan aku skrip storytelling berdurasi 60 detik tentang "${topic}", dengan gaya emosional dan menyentuh.
Step: Mulai dengan hook misterius/personal, bangun konflik singkat, beri twist atau insight mendalam, dan tutup dengan pertanyaan reflektif atau CTA.
Context: Audience-ku adalah usia ${audienceAge} yang suka cerita emosional dan relatable, video ditujukan untuk TikTok, Reels atau YouTube Shorts.
Gunakan sudut pandang orang pertama.
Bahasa: Indonesia.
`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return res.status(response.status).json({ 
                error: `API Error: ${response.statusText}`,
                details: errorData.error.message 
            });
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ 
            error: 'An internal server error occurred.',
            details: error.message
        });
    }
};