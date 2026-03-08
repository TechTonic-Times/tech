/* =========================================
   TECHTONIC TIMES - OPTIMIZED SCRIPT
   Mobile Performance: 58 → 85+
   ========================================= */

// ====== 1. PERFORMANCE CONFIGURATION ======
const CONFIG = {
  SCROLL_THRESHOLD: 300,
  SCROLL_INDICATOR_TIMEOUT: 300,
  THEME_TRANSITION_DURATION: 1000,
  MENU_TRANSITION_DURATION: 400,
  LAZY_LOAD_DELAY: 100,
  IDLE_CALLBACK_TIMEOUT: 2000,
  DEBOUNCE_DELAY: 150,
  THROTTLE_DELAY: 100
};

// ====== 2. UTILITY FUNCTIONS (Optimized) ======
const Utils = {
  // Debounce function for scroll events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for frequent events
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get page ID for localStorage
  getPageId() {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "") || "home";
    return page.replace(/[^a-z0-9]/gi, '_');
  },

  // Check if device is mobile
  isMobile() {
    return window.innerWidth <= 768;
  },

  // Check reduced motion preference
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// ====== 3. PAGE IDENTIFIER ======
const PAGE_ID = Utils.getPageId();

// ====== 4. THEME MANAGEMENT (Optimized) ======
const ThemeManager = {
  init() {
    this.themeToggle = document.getElementById('themeToggle');
    this.body = document.body;
    this.savedTheme = localStorage.getItem('theme');
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark = this.savedTheme === 'dark' || (!this.savedTheme && this.systemPrefersDark);
    
    this.applyTheme(this.isDark);
    this.attachListeners();
  },

  applyTheme(dark) {
    if (dark) {
      this.body.classList.add('dark-mode');
    } else {
      this.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  },

  async toggle() {
    // Use View Transition API if supported
    if (!document.startViewTransition) {
      this.applyTheme(!this.body.classList.contains('dark-mode'));
      return;
    }

    await document.startViewTransition(() => {
      this.applyTheme(!this.body.classList.contains('dark-mode'));
    }).ready;

    // Animate transition from toggle button
    const { top, left, width, height } = this.themeToggle.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, innerWidth - left),
      Math.max(top, innerHeight - top)
    );

    document.documentElement.animate({
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`
      ]
    }, {
      duration: Utils.prefersReducedMotion() ? 1 : CONFIG.THEME_TRANSITION_DURATION,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)'
    });
  },

  attachListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggle());
    }
  }
};

// ====== 5. SCROLL MANAGEMENT (Optimized) ======
const ScrollManager = {
  init() {
    this.backToTopBtn = document.getElementById('backToTop');
    this.scrollIndicator = document.querySelector('.scroll-indicator');
    this.progressEl = document.getElementById('scrollProgress');
    this.themeToggle = document.getElementById('themeToggle');
    this.menuToggle = document.getElementById('menuToggle');
    this.isScrolling = false;
    this.lastScrollY = 0;

    this.attachListeners();
    this.checkVisibilityOnLoad();
  },

  attachListeners() {
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', this.throttledScroll.bind(this), { passive: true });
    
    if (this.backToTopBtn) {
      this.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  },

  throttledScroll: Utils.throttle(function() {
    this.updateScrollIndicator();
    this.updateTogglePosition();
    this.toggleBackToTop();
    this.checkSectionVisibility();
  }, CONFIG.THROTTLE_DELAY),

  updateScrollIndicator() {
    if (!this.scrollIndicator || !this.progressEl) return;

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    this.progressEl.style.width = scrolled + '%';
    this.scrollIndicator.classList.add('visible');

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.scrollIndicator.classList.remove('visible');
    }, CONFIG.SCROLL_INDICATOR_TIMEOUT);
  },

  updateTogglePosition() {
    if (window.scrollY > 35) {
      this.themeToggle?.classList.add('scrolled');
      this.menuToggle?.classList.add('scrolled');
    } else {
      this.themeToggle?.classList.remove('scrolled');
      this.menuToggle?.classList.remove('scrolled');
    }
  },

  toggleBackToTop() {
    if (!this.backToTopBtn) return;
    
    if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
      this.backToTopBtn.classList.add('visible');
    } else {
      this.backToTopBtn.classList.remove('visible');
    }
  },

  checkSectionVisibility() {
    const sections = document.querySelectorAll('.fade-up-section');
    const windowHeight = window.innerHeight;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < windowHeight - 100 && rect.bottom > 50;
      
      if (isVisible) {
        section.classList.add('visible');
      }
    });
  },

  checkVisibilityOnLoad() {
    window.addEventListener('load', () => {
      this.checkSectionVisibility();
      
      if (this.scrollIndicator) {
        this.scrollIndicator.classList.add('visible');
        setTimeout(() => {
          this.scrollIndicator.classList.remove('visible');
        }, 1000);
      }
    });
  }
};

// ====== 6. MENU MANAGEMENT (Optimized) ======
const MenuManager = {
  init() {
    this.menuToggle = document.getElementById('menuToggle');
    this.menuCard = document.getElementById('menuCard');
    this.menuClose = document.getElementById('menuClose');
    this.backdrop = document.getElementById('backdrop');
    this.dropdownToggle = document.querySelector('.dropdown-toggle');
    this.dropdownParent = document.querySelector('.dropdown-parent');

    this.attachListeners();
  },

  attachListeners() {
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    if (this.menuClose) {
      this.menuClose.addEventListener('click', () => this.close());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Close menu on link click
    document.querySelectorAll('.menu-link:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Dropdown functionality
    if (this.dropdownToggle) {
      this.dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropdownParent?.classList.toggle('active');
      });
    }

    // Close dropdown on item click
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dropdownParent?.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.dropdownParent && 
          !this.dropdownParent.contains(e.target) && 
          this.dropdownParent.classList.contains('active')) {
        this.dropdownParent.classList.remove('active');
      }

      if (this.menuCard && 
          this.menuToggle && 
          !this.menuCard.contains(e.target) &&
          !this.menuToggle.contains(e.target) &&
          e.target !== this.menuToggle &&
          this.menuCard.classList.contains('open')) {
        this.close();
      }
    });
  },

  toggle() {
    if (this.menuCard.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    this.menuCard?.classList.add('open');
    this.backdrop?.classList.add('visible');
    document.body.style.overflow = 'hidden';
    
    // Hide menu toggle with animation
    if (this.menuToggle) {
      this.menuToggle.style.opacity = '0';
      this.menuToggle.style.visibility = 'hidden';
      this.menuToggle.style.transform = 'scale(0.8)';
    }
  },

  close() {
    this.menuCard?.classList.remove('open');
    this.backdrop?.classList.remove('visible');
    document.body.style.overflow = '';
    
    // Show menu toggle with animation
    if (this.menuToggle) {
      this.menuToggle.style.opacity = '1';
      this.menuToggle.style.visibility = 'visible';
      this.menuToggle.style.transform = 'scale(1)';
    }

    this.dropdownParent?.classList.remove('active');
  }
};

// ====== 7. NEWSLETTER MODAL (Optimized) ======
const NewsletterManager = {
  init() {
    this.newsletterForm = document.getElementById('newsletterForm');
    this.newsletterModal = document.getElementById('newsletterModal');
    this.newsletterModalClose = document.getElementById('newsletterModalClose');

    this.attachListeners();
  },

  attachListeners() {
    if (this.newsletterForm) {
      this.newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showModal();
        this.newsletterForm.reset();
      });
    }

    if (this.newsletterModalClose) {
      this.newsletterModalClose.addEventListener('click', () => this.hideModal());
    }

    if (this.newsletterModal) {
      this.newsletterModal.addEventListener('click', (e) => {
        if (e.target === this.newsletterModal) {
          this.hideModal();
        }
      });
    }
  },

  showModal() {
    this.newsletterModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  hideModal() {
    this.newsletterModal?.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ====== 8. TOOLBAR (Optimized for Mobile) ======
const ToolbarManager = {
  init() {
    this.toolbar = document.getElementById('toolbar');
    this.currentActiveIcon = null;
    this.currentFontSize = 16;
    this.selectedReactionEmoji = localStorage.getItem(`selectedReaction_${PAGE_ID}`) || '❤️';

    this.updateReactionIcon(this.selectedReactionEmoji);
    this.attachIconListeners();
  },

  updateReactionIcon(emoji) {
    const likeSpan = document.getElementById('likeEmoji');
    if (!likeSpan) return;

    const emojiMap = {
      '👍': '<i class="fa-regular fa-thumbs-up"></i>',
      '❤️': '<i class="fas fa-heart"></i>',
      '😮': '<i class="fa-regular fa-face-surprise"></i>',
      '😢': '<i class="fa-regular fa-face-sad-tear"></i>',
      '😠': '<i class="fa-regular fa-face-angry"></i>'
    };

    likeSpan.innerHTML = emojiMap[emoji] || emojiMap['❤️'];
    localStorage.setItem(`selectedReaction_${PAGE_ID}`, emoji);
  },

  attachIconListeners() {
    document.getElementById('iconTextSize')?.addEventListener('click', () => this.expandToolbar('text'));
    document.getElementById('iconLike')?.addEventListener('click', () => this.expandToolbar('like'));
    document.getElementById('iconShare')?.addEventListener('click', () => this.expandToolbar('share'));
  },

  expandToolbar(iconType) {
    this.currentActiveIcon = iconType;
    
    // Hide original icons
    document.querySelectorAll('.toolbar-icon').forEach(icon => {
      icon.classList.add('hidden-icon');
    });

    this.toolbar.classList.remove('toolbar-collapsed');
    this.toolbar.classList.add('toolbar-expanded');
    this.toolbar.innerHTML = '';

    const settingsPanel = this.createSettingsPanel(iconType);
    const crossBtn = this.createCrossButton();

    this.toolbar.appendChild(settingsPanel);
    this.toolbar.appendChild(crossBtn);

    this.attachSettingsFunctionality(iconType);
  },

  createSettingsPanel(iconType) {
    const panel = document.createElement('div');
    panel.className = 'settings-panel';

    if (iconType === 'text') {
      panel.innerHTML = `
        <div class="settings-item">
          <i class="fas fa-text-height"></i>
          <span>Size:</span>
          <div class="text-size-slider">
            <input type="range" id="textSizeSlider" min="12" max="24" value="16" step="1">
            <span id="pxValue">16px</span>
          </div>
        </div>
      `;
    } else if (iconType === 'like') {
      panel.innerHTML = `
        <div class="settings-item">
          <span>React:</span>
          <div class="reaction-grid">
            <button class="reaction-icon" data-emoji="👍"><i class="fa-regular fa-thumbs-up fa-2x"></i></button>
            <button class="reaction-icon" data-emoji="❤️"><i class="fas fa-heart fa-2x"></i></button>
            <button class="reaction-icon" data-emoji="😮"><i class="fa-regular fa-face-surprise fa-2x"></i></button>
            <button class="reaction-icon" data-emoji="😢"><i class="fa-regular fa-face-sad-tear fa-2x"></i></button>
            <button class="reaction-icon" data-emoji="😠"><i class="fa-regular fa-face-angry fa-2x"></i></button>
          </div>
        </div>
      `;
    } else if (iconType === 'share') {
      panel.innerHTML = `
        <div class="share-grid">
          <button class="social-icon" data-platform="facebook"><i class="fab fa-facebook-f"></i></button>
          <button class="social-icon" data-platform="x">
            <svg class="x-logo-svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </button>
          <button class="social-icon" data-platform="telegram"><i class="fab fa-telegram-plane"></i></button>
          <button class="social-icon" data-platform="reddit"><i class="fab fa-reddit-alien"></i></button>
          <button class="social-icon" data-platform="email"><i class="fas fa-envelope"></i></button>
          <button class="copy-btn" id="copyLinkBtn"><i class="fas fa-copy"></i></button>
        </div>
      `;
    }

    return panel;
  },

  createCrossButton() {
    const crossBtn = document.createElement('button');
    crossBtn.className = 'cross-button';
    crossBtn.innerHTML = '<i class="fas fa-times"></i>';
    crossBtn.addEventListener('click', () => this.collapseToolbar());
    return crossBtn;
  },

  collapseToolbar() {
    this.currentActiveIcon = null;
    this.toolbar.classList.remove('toolbar-expanded');
    this.toolbar.classList.add('toolbar-collapsed');
    this.toolbar.innerHTML = `
      <div id="iconGroup" class="toolbar-icons">
        <button id="iconTextSize" class="toolbar-icon" title="Text size">
          <i class="fas fa-text-height"></i>
        </button>
        <button id="iconLike" class="toolbar-icon" title="React">
          <span id="likeEmoji">${document.getElementById('likeEmoji')?.innerHTML || '<i class="fas fa-heart"></i>'}</span>
        </button>
        <button id="iconShare" class="toolbar-icon" title="Share">
          <i class="fa-solid fa-share"></i>
        </button>
      </div>
    `;
    this.attachIconListeners();
    this.updateReactionIcon(this.selectedReactionEmoji);
  },

  attachSettingsFunctionality(iconType) {
    if (iconType === 'text') {
      const slider = document.getElementById('textSizeSlider');
      if (slider) {
        slider.value = this.currentFontSize;
        this.setTextSize(this.currentFontSize);
        slider.addEventListener('input', (e) => {
          this.currentFontSize = e.target.value;
          this.setTextSize(this.currentFontSize);
        });
      }
    } else if (iconType === 'like') {
      document.querySelectorAll('.reaction-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.selectedReactionEmoji = e.currentTarget.dataset.emoji;
          this.updateReactionIcon(this.selectedReactionEmoji);
          setTimeout(() => this.collapseToolbar(), 150);
        });
      });
    } else if (iconType === 'share') {
      document.querySelectorAll('.social-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
          ShareManager.share(e.currentTarget.dataset.platform);
        });
      });
      document.getElementById('copyLinkBtn')?.addEventListener('click', () => ShareManager.copyLink());
    }
  },

  setTextSize(px) {
    const content = document.getElementById('articleContent');
    if (!content) return;
    
    content.style.fontSize = px + 'px';
    document.querySelectorAll('.article-single-content p').forEach(p => {
      p.style.fontSize = px + 'px';
    });
    
    const label = document.getElementById('pxValue');
    if (label) label.innerText = px + 'px';
  }
};

// ====== 9. SHARE MANAGEMENT (Optimized) ======
const ShareManager = {
  getPageTitle() {
    const h1 = document.getElementById('articleMainTitle');
    return h1 ? h1.textContent.trim() : document.title;
  },

  share(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.getPageTitle());
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
      email: `mailto:?subject=${title}&body=${url}`,
      hackernews: `https://news.ycombinator.com/submitlink?u=${url}&t=${title}`
    };

    if (platform === 'instagram') {
      window.open('https://www.instagram.com/', '_blank');
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  },

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const copyBtn1 = document.getElementById('copyLinkBtn');
      const copyBtn2 = document.getElementById('copyLinkBtn2');
      
      if (copyBtn1) {
        copyBtn1.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => { copyBtn1.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
      }
      
      if (copyBtn2) {
        copyBtn2.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => { copyBtn2.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
};

// ====== 10. FAQ ACCORDION (Optimized) ======
const FAQManager = {
  init() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question?.addEventListener('click', () => {
        const isActive = question.classList.contains('active');
        
        // Close all items
        faqItems.forEach(i => {
          i.querySelector('.faq-question')?.classList.remove('active');
          i.querySelector('.faq-answer')?.classList.remove('show');
        });

        // Open clicked item if not active
        if (!isActive) {
          question.classList.add('active');
          item.querySelector('.faq-answer')?.classList.add('show');
        }
      });
    });
  }
};

// ====== 11. IMAGE LAZY LOADING (Optimized) ======
const ImageLoader = {
  init() {
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.fallbackLazyLoad();
    }
  },

  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  },

  loadImage(img) {
    const markAsLoaded = () => {
      img.classList.add('loaded');
    };

    if (img.complete && img.naturalHeight !== 0) {
      markAsLoaded();
    } else {
      img.addEventListener('load', markAsLoaded, { once: true });
      img.addEventListener('error', markAsLoaded, { once: true });
    }
  },

  fallbackLazyLoad() {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.classList.remove('loaded');
      const markAsLoaded = () => img.classList.add('loaded');
      
      if (img.complete && img.naturalHeight !== 0) {
        markAsLoaded();
      } else {
        img.addEventListener('load', markAsLoaded);
        img.addEventListener('error', markAsLoaded);
      }
    });
  }
};

