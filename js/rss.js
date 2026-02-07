// RSS Feed Fetcher for Substack
(function() {
  const SUBSTACK_URL = 'https://benparens.substack.com/feed';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const CACHE_KEY = 'substack_posts';
  const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  const articlesContainer = document.getElementById('articles');

  // Check cache first
  function getCachedPosts() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { posts, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return posts;
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  }

  // Save to cache
  function cachePosts(posts) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        posts,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  }

  // Parse RSS XML
  function parseRSS(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    const items = xml.querySelectorAll('item');

    return Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';

      // Clean up description (remove HTML tags, limit length)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
      const excerpt = cleanDescription.substring(0, 200).trim() + (cleanDescription.length > 200 ? '...' : '');

      return {
        title,
        link,
        date: formatDate(pubDate),
        excerpt
      };
    });
  }

  // Format date nicely
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  // Render posts
  function renderPosts(posts) {
    if (!posts || posts.length === 0) {
      articlesContainer.innerHTML = `
        <p style="color: var(--text-secondary);">
          No posts yet. Check out
          <a href="https://benparens.substack.com" target="_blank">my Substack</a>.
        </p>
      `;
      return;
    }

    articlesContainer.innerHTML = posts.map(post => `
      <a href="${post.link}" target="_blank" class="article-card">
        <h3>${escapeHtml(post.title)}</h3>
        <p class="date">${post.date}</p>
        <p class="excerpt">${escapeHtml(post.excerpt)}</p>
      </a>
    `).join('');
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show error
  function showError() {
    articlesContainer.innerHTML = `
      <p style="color: var(--text-secondary);">
        Unable to load posts. Visit
        <a href="https://benparens.substack.com" target="_blank">my Substack</a>
        directly.
      </p>
    `;
  }

  // Fetch and display posts
  async function loadPosts() {
    // Try cache first
    const cached = getCachedPosts();
    if (cached) {
      renderPosts(cached);
      return;
    }

    // Fetch fresh data
    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(SUBSTACK_URL));
      if (!response.ok) throw new Error('Fetch failed');

      const xmlText = await response.text();
      const posts = parseRSS(xmlText);

      cachePosts(posts);
      renderPosts(posts);
    } catch (error) {
      console.error('RSS fetch error:', error);
      showError();
    }
  }

  // Initialize
  if (articlesContainer) {
    loadPosts();
  }
})();
