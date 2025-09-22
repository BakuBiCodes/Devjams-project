// Dashboard JavaScript - Fetches data from backend API
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.ideas = [];
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentFilter = 'all';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeGSAP();
        this.loadUserData();
        this.loadIdeas();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Profile menu
        document.getElementById('profileBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProfileMenu();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));

        // Post idea button
        document.getElementById('postIdeaBtn').addEventListener('click', () => this.openPostModal());

        // Get started button
        document.getElementById('getStartedBtn').addEventListener('click', () => this.handleGetStarted());

        // Explore button
        document.getElementById('exploreBtn').addEventListener('click', () => this.scrollToIdeas());

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Sort select
        document.getElementById('sortSelect').addEventListener('change', (e) => this.handleSort(e));

        // Modal close handlers
        document.getElementById('closePostModal').addEventListener('click', () => this.closePostModal());
        document.getElementById('cancelPost').addEventListener('click', () => this.closePostModal());

        // Form submissions
        document.getElementById('ideaForm').addEventListener('submit', (e) => this.handleIdeaSubmission(e));

        // Internship checkbox
        document.getElementById('allowInternships').addEventListener('change', (e) => this.toggleInternshipDetails(e));

        // Click outside to close modals and dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                this.closeProfileMenu();
            }
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserDisplay();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadIdeas() {
        try {
            const response = await fetch('/api/ideas');
            if (response.ok) {
                this.ideas = await response.json();
                this.renderIdeas();
            } else {
                this.showNotification('Failed to load ideas', 'error');
            }
        } catch (error) {
            console.error('Error loading ideas:', error);
            this.showNotification('Failed to load ideas', 'error');
        }
    }

    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();

        gsap.to('body', {
            duration: 0.3,
            backgroundColor: this.currentTheme === 'dark' ? '#0A0E1A' : '#ffffff',
            ease: 'power2.out'
        });
    }

    updateThemeIcon() {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (this.currentTheme === 'dark') {
            gsap.to(sunIcon, { rotation: 180, duration: 0.3 });
            gsap.to(moonIcon, { rotation: 0, duration: 0.3 });
        } else {
            gsap.to(sunIcon, { rotation: 0, duration: 0.3 });
            gsap.to(moonIcon, { rotation: -180, duration: 0.3 });
        }
    }

    initializeGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from('.hero-badge', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.2
        });

        gsap.from('.hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.4
        });

        gsap.from('.hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.6
        });

        gsap.from('.hero-actions', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.8
        });

        gsap.from('.hero-stats', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 1
        });

        gsap.from('.stat-number', {
            duration: 2,
            textContent: 0,
            ease: 'power2.out',
            delay: 1.5,
            snap: { textContent: 1 }
        });

        gsap.from('.idea-card', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.ideas-feed',
                start: 'top 80%'
            }
        });
    }

    toggleProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        dropdown.classList.toggle('show');

        if (dropdown.classList.contains('show')) {
            gsap.fromTo(dropdown,
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
            );
        }
    }

    closeProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown.classList.contains('show')) {
            gsap.to(dropdown, {
                opacity: 0,
                y: -10,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => dropdown.classList.remove('show')
            });
        }
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const filteredIdeas = this.ideas.filter(idea =>
            idea.title.toLowerCase().includes(query) ||
            idea.description.toLowerCase().includes(query) ||
            idea.author.toLowerCase().includes(query) ||
            idea.category.toLowerCase().includes(query)
        );

        this.renderIdeas(filteredIdeas);
    }

    openPostModal() {
        const modal = document.getElementById('postIdeaModal');
        modal.classList.add('show');

        // Show funding section only for verified users
        const fundingSection = document.getElementById('fundingSection');
        if (this.currentUser && this.currentUser.role === 'verified') {
            fundingSection.style.display = 'block';
        } else {
            fundingSection.style.display = 'none';
        }

        gsap.fromTo('.modal',
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
    }

    closePostModal() {
        const modal = document.getElementById('postIdeaModal');
        gsap.to('.modal', {
            scale: 0.9,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                modal.classList.remove('show');
                document.getElementById('ideaForm').reset();
                document.getElementById('internshipDetails').style.display = 'none';
                document.getElementById('fundingSection').style.display = 'none';
            }
        });
    }

    closeAllModals() {
        this.closePostModal();
    }

    handleGetStarted() {
        this.scrollToIdeas();
        const postBtn = document.getElementById('postIdeaBtn');
        gsap.fromTo(postBtn,
            { scale: 1 },
            { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 }
        );
        this.openPostModal();
    }

    scrollToIdeas() {
        const ideasSection = document.querySelector('.main-content');
        if (ideasSection) {
            gsap.to(window, {
                duration: 1,
                scrollTo: ideasSection,
                ease: 'power3.inOut'
            });
        }
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;

        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilter = filter;
        this.renderIdeas();
    }

    handleSort(e) {
        const sortBy = e.target.value;
        let sortedIdeas = [...this.ideas];

        switch (sortBy) {
            case 'most-voted':
                sortedIdeas.sort((a, b) => b.upvotes - a.upvotes);
                break;
            case 'newest':
                sortedIdeas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'trending':
                sortedIdeas.sort((a, b) => (b.upvotes + b.comments) - (a.upvotes + a.comments));
                break;
            case 'oldest':
                sortedIdeas.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
        }

        this.renderIdeas(sortedIdeas);
    }

    async handleIdeaSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const ideaData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            image_url: formData.get('image_url'),
            allow_internships: document.getElementById('allowInternships').checked,
            skills_required: formData.get('skills_required'),
            internship_description: formData.get('internship_description'),
            enable_funding: document.getElementById('enableFunding') ? document.getElementById('enableFunding').checked : false
        };

        try {
            const response = await fetch('/api/post-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ideaData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.closePostModal();
                this.showNotification('Idea submitted successfully! It will be reviewed by admins.', 'success');
                this.loadIdeas(); // Reload ideas
            } else {
                this.showNotification(result.message || 'Failed to submit idea', 'error');
            }
        } catch (error) {
            console.error('Error submitting idea:', error);
            this.showNotification('Failed to submit idea. Please try again.', 'error');
        }
    }

    toggleInternshipDetails(e) {
        const details = document.getElementById('internshipDetails');
        if (e.target.checked) {
            details.style.display = 'block';
            gsap.fromTo(details,
                { opacity: 0, height: 0 },
                { opacity: 1, height: 'auto', duration: 0.3, ease: 'power2.out' }
            );
        } else {
            gsap.to(details, {
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => details.style.display = 'none'
            });
        }
    }

    renderIdeas(ideasToRender = null) {
        const ideas = ideasToRender || this.ideas;
        const feed = document.getElementById('ideasFeed');

        // Filter by current filter
        let filteredIdeas = ideas;
        if (this.currentFilter === 'open-innovation') {
            filteredIdeas = ideas.filter(idea => !idea.is_verified);
        } else if (this.currentFilter === 'verified-startups') {
            filteredIdeas = ideas.filter(idea => idea.is_verified);
        }

        if (filteredIdeas.length === 0) {
            feed.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    No ideas found. Be the first to share your idea!
                </div>
            `;
            return;
        }

        feed.innerHTML = filteredIdeas.map(idea => this.createIdeaCard(idea)).join('');

        // Add event listeners to new cards
        this.addIdeaCardListeners();
    }

    createIdeaCard(idea) {
        const isBookmarked = this.currentUser?.bookmarks?.includes(idea.id);
        const hasUpvoted = idea.upvotedBy?.includes(this.currentUser?.id);
        const hasDownvoted = idea.downvotedBy?.includes(this.currentUser?.id);

        return `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-header">
                    <div class="idea-user">
                        <div class="idea-avatar">${idea.author.charAt(0)}</div>
                        <div class="idea-user-info">
                            <p>${this.formatDate(idea.created_at)} • ${idea.category}</p>
                        </div>
                    </div>
                    <div class="idea-status status-${idea.status}">
                        ${idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </div>
                </div>

                <h3 class="idea-title">${idea.title} ${idea.is_verified ? '<span class="verified-badge">✓</span>' : ''}</h3>

                <p class="idea-description">${idea.description}</p>

                <div class="idea-categories">
                    ${idea.category.split(',').map(cat => `<span class="category-tag">${cat.trim()}</span>`).join('')}
                </div>

                ${idea.allow_internships ? `
                    <div class="internship-banner">
                        <span>🎯 Open for Internships</span>
                        <p>Skills: ${idea.skills_required || 'Not specified'}</p>
                    </div>
                ` : ''}

                <div class="idea-footer">
                    <div class="idea-stats">
                        <button class="stat-btn upvote ${hasUpvoted ? 'upvoted' : ''}" data-action="upvote">
                            👍 ${idea.upvotes}
                        </button>
                        <button class="stat-btn downvote ${hasDownvoted ? 'downvoted' : ''}" data-action="downvote">
                            👎 ${idea.downvotes}
                        </button>
                        <button class="stat-btn" data-action="comment">
                            💬 ${idea.comments}
                        </button>
                    </div>

                    <div class="idea-actions">
                        <button class="action-btn bookmark ${isBookmarked ? 'active' : ''}" data-action="bookmark">
                            🔖
                        </button>
                        <button class="action-btn" data-action="share">
                            📤
                        </button>
                        ${idea.allow_internships ? `
                            <button class="action-btn apply-internship" data-action="apply">
                                Apply for Internship
                            </button>
                        ` : ''}
                        ${idea.is_verified ? `
                            <div class="razorpay-container" data-idea-id="${idea.id}">
                                <a href="https://rzp.io/rzp/7Aze0ae" target="_blank" class="action-btn" style="text-decoration: none; display: inline-block; padding: 8px 12px; border-radius: 6px; background-color: #528FF0; color: white; font-weight: 500; text-align: center;">
                                    💰 Fund this idea
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addIdeaCardListeners() {
        // Upvote/Downvote
        document.querySelectorAll('.stat-btn[data-action="upvote"], .stat-btn[data-action="downvote"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleVote(e));
        });

        // Bookmark
        document.querySelectorAll('.action-btn[data-action="bookmark"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBookmark(e));
        });

        // Share
        document.querySelectorAll('.action-btn[data-action="share"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShare(e));
        });

        // Apply for internship
        document.querySelectorAll('.action-btn[data-action="apply"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleApply(e));
        });
    }

    async handleVote(e) {
        const btn = e.currentTarget;
        const action = btn.dataset.action;
        const card = btn.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idea_id: ideaId,
                    vote_type: action
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Reload ideas to get updated vote counts
                this.loadIdeas();
                this.showNotification('Vote recorded!', 'success');
            } else {
                this.showNotification(result.message || 'Failed to vote', 'error');
            }
        } catch (error) {
            console.error('Error voting:', error);
            this.showNotification('Failed to vote. Please try again.', 'error');
        }
    }

    async handleBookmark(e) {
        const btn = e.currentTarget;
        const card = btn.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);

        try {
            const response = await fetch('/api/bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idea_id: ideaId
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                btn.classList.toggle('active');
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.message || 'Failed to bookmark', 'error');
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
            this.showNotification('Failed to bookmark. Please try again.', 'error');
        }
    }

    handleShare(e) {
        const card = e.currentTarget.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);
        const idea = this.ideas.find(i => i.id === ideaId);

        if (navigator.share) {
            navigator.share({
                title: idea.title,
                text: idea.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(`${idea.title} - ${window.location.href}`)
                .then(() => this.showNotification('Link copied to clipboard!', 'success'))
                .catch(() => this.showNotification('Could not copy link', 'error'));
        }
    }

    handleApply(e) {
        const card = e.currentTarget.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);
        const idea = this.ideas.find(i => i.id === ideaId);

        this.showNotification(`Application submitted for "${idea.title}" internship!`, 'success');
    }

    updateUserDisplay() {
        if (this.currentUser) {
            document.getElementById('creditsCount').textContent = this.currentUser.credits;

            // Show admin panel option if user is admin
            const adminMenuItem = document.querySelector('.admin-only');
            if (adminMenuItem) {
                adminMenuItem.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '3000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10B981' :
                type === 'error' ? '#EF4444' :
                    type === 'warning' ? '#F59E0B' : '#4F46E5'
        });

        document.body.appendChild(notification);

        gsap.to(notification, {
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        setTimeout(() => {
            gsap.to(notification, {
                x: '100%',
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
});