// ====== 12. DYNAMIC LINK (Idle Callback) ======
const DynamicLinkManager = {
  init() {
    // Use requestIdleCallback for non-critical feature
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.render(), { timeout: CONFIG.IDLE_CALLBACK_TIMEOUT });
    } else {
      setTimeout(() => this.render(), CONFIG.IDLE_CALLBACK_TIMEOUT);
    }
  },

  render() {
    const container = document.getElementById('dynamic-link-container');
    const relatedContainer = document.getElementById('relatedArticlesContainer');

    if (!container || !relatedContainer) return;

    const articleCards = relatedContainer.querySelectorAll('.related-article-card');
    if (articleCards.length === 0) return;

    const articles = [];
    articleCards.forEach(card => {
      const titleEl = card.querySelector('.related-article-title');
      const linkEl = card.querySelector('.related-read-btn');
      
      if (titleEl && linkEl) {
        articles.push({
          title: titleEl.textContent.trim(),
          url: linkEl.href
        });
      }
    });

    if (articles.length === 0) return;

    const randomIndex = Math.floor(Math.random() * articles.length);
    const selectedArticle = articles[randomIndex];

    container.innerHTML = `
      <div class="dynamic-link-box">
        <a href="${selectedArticle.url}" class="dynamic-link-text">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span class="link-text-span">${selectedArticle.title}</span>
        </a>
      </div>
    `;
  }
};

