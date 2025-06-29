const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { topic, genre } = req.body;

    if (!topic || !genre) {
        return res.status(400).json({ error: 'Missing topic or genre!' });
    }

    // Create prompt from topic + genre
    const userPrompt = `Write a unique and engaging short story in the genre of "${genre}" for school students about the topic "${topic}". First, include a creative title, then the story.`;

    try {
        const response = await fetch(`https://ai.hackclub.com/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: "You're a storytelling AI for students. Make the story fun, short, and educational."
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content?.trim();

        if (!reply) throw new Error('No response from Hack Club AI');

        const lines = reply.split('\n').filter(line => line.trim());
        const title = lines[0];
        const story = lines.slice(1).join('\n');

        res.json({ title, story });
    } catch (err) {
        console.error('Hack Club AI error:', err.message);
        res.status(500).json({ error: '⚠️ Could not generate story. Try again.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
