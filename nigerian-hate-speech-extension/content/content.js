const SiteManager = {
  // Justification: 'article' is the semantic container for a tweet.
  // 'data-testid="tweetText"' is a stable selector for the tweet's text content.
  twitter: {
    postSelector: 'article',
    textSelector: '[data-testid="tweetText"]',
  },
  // Justification: Nairaland posts are contained in 'td' elements with a 'post' class.
  // The post body is within a 'div' with a 'post' class.
  nairaland: {
    postSelector: 'td.post',
    textSelector: 'div.post',
  },

  getPostElements() {
    const site = this.getSite();
    return document.querySelectorAll(site.postSelector);
  },

  getPostText(element) {
    const site = this.getSite();
    const textElement = element.querySelector(site.textSelector);
    return textElement ? textElement.textContent : '';
  },

  getSite() {
    if (window.location.hostname.includes('twitter') || window.location.hostname.includes('x.com')) {
      return this.twitter;
    } else if (window.location.hostname.includes('nairaland')) {
      return this.nairaland;
    }
    return null;
  }
};

let observer;

function startObserver() {
  const feed = document.querySelector('main'); // A general selector, might need refinement
  if (feed) {
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const posts = node.querySelectorAll(SiteManager.getSite().postSelector);
            posts.forEach(post => {
              const text = SiteManager.getPostText(post);
              if (text) {
                chrome.runtime.sendMessage({ type: 'CLASSIFY_TEXT', payload: { text } }, response => {
                  if (response && response.label === 'hate') {
                    hidePost(post);
                  }
                });
              }
            });
          }
        });
      });
    });
    observer.observe(feed, { childList: true, subtree: true });
  }
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
  }
}

function hidePost(post) {
  post.style.display = 'none';
  const placeholder = document.createElement('div');
  placeholder.className = 'hate-speech-placeholder';
  placeholder.innerHTML = 'Post hidden for potential hate speech. <button class="show-anyway">Show post anyway</button>';
  post.parentNode.insertBefore(placeholder, post);

  placeholder.querySelector('.show-anyway').addEventListener('click', () => {
    post.style.display = 'block';
    placeholder.remove();
  });
}

function showAllPosts() {
  document.querySelectorAll('.hate-speech-placeholder').forEach(placeholder => {
    const post = placeholder.nextSibling;
    if (post && post.style.display === 'none') {
      post.style.display = 'block';
    }
    placeholder.remove();
  });
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'START') {
    startObserver();
  } else if (message.type === 'STOP') {
    stopObserver();
  } else if (message.type === 'SHOW_ALL') {
    showAllPosts();
  }
});

// Initial state
chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
  if (enabled) {
    startObserver();
  }
});