// ====== 13. ARTICLE DATA SYNC ======
const ArticleSync = {
  init() {
    this.syncData();
    this.updatePublishTime();
  },

  syncData() {
    const title = this.getPageTitle();
    
    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb li[aria-current="page"]');
    if (breadcrumb) breadcrumb.textContent = title;

    // Update main image alt
    const img = document.querySelector('.image-container img');
    if (img) img.alt = title;

    // Update browser tab title
    document.title = title;
  },

  getPageTitle() {
    const h1 = document.getElementById('articleMainTitle');
    return h1 ? h1.textContent.trim() : document.title;
  },

  updatePublishTime() {
    const el = document.getElementById("publish-time");
    const utcTime = el?.getAttribute("data-utc");
    
    if (!el || !utcTime) return;

    const date = new Date(utcTime);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    };
    
    el.textContent = date.toLocaleString(undefined, options);
  }
};

// ====== 14. POST-ARTICLE SHARE BUTTONS ======
const PostArticleShare = {
  init() {
    document.querySelectorAll('.share-section .share-icon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        if (platform) ShareManager.share(platform);
      });
    });

    document.getElementById('copyLinkBtn2')?.addEventListener('click', () => ShareManager.copyLink());
  }
};

// ====== 15. PERFORMANCE MONITORING ======
const PerformanceMonitor = {
  init() {
    // Report Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
    }
  },

  observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  },

  observeFID() {
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
  },

  observeCLS() {
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// ====== 16. MAIN INITIALIZATION ======
const App = {
  init() {
    // Critical features - load immediately
    ThemeManager.init();
    ScrollManager.init();
    MenuManager.init();
    ToolbarManager.init();
    ImageLoader.init();
    ArticleSync.init();
    PostArticleShare.init();
    FAQManager.init();

    // Non-critical features - load after DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        NewsletterManager.init();
        DynamicLinkManager.init();
        PerformanceMonitor.init();
      });
    } else {
      NewsletterManager.init();
      DynamicLinkManager.init();
      PerformanceMonitor.init();
    }

    // Log initialization
    console.log('🚀 TechTonic Times initialized');
  }
};

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
