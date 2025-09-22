// Auth Page JavaScript
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeGSAP();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('forgotFormElement').addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });
    }

    handleTabSwitch(e) {
        const tabName = e.target.dataset.tab;

        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}Form`).classList.add('active');

        // GSAP animation
        gsap.fromTo(`#${tabName}Form`,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        );
    }

    async handleLogin(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get('email') || document.getElementById('loginEmail').value;
        const password = formData.get('password') || document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showNotification(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('username') || document.getElementById('signupUsername').value;
        const email = formData.get('email') || document.getElementById('signupEmail').value;
        const password = formData.get('password') || document.getElementById('signupPassword').value;
        const confirmPassword = formData.get('confirmPassword') || document.getElementById('confirmPassword').value;
        const bio = formData.get('bio') || document.getElementById('signupBio').value;
        const linkedin = formData.get('linkedin') || document.getElementById('signupLinkedin').value;

        if (!username || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: username,
                    email: email,
                    password: password,
                    bio: bio,
                    linkedin: linkedin
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showNotification(result.message || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Signup failed. Please try again.', 'error');
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get('email') || document.getElementById('forgotEmail').value;

        if (!email) {
            this.showNotification('Please enter your email', 'error');
            return;
        }

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email: email
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Password reset link sent to your email!', 'success');
            } else {
                this.showNotification(result.message || 'Failed to send reset email', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Failed to send reset email. Please try again.', 'error');
        }
    }

    handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('google') ? 'google' : 'github';
        this.showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
    }

    initializeGSAP() {
        // Auth page animations
        gsap.from('.auth-left', {
            duration: 1,
            x: -50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.2
        });

        gsap.from('.auth-right', {
            duration: 1,
            x: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.4
        });

        gsap.from('.auth-tabs', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.6
        });

        gsap.from('.auth-form.active', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.8
        });
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
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
});
