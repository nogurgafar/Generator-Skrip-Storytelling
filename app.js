document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('script-form');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const scriptOutput = document.getElementById('script-output');
    const spinner = document.getElementById('spinner');
    const topicInput = document.getElementById('topic');
    const audienceAgeInput = document.getElementById('audience-age');
    const resetBtn = document.getElementById('reset-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // --- Security: Disable Right Click ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const topic = topicInput.value;
        const audienceAge = audienceAgeInput.value;

        // Show spinner and result container
        spinner.style.display = 'block';
        resultContainer.style.display = 'block';
        scriptOutput.textContent = '';
        generateBtn.disabled = true;
        generateBtn.textContent = 'Membuat Skrip...';

        try {
            const response = await generateScript(topic, audienceAge);
            const script = response.choices[0].message.content;
            scriptOutput.textContent = script.trim();
        } catch (error) {
            console.error('Error:', error);
            scriptOutput.textContent = 'Maaf, terjadi kesalahan saat membuat skrip. Silakan coba lagi.\n\nDetail: ' + error.message;
        } finally {
            // Hide spinner and re-enable button
            spinner.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = 'Buat Skrip';
        }
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        resultContainer.style.display = 'none';
        scriptOutput.textContent = '';
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(scriptOutput.textContent).then(() => {
            alert('Skrip berhasil disalin!');
        }, (err) => {
            console.error('Gagal menyalin teks: ', err);
            alert('Gagal menyalin skrip.');
        });
    });

    downloadBtn.addEventListener('click', () => {
        const scriptContent = scriptOutput.textContent;
        const topicTitle = topicInput.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'skrip';
        const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topicTitle}_story_script.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    async function generateScript(topic, audienceAge) {
        const apiKey = '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';
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

        const prompt = `
Persona: Kamu adalah seorang copywriter spesialis storytelling video pendek.
Action: Buatkan aku skrip storytelling berdurasi 60 detik tentang "${topic}", dengan gaya emosional dan menyentuh.
Step: Mulai dengan hook misterius/personal, bangun konflik singkat, beri twist atau insight mendalam, dan tutup dengan pertanyaan reflektif atau CTA.
Context: Audience-ku adalah usia ${audienceAge} yang suka cerita emosional dan relatable, video ditujukan untuk TikTok, Reels atau YouTube Shorts.
Gunakan sudut pandang orang pertama.
Bahasa: Indonesia.
`;

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
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error.message}`);
        }

        return response.json();
    }
});