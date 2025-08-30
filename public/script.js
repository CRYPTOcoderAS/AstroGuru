class AstroGuruApp {
    constructor() {
        // Detect if running on Netlify or locally
        this.isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('.app');
        this.baseURL = this.isNetlify ? '/.netlify/functions' : '/api';
        this.token = localStorage.getItem('token');
        this.user = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        document.getElementById('loginTab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('signupTab').addEventListener('click', () => this.switchTab('signup'));
        
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('signupPassword');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
            });

            passwordInput.addEventListener('input', () => this.validatePassword());
            this.validatePassword();
        }

        this.setDateConstraints();
        
        document.getElementById('todayBtn').addEventListener('click', () => this.showSection('today'));
        document.getElementById('historyBtn').addEventListener('click', () => this.showSection('history'));
        document.getElementById('profileBtn').addEventListener('click', () => this.showSection('profile'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    switchTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        }
    }

    validatePassword() {
        const password = document.getElementById('signupPassword').value;
        
        // Get requirement elements
        const lengthReq = document.getElementById('lengthReq');
        const uppercaseReq = document.getElementById('uppercaseReq');
        const lowercaseReq = document.getElementById('lowercaseReq');
        const numberReq = document.getElementById('numberReq');

        // Check each requirement
        const hasLength = password.length >= 6;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        // Update UI for each requirement
        this.updateRequirement(lengthReq, hasLength, 'At least 6 characters');
        this.updateRequirement(uppercaseReq, hasUppercase, 'One uppercase letter');
        this.updateRequirement(lowercaseReq, hasLowercase, 'One lowercase letter');
        this.updateRequirement(numberReq, hasNumber, 'One number');

        return hasLength && hasUppercase && hasLowercase && hasNumber;
    }

    updateRequirement(element, isValid, text) {
        if (!element) return;
        
        element.className = isValid ? 'requirement valid' : 'requirement invalid';
        element.textContent = text;
    }

    setDateConstraints() {
        const birthdateInput = document.getElementById('signupBirthdate');
        if (!birthdateInput) return;

        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 13); // Must be at least 13 years old
        
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120); // Maximum 120 years old

        // Format dates as YYYY-MM-DD for the date input
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        birthdateInput.setAttribute('max', formatDate(maxDate));
        birthdateInput.setAttribute('min', formatDate(minDate));
        
        // Set a default value if none exists (optional)
        if (!birthdateInput.value) {
            const defaultDate = new Date();
            defaultDate.setFullYear(today.getFullYear() - 25); // Default to 25 years old
            birthdateInput.value = formatDate(defaultDate);
        }
    }

    async checkAuth() {
        if (this.token) {
            try {
                const response = await this.apiCall('/auth/profile', 'GET');
                if (response.success) {
                    this.user = response.data.user;
                    this.showApp();
                    this.loadTodayHoroscope();
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await this.apiCall('/auth/login', 'POST', { email, password });
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                this.showSuccess('Login successful!');
                this.showApp();
                this.loadTodayHoroscope();
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const birthdate = document.getElementById('signupBirthdate').value;

        if (!name || !email || !password || !birthdate) {
            this.showError('Please fill in all fields');
            return;
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            this.showError('Name can only contain letters and spaces');
            return;
        }

        if (!this.validatePassword()) {
            this.showError('Please ensure your password meets all requirements');
            return;
        }

        const birthDateObj = new Date(birthdate);
        const today = new Date();
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 13);
        const maxAge = new Date();
        maxAge.setFullYear(today.getFullYear() - 120);

        if (birthDateObj > minAge) {
            this.showError('You must be at least 13 years old to register');
            return;
        }

        if (birthDateObj < maxAge || birthDateObj > today) {
            this.showError('Please provide a valid birth date');
            return;
        }

        try {
            const response = await this.apiCall('/auth/signup', 'POST', { name, email, password, birthdate });
            
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                this.showSuccess(`Welcome ${name}! Your zodiac sign is ${response.data.user.zodiacSign.toUpperCase()}`);
                this.showApp();
                this.loadTodayHoroscope();
            } else {
                if (response.errors && response.errors.length > 0) {
                    const errorMessages = response.errors.map(err => err.msg).join('. ');
                    this.showError(`Validation failed: ${errorMessages}`);
                } else {
                    this.showError(response.message);
                }
            }
        } catch (error) {
            this.showError(`Signup failed: ${error.message}`);
        }
    }

    showApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        document.getElementById('navigation').style.display = 'flex';
    }

    hideApp() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('appSection').style.display = 'none';
        document.getElementById('navigation').style.display = 'none';
    }

    showSection(section) {
        const sections = ['today', 'history', 'profile'];
        const buttons = ['todayBtn', 'historyBtn', 'profileBtn'];

        sections.forEach(s => {
            document.getElementById(`${s}Section`).style.display = s === section ? 'block' : 'none';
        });

        buttons.forEach(b => {
            document.getElementById(b).classList.toggle('active', b === `${section}Btn`);
        });

        if (section === 'today') {
            this.loadTodayHoroscope();
        } else if (section === 'history') {
            this.loadHistory();
        } else if (section === 'profile') {
            this.loadProfile();
        }
    }

    async loadTodayHoroscope() {
        try {
            const response = await this.apiCall('/horoscope/today', 'GET');
            if (response.success) {
                const horoscope = response.data.horoscope;
                this.displayZodiacInfo(horoscope.zodiacInfo, horoscope.zodiacSign);
                document.getElementById('todayHoroscope').innerHTML = `
                    <p>${horoscope.content}</p>
                    <small style="display: block; margin-top: 1rem; opacity: 0.7;">
                        ${new Date(horoscope.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </small>
                `;
            } else {
                this.showError('Failed to load today\'s horoscope');
            }
        } catch (error) {
            this.showError('Failed to load today\'s horoscope');
        }
    }

    async loadHistory() {
        try {
            document.getElementById('historyHoroscopes').innerHTML = '<div class="loading">Loading your history...</div>';
            
            const response = await this.apiCall('/horoscope/history', 'GET');
            if (response.success) {
                const horoscopes = response.data.horoscopes;
                let historyHTML = '';
                
                horoscopes.forEach(horoscope => {
                    const date = new Date(horoscope.date);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    historyHTML += `
                        <div class="history-item">
                            <div class="history-date">${formattedDate}</div>
                            <div class="history-text">${horoscope.content}</div>
                        </div>
                    `;
                });
                
                document.getElementById('historyHoroscopes').innerHTML = historyHTML;
            } else {
                this.showError('Failed to load horoscope history');
            }
        } catch (error) {
            this.showError('Failed to load horoscope history');
        }
    }

    loadProfile() {
        if (this.user) {
            const birthDate = new Date(this.user.birthdate);
            const formattedBirthdate = birthDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            document.getElementById('profileContent').innerHTML = `
                <div class="profile-info">
                    <div class="profile-field">
                        <span class="profile-label">Name:</span>
                        <span class="profile-value">${this.user.name}</span>
                    </div>
                    <div class="profile-field">
                        <span class="profile-label">Email:</span>
                        <span class="profile-value">${this.user.email}</span>
                    </div>
                    <div class="profile-field">
                        <span class="profile-label">Birth Date:</span>
                        <span class="profile-value">${formattedBirthdate}</span>
                    </div>
                    <div class="profile-field">
                        <span class="profile-label">Zodiac Sign:</span>
                        <span class="profile-value">${this.user.zodiacSign.toUpperCase()}</span>
                    </div>
                </div>
            `;
        }
    }

    displayZodiacInfo(zodiacInfo, zodiacSign) {
        if (zodiacInfo) {
            document.getElementById('zodiacInfo').innerHTML = `
                <div class="zodiac-symbol">${zodiacInfo.symbol}</div>
                <div class="zodiac-details">
                    <h3>${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)}</h3>
                    <p>${zodiacInfo.element} • ${zodiacInfo.planet}</p>
                    <p>${zodiacInfo.dates}</p>
                </div>
            `;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.hideApp();
        this.showSuccess('Logged out successfully');
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        this.switchTab('login');
    }

    getEndpointUrl(endpoint) {
        if (this.isNetlify) {
            // Map API endpoints to Netlify function names
            const endpointMap = {
                '/auth/signup': '/auth-signup',
                '/auth/login': '/auth-login',
                '/auth/profile': '/auth-profile',
                '/horoscope/today': '/horoscope-today',
                '/horoscope/history': '/horoscope-history'
            };
            return `${this.baseURL}${endpointMap[endpoint] || endpoint}`;
        }
        return `${this.baseURL}${endpoint}`;
    }

    async apiCall(endpoint, method, data = null) {
        const url = this.getEndpointUrl(endpoint);
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment.');
            }
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Request failed with status ${response.status}`);
            }
            
            return result;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 300);
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        successDiv.classList.add('show');
        
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 300);
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AstroGuruApp();
});
