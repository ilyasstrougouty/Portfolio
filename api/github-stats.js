const axios = require('axios');

const cache = {
  data: null,
  timestamp: 0,
  username: null
};
const CACHE_DURATION = 3600000; // 1 hour

module.exports = async (req, res) => {
  // Support both query param and path (via vercel.json rewrite)
  const { username } = req.query;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

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

    const topRepos = [...repoStats].sort((a, b) => b.stars - a.stars).slice(0, 4);

    // 2. Fetch total contributions (Last Year)
    let totalContributions = 0;
    let weeks = [];
    try {
        const token = GITHUB_TOKEN ? GITHUB_TOKEN.replace(/['"]+/g, '') : null;
        if (token) {
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
};
