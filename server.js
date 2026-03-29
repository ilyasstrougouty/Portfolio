const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(express.json()); // Essential for parsing the POST JSON payload from the chatbot

app.use(cors());
app.use(express.static(__dirname)); // Serve static files (index.html, etc.)

const PORT = process.env.PORT || 3001;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const cache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetches repository stats for a given user.
 * We'll use a simplified version that gets top repos and total stars.
 */
app.get('/api/github-stats/:username', async (req, res) => {
  const { username } = req.params;
  
  // Check cache
  if (cache.data && cache.username === username && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    return res.json(cache.data);
  }

  try {
    const config = GITHUB_TOKEN ? { headers: { Authorization: `token ${GITHUB_TOKEN}` } } : {};
    
    // 1. Fetch repositories
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, config);
    const repos = reposRes.data;

    let totalStars = 0;
    const repoStats = repos.map(repo => {
      totalStars += repo.stargazers_count;
      return {
        name: repo.name,
        stars: repo.stargazers_count,
        description: repo.description,
        language: repo.language,
        url: repo.html_url,
        updated_at: repo.updated_at
      };
    });

    // Sort by stars and get top 4 for the portfolio display
    const topRepos = [...repoStats].sort((a, b) => b.stars - a.stars).slice(0, 4);

    // 2. Fetch total contributions (Last Year) - GraphQL API for accuracy
    let totalContributions = 0;
    let weeks = [];
    try {
        const token = GITHUB_TOKEN ? GITHUB_TOKEN.replace(/['"]+/g, '') : null;
        if (token) {
            console.log(`[GITHUB] Fetching contribution calendar for ${username}`);
            const graphqlQuery = {
                query: `query ($username: String!) {
                    user(login: $username) {
                        contributionsCollection {
                            contributionCalendar {
                                totalContributions
                                weeks {
                                    contributionDays {
                                        color
                                        contributionCount
                                        date
                                    }
                                }
                            }
                        }
                    }
                }`,
                variables: { username }
            };

            const gqlRes = await axios.post('https://api.github.com/graphql', graphqlQuery, {
                headers: { Authorization: `bearer ${token}` }
            });

            if (gqlRes.data.data && gqlRes.data.data.user) {
                const calendar = gqlRes.data.data.user.contributionsCollection.contributionCalendar;
                totalContributions = calendar.totalContributions;
                weeks = calendar.weeks;
                console.log(`[GITHUB] Found ${totalContributions} total contributions`);
            }
        }
    } catch (e) {
        console.warn(`[GITHUB] GraphQL contributions fetch failed: ${e.message}`);
    }

    const result = {
      username,
      totalStars,
      totalRepos: repos.length,
      totalContributions,
      weeks,
      topRepos
    };

    // Update cache
    cache.data = result;
    cache.username = username;
    cache.timestamp = Date.now();

    res.json(result);
  } catch (error) {
    console.error('[BACKEND] Error fetching GitHub data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

// ==========================================
// AI CHATBOT STREAMING ENDPOINT (Groq)
// ==========================================
const SYSTEM_PROMPT = `You are the specialized AI Portfolio Assistant for Ilyass Trougouty. Your goal is to represent Ilyass professionally and accurately to visitors.

### About Ilyass Trougouty:
Ilyass is an aspiring AI Engineer and Open Source Builder characterized as a "Precision Architect." He is currently a 3rd-year student at the Ecole Nationale de l'intelligence Artificielle et du Digital de Berkane (ENIADB).

### Academic Trajectory:
- **Engineer's Degree**: ENIADB (Aug 2025 – Sep 2028).
- **DEUG Génie Informatique**: Université Mohammed Premier Oujda (Sep 2023 – Aug 2025).

### Technical Expertise:
- **Machine Learning & LLM**: Designing/training models, RAG pipelines, Neural Networks, Algorithms, TensorFlow.
- **Data Analysis**: Python, Data Structures, Pandas, Matplotlib, NumPy.
- **Web & Programming**: HTML/CSS, Java, C, C++, MySQL, Containerized apps.
- **Infrastructure**: Git/GitHub, Linux, Docker.

### Key Projects:
- **Tikkocampus**: An innovative AI solution built for campus-scale problems (his featured project).
- **Let's Stutter**: A specialized solution exploring ML models and speech intelligence (Coming soon to Play Store).

### Verified Certifications:
- Machine Learning Specialization (DeepLearning.AI)
- CS50: Intro to Computer Science (Harvard University)
- EFSET English Certificate (C1 Level)
- McKinsey Forward (Soft Skills)
- Python for AI (DeepLearning.AI)
- SQL for Data Science (UC Davis)

### Interaction Guidelines:
- Communicate fluently in both English and French.
- Be professional, technical yet accessible, and enthusiastic about AI engineering.
- If asked about something not mentioned above, politely state that you can only provide information based on Ilyass's professional portfolio.
- Keep responses concise and formatted with bullet points for readability when listing items.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Prepend the strict identity system prompt
  const apiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
  ];

  try {
    // Check if the developer provided the key
    if (!process.env.GROQ_API_KEY) {
        res.write("AI Offline: Missing GROQ_API_KEY in server environment.");
        return res.end();
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Inform the client that we are sending a raw chunked stream
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.1-8b-instant",
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('[BACKEND] Chatbot Streaming Error:', error.message);
    res.write("\n\n[System Error: Failed to connect to inference server.]");
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`[BACKEND] Server listening on http://localhost:${PORT}`);
});
