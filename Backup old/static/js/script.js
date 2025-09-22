// PitchDesk - Main JavaScript File
class PitchDesk {
    constructor() {
        this.currentUser = {
            id: 1,
            name: 'User',
            role: 'student',
            credits: 95,
            bookmarks: [],
            avatar: 'U'
        };

        this.ideas = this.getMockIdeas();
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentFilter = 'all';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeGSAP();
        this.renderIdeas();
        this.updateCreditsDisplay();
        this.updateUserDisplay();
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
        document.getElementById('closeProfileModal').addEventListener('click', () => this.closeProfileModal());

        // Profile menu items
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

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

    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();

        // GSAP animation for theme transition
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
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Hero animations
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

        // Stats counter animation
        gsap.from('.stat-number', {
            duration: 2,
            textContent: 0,
            ease: 'power2.out',
            delay: 1.5,
            snap: { textContent: 1 }
        });

        // Scroll animations
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
            }
        });
    }

    closeProfileModal() {
        const modal = document.getElementById('profileModal');
        gsap.to('.modal', {
            scale: 0.9,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => modal.classList.remove('show')
        });
    }

    closeAllModals() {
        this.closePostModal();
        this.closeProfileModal();
    }

    handleGetStarted() {
        // Smooth scroll to ideas section
        this.scrollToIdeas();

        // Highlight the post idea button
        const postBtn = document.getElementById('postIdeaBtn');
        gsap.fromTo(postBtn,
            { scale: 1 },
            { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 }
        );
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
                sortedIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'trending':
                sortedIdeas.sort((a, b) => (b.upvotes + b.comments) - (a.upvotes + a.comments));
                break;
            case 'oldest':
                sortedIdeas.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
        }

        this.renderIdeas(sortedIdeas);
    }

    handleLogout() {
        // Simple logout - in real app would clear tokens/sessions
        this.closeProfileMenu();
        this.showNotification('Logged out successfully', 'success');
    }

    handleIdeaSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const ideaData = {
            title: formData.get('ideaTitle') || document.getElementById('ideaTitle').value,
            description: formData.get('ideaDescription') || document.getElementById('ideaDescription').value,
            category: formData.get('ideaCategory') || document.getElementById('ideaCategory').value,
            allowInternships: document.getElementById('allowInternships').checked,
            skillsRequired: formData.get('skillsRequired') || document.getElementById('skillsRequired').value,
            internshipDescription: formData.get('internshipDescription') || document.getElementById('internshipDescription').value,
            author: this.currentUser.name,
            authorId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            status: 'pending',
            upvotes: 0,
            downvotes: 0,
            comments: 0,
            isVerified: this.currentUser.role === 'verified'
        };

        // Add to ideas array
        this.ideas.unshift(ideaData);

        // Close modal and show success
        this.closePostModal();
        this.showNotification('Idea submitted successfully! It will be reviewed by admins.', 'success');

        // Re-render ideas
        this.renderIdeas();
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
            filteredIdeas = ideas.filter(idea => !idea.isVerified);
        } else if (this.currentFilter === 'verified-startups') {
            filteredIdeas = ideas.filter(idea => idea.isVerified);
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
        const isBookmarked = this.currentUser.bookmarks.includes(idea.id);
        const hasUpvoted = idea.upvotedBy?.includes(this.currentUser.id);
        const hasDownvoted = idea.downvotedBy?.includes(this.currentUser.id);

        return `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-header">
                    <div class="idea-user">
                        <div class="idea-avatar">${idea.author.charAt(0)}</div>
                        <div class="idea-user-info">
                            <h4>${idea.author} ${idea.isVerified ? '<span class="verified-badge">✓</span>' : ''}</h4>
                            <p>${this.formatDate(idea.createdAt)} • ${idea.category}</p>
                        </div>
                    </div>
                    <div class="idea-status status-${idea.status}">
                        ${idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </div>
                </div>

                <h3 class="idea-title">${idea.title}</h3>
                <p class="idea-description">${idea.description}</p>

                <div class="idea-categories">
                    ${idea.category.split(',').map(cat => `<span class="category-tag">${cat.trim()}</span>`).join('')}
                </div>

                ${idea.allowInternships ? `
                    <div class="internship-banner">
                        <span>🎯 Open for Internships</span>
                        <p>Skills: ${idea.skillsRequired || 'Not specified'}</p>
                    </div>
                ` : ''}

                <div class="idea-footer">
                    <div class="idea-stats">
                        <button class="stat-btn upvote ${hasUpvoted ? 'upvoted' : ''}" data-action="upvote">
                            ❤️ ${idea.upvotes}
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
                        ${idea.allowInternships ? `
                            <button class="action-btn apply-internship" data-action="apply">
                                Apply for Internship
                            </button>
                        ` : ''}
${idea.isVerified ? `
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

        // Fund idea
        document.querySelectorAll('.action-btn[data-action="fund"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFund(e));
        });

        // Comment (placeholder)
        document.querySelectorAll('.stat-btn[data-action="comment"]').forEach(btn => {
            btn.addEventListener('click', (e) => this.showNotification('Comments feature coming soon!', 'info'));
        });
    }

    handleVote(e) {
        const btn = e.currentTarget;
        const action = btn.dataset.action;
        const card = btn.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);

        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea) return;

        // Check if user has enough credits
        if (this.currentUser.credits <= 0) {
            this.showNotification('Not enough credits to vote!', 'error');
            return;
        }

        // Handle vote logic
        if (action === 'upvote') {
            if (idea.upvotedBy?.includes(this.currentUser.id)) {
                // Remove upvote
                idea.upvotes--;
                idea.upvotedBy = idea.upvotedBy.filter(id => id !== this.currentUser.id);
                btn.classList.remove('upvoted');
            } else {
                // Add upvote
                idea.upvotes++;
                idea.upvotedBy = idea.upvotedBy || [];
                idea.upvotedBy.push(this.currentUser.id);
                btn.classList.add('upvoted');

                // Remove downvote if exists
                if (idea.downvotedBy?.includes(this.currentUser.id)) {
                    idea.downvotes--;
                    idea.downvotedBy = idea.downvotedBy.filter(id => id !== this.currentUser.id);
                    const downvoteBtn = card.querySelector('.downvote');
                    downvoteBtn.classList.remove('downvoted');
                }
            }
        } else if (action === 'downvote') {
            if (idea.downvotedBy?.includes(this.currentUser.id)) {
                // Remove downvote
                idea.downvotes--;
                idea.downvotedBy = idea.downvotedBy.filter(id => id !== this.currentUser.id);
                btn.classList.remove('downvoted');
            } else {
                // Add downvote
                idea.downvotes++;
                idea.downvotedBy = idea.downvotedBy || [];
                idea.downvotedBy.push(this.currentUser.id);
                btn.classList.add('downvoted');

                // Remove upvote if exists
                if (idea.upvotedBy?.includes(this.currentUser.id)) {
                    idea.upvotes--;
                    idea.upvotedBy = idea.upvotedBy.filter(id => id !== this.currentUser.id);
                    const upvoteBtn = card.querySelector('.upvote');
                    upvoteBtn.classList.remove('upvoted');
                }
            }
        }

        // Deduct credit
        this.currentUser.credits--;
        this.updateCreditsDisplay();

        // Update display
        btn.innerHTML = btn.innerHTML.replace(/\d+/, action === 'upvote' ? idea.upvotes : idea.downvotes);

        // Animation
        gsap.fromTo(btn,
            { scale: 1 },
            { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
        );
    }

    handleBookmark(e) {
        const btn = e.currentTarget;
        const card = btn.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);

        const ideaIndex = this.currentUser.bookmarks.indexOf(ideaId);

        if (ideaIndex > -1) {
            // Remove bookmark
            this.currentUser.bookmarks.splice(ideaIndex, 1);
            btn.classList.remove('active');
        } else {
            // Add bookmark
            this.currentUser.bookmarks.push(ideaId);
            btn.classList.add('active');
        }

        // Update bookmarks display
        this.updateBookmarksDisplay();

        // Animation
        gsap.fromTo(btn,
            { rotation: 0 },
            { rotation: 360, duration: 0.5, ease: 'power2.out' }
        );
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
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${idea.title} - ${window.location.href}`)
                .then(() => this.showNotification('Link copied to clipboard!', 'success'))
                .catch(() => this.showNotification('Could not copy link', 'error'));
        }
    }

    handleApply(e) {
        const card = e.currentTarget.closest('.idea-card');
        const ideaId = parseInt(card.dataset.id);
        const idea = this.ideas.find(i => i.id === ideaId);

        // In a real app, this would open an application form
        this.showNotification(`Application submitted for "${idea.title}" internship!`, 'success');
    }

    handleFund(e) {
        // In a real app, this would integrate with Razorpay
        this.showNotification('Redirecting to payment page...', 'info');
        // window.location.href = 'razorpay-payment-link';
    }

    updateCreditsDisplay() {
        const creditsCount = document.getElementById('creditsCount');
        creditsCount.textContent = this.currentUser.credits;

        // Animation
        gsap.fromTo(creditsCount,
            { scale: 1 },
            { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 }
        );
    }

    updateUserDisplay() {
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
        document.getElementById('profileAvatar').textContent = this.currentUser.avatar;

        // Show admin panel option if user is admin
        const adminMenuItem = document.querySelector('.admin-only');
        if (this.currentUser.role === 'admin') {
            adminMenuItem.style.display = 'block';
        }
    }

    updateBookmarksDisplay() {
        const bookmarksList = document.getElementById('bookmarksList');
        const bookmarkedIdeas = this.ideas.filter(idea => this.currentUser.bookmarks.includes(idea.id));

        if (bookmarkedIdeas.length === 0) {
            bookmarksList.innerHTML = '<p class="empty-state">No bookmarks yet. Start exploring ideas!</p>';
        } else {
            bookmarksList.innerHTML = bookmarkedIdeas.map(idea =>
                `<div class="bookmark-item">
                    <h4>${idea.title}</h4>
                    <p>${idea.author} • ${this.formatDate(idea.createdAt)}</p>
                </div>`
            ).join('');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
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

        // Animate in
        gsap.to(notification, {
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Animate out and remove
        setTimeout(() => {
            gsap.to(notification, {
                x: '100%',
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    getMockIdeas() {
        return [
            {
                id: 1,
                title: 'Sustainable Energy Management for Hostels',
                description: 'IoT-based energy monitoring and optimization system for VIT hostels. Track energy consumption, identify wastage, and gamify energy saving among students. Could potentially reduce campus energy costs by 30%.',
                author: 'Rahul Kumar',
                authorId: 2,
                category: 'IoT, Sustainability, Energy',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'approved',
                upvotes: 156,
                downvotes: 3,
                comments: 45,
                isVerified: true,
                allowInternships: true,
                skillsRequired: 'IoT Development, Python, Data Analytics, Hardware Integration',
                internshipDescription: 'Work on IoT sensor deployment and energy optimization algorithms.'
            },
            {
                id: 2,
                title: 'Campus Food Delivery Optimization',
                description: 'A smart delivery system that optimizes routes and reduces delivery time for food orders within VIT campus. Features include real-time tracking, bulk ordering for hostels, and integration with campus payment systems.',
                author: 'Priya Patel',
                authorId: 3,
                category: 'Logistics, Food, Campus',
                createdAt: '2024-01-14T14:20:00Z',
                status: 'approved',
                upvotes: 93,
                downvotes: 1,
                comments: 28,
                isVerified: true,
                allowInternships: true,
                skillsRequired: 'React Native, Node.js, MongoDB, GPS Integration',
                internshipDescription: 'Develop mobile app and optimize delivery routing algorithms.'
            },
            {
                id: 3,
                title: 'AI-Powered Study Assistant',
                description: 'An intelligent study companion that helps VIT students with personalized learning paths, doubt solving, and exam preparation using advanced AI algorithms. Includes features like smart note-taking and progress tracking.',
                author: 'Arjun Singh',
                authorId: 4,
                category: 'AI, Education, Machine Learning',
                createdAt: '2024-01-13T09:15:00Z',
                status: 'pending',
                upvotes: 127,
                downvotes: 5,
                comments: 32,
                isVerified: false,
                allowInternships: true,
                skillsRequired: 'Python, Machine Learning, React, Node.js',
                internshipDescription: 'Develop AI models and user interfaces for the study assistant platform.'
            },
            {
                id: 4,
                title: 'Smart Parking Management System',
                description: 'Computer vision-based parking management system for VIT campus. Real-time parking spot detection, reservation system, and automated billing. Could solve the chronic parking issues on campus.',
                author: 'Sneha Reddy',
                authorId: 5,
                category: 'Computer Vision, IoT, Campus Management',
                createdAt: '2024-01-12T16:45:00Z',
                status: 'approved',
                upvotes: 89,
                downvotes: 2,
                comments: 19,
                isVerified: false,
                allowInternships: false
            },
            {
                id: 5,
                title: 'Mental Health Support Platform',
                description: 'A comprehensive mental health support system specifically designed for college students with counseling, peer support, and wellness tracking. Includes anonymous posting and professional counseling integration.',
                author: 'Kiran Mehta',
                authorId: 6,
                category: 'Healthcare, Mental Health, Social Impact',
                createdAt: '2024-01-11T11:30:00Z',
                status: 'approved',
                upvotes: 203,
                downvotes: 4,
                comments: 41,
                isVerified: true,
                allowInternships: true,
                skillsRequired: 'Psychology background, React, Node.js, MongoDB',
                internshipDescription: 'Work on developing the counseling platform and user experience design.'
            }
        ];
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PitchDesk();
});
