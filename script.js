// ===============================
// PERFORMANCE OPTIMIZATIONS & UTILITIES
// ===============================

// Request Animation Frame polyfill for better performance
window.requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    function(callback) { return setTimeout(callback, 16); };

// Debounce function for performance optimization
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for scroll events
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Cache DOM elements for better performance
const DOMCache = {
    loadingScreen: null,
    loadingProgress: null,
    loadingText: null,
    hamburger: null,
    navMenu: null,
    navLinks: null,
    navbar: null,
    tabButtons: null,
    tabPanes: null,
    materiModal: null,
    materiModalBody: null,
    quizModal: null,
    quizBody: null,
    
    init() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.querySelector('.loading-progress');
        this.loadingText = document.querySelector('.loading-text');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navbar = document.querySelector('.navbar');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        this.materiModal = document.getElementById('materi-modal');
        this.materiModalBody = document.getElementById('modal-body');
        this.quizModal = document.getElementById('quiz-modal');
        this.quizBody = document.getElementById('quiz-body');
    }
};

// ===============================
// OPTIMIZED LOADING SCREEN
// ===============================
function initLoadingScreen() {
    if (!DOMCache.loadingScreen) return;
    
    let progress = 0;
    const texts = ['Memuat...', 'Menyiapkan materi...', 'Hampir selesai...', 'Selamat datang!'];
    let currentTextIndex = 0;
    
    const updateProgress = () => {
        progress += Math.random() * 25 + 5; // More consistent progress increment
        
        if (progress >= 100) {
            progress = 100;
            // Use RAF for smoother animation
            requestAnimationFrame(() => {
                if (DOMCache.loadingProgress) {
                    DOMCache.loadingProgress.style.width = '100%';
                }
                
                setTimeout(() => {
                    if (DOMCache.loadingScreen) {
                        DOMCache.loadingScreen.style.opacity = '0';
                        setTimeout(() => {
                            DOMCache.loadingScreen.style.display = 'none';
                            document.body.classList.add('loaded');
                        }, 300);
                    }
                }, 200);
            });
            return;
        }
        
        // Update progress bar using RAF
        requestAnimationFrame(() => {
            if (DOMCache.loadingProgress) {
                DOMCache.loadingProgress.style.width = progress + '%';
            }
        });
        
        // Update text less frequently
        const newTextIndex = Math.min(Math.floor((progress / 100) * texts.length), texts.length - 1);
        if (newTextIndex !== currentTextIndex && DOMCache.loadingText) {
            currentTextIndex = newTextIndex;
            DOMCache.loadingText.textContent = texts[currentTextIndex];
        }
        
        setTimeout(updateProgress, 150 + Math.random() * 100);
    };
    
    updateProgress();
}

// ===============================
// OPTIMIZED NAVIGATION
// ===============================
function initNavigation() {
    if (!DOMCache.hamburger || !DOMCache.navMenu || !DOMCache.navLinks) return;
    
    // Toggle mobile menu with event delegation
    DOMCache.hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOMCache.hamburger.classList.toggle('active');
        DOMCache.navMenu.classList.toggle('active');
    }, { passive: false });
    
    // Close mobile menu when clicking nav links
    DOMCache.navMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            DOMCache.hamburger.classList.remove('active');
            DOMCache.navMenu.classList.remove('active');
            
            // Smooth scrolling
            e.preventDefault();
            const targetId = e.target.getAttribute('href')?.substring(1);
            if (targetId) {
                scrollToSection(targetId);
            }
        }
    });
    
    // Optimized navbar scroll effect with throttling
    const updateNavbarBackground = throttle(() => {
        if (!DOMCache.navbar) return;
        
        const scrolled = window.pageYOffset > 100;
        const newBackground = scrolled ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.95)';
        
        if (DOMCache.navbar.style.background !== newBackground) {
            DOMCache.navbar.style.background = newBackground;
        }
    }, 16); // ~60fps
    
    window.addEventListener('scroll', updateNavbarBackground, { passive: true });
}

// Optimized smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const start = window.pageYOffset;
        const target = section.getBoundingClientRect().top + start - 70; // Account for navbar
        const distance = target - start;
        const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
        
        let startTime = null;
        
        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smoother animation
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, start + (distance * easeInOutCubic));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
}

// ===============================
// OPTIMIZED TABS FUNCTIONALITY
// ===============================
function initTabs() {
    if (!DOMCache.tabButtons || !DOMCache.tabPanes) return;
    
    // Use event delegation for better performance
    const tabContainer = document.querySelector('.materi-tabs');
    if (tabContainer) {
        tabContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const targetTab = e.target.getAttribute('data-tab');
                if (targetTab) {
                    switchTab(targetTab, e.target);
                }
            }
        });
    }
}

function switchTab(targetTab, clickedButton) {
    // Batch DOM updates to avoid reflow
    requestAnimationFrame(() => {
        // Remove active classes
        DOMCache.tabButtons.forEach(btn => btn.classList.remove('active'));
        DOMCache.tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active classes
        clickedButton.classList.add('active');
        const targetPane = document.getElementById(targetTab);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    });
}

// ===============================
// OPTIMIZED MODAL FUNCTIONALITY
// ===============================
const materiContent = {
    'tenses': {
        title: 'Tenses - 12 Bentuk Waktu dalam Bahasa Inggris',
        content: `
            <h3>Pengertian Tenses</h3>
            <p>Tenses adalah bentuk kata kerja yang menunjukkan waktu terjadinya suatu peristiwa atau keadaan.</p>
            
            <div style="margin: 20px 0;">
                <h4>1. Simple Present Tense</h4>
                <p><strong>Formula:</strong> S + V1 + O</p>
                <p><strong>Contoh:</strong> I study English every day.</p>
                
                <h4>2. Present Continuous Tense</h4>
                <p><strong>Formula:</strong> S + am/is/are + V-ing + O</p>
                <p><strong>Contoh:</strong> I am studying English now.</p>
                
                <h4>3. Present Perfect Tense</h4>
                <p><strong>Formula:</strong> S + have/has + V3 + O</p>
                <p><strong>Contoh:</strong> I have studied English for 2 years.</p>
                
                <h4>4. Present Perfect Continuous</h4>
                <p><strong>Formula:</strong> S + have/has + been + V-ing + O</p>
                <p><strong>Contoh:</strong> I have been studying English since morning.</p>
            </div>
            
            <div style="background: rgba(96, 165, 250, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4>Tips Belajar Tenses:</h4>
                <ul style="margin-left: 20px;">
                    <li>Pelajari satu tense dalam satu waktu</li>
                    <li>Praktikkan dengan membuat kalimat sendiri</li>
                    <li>Fokus pada signal words (kata keterangan waktu)</li>
                    <li>Latihan soal secara rutin</li>
                </ul>
            </div>
        `
    },
    'parts-of-speech': {
        title: 'Parts of Speech - Jenis Kata dalam Bahasa Inggris',
        content: `
            <h3>8 Jenis Kata dalam Bahasa Inggris</h3>
            
            <div style="margin: 20px 0;">
                <h4>1. Noun (Kata Benda)</h4>
                <p>Kata yang menyatakan nama orang, tempat, benda, atau ide.</p>
                <p><strong>Contoh:</strong> book, teacher, Jakarta, happiness</p>
                
                <h4>2. Pronoun (Kata Ganti)</h4>
                <p>Kata yang menggantikan noun untuk menghindari pengulangan.</p>
                <p><strong>Contoh:</strong> I, you, he, she, it, we, they</p>
                
                <h4>3. Verb (Kata Kerja)</h4>
                <p>Kata yang menyatakan tindakan atau keadaan.</p>
                <p><strong>Contoh:</strong> run, eat, is, have, become</p>
                
                <h4>4. Adjective (Kata Sifat)</h4>
                <p>Kata yang menjelaskan atau menerangkan noun.</p>
                <p><strong>Contoh:</strong> beautiful, big, smart, red</p>
                
                <h4>5. Adverb (Kata Keterangan)</h4>
                <p>Kata yang menjelaskan verb, adjective, atau adverb lain.</p>
                <p><strong>Contoh:</strong> quickly, very, well, yesterday</p>
            </div>
        `
    },
    'conjunctions': {
        title: 'Conjunctions - Kata Hubung',
        content: `
            <h3>Jenis-jenis Conjunction</h3>
            
            <div style="margin: 20px 0;">
                <h4>1. Coordinating Conjunctions</h4>
                <p>Menghubungkan kata, frasa, atau klausa yang setara.</p>
                <p><strong>FANBOYS:</strong> for, and, nor, but, or, yet, so</p>
                <p><strong>Contoh:</strong> I like tea and coffee.</p>
                
                <h4>2. Subordinating Conjunctions</h4>
                <p>Menghubungkan klausa utama dengan klausa bawahan.</p>
                <p><strong>Contoh:</strong> because, although, when, if, since</p>
                <p><strong>Contoh:</strong> I study hard because I want to pass the exam.</p>
                
                <h4>3. Correlative Conjunctions</h4>
                <p>Kata hubung yang berpasangan.</p>
                <p><strong>Contoh:</strong> both...and, either...or, neither...nor</p>
                <p><strong>Contoh:</strong> Both John and Mary are coming.</p>
            </div>
        `
    },
    'conditional': {
        title: 'Conditional Sentences - Kalimat Pengandaian',
        content: `
            <h3>3 Tipe Conditional Sentences</h3>
            
            <div style="margin: 20px 0;">
                <h4>Type 1 - Real Condition (Kemungkinan Nyata)</h4>
                <p><strong>Formula:</strong> If + Simple Present, Simple Future</p>
                <p><strong>Contoh:</strong> If it rains, I will stay at home.</p>
                
                <h4>Type 2 - Unreal Condition (Tidak Nyata di Masa Sekarang)</h4>
                <p><strong>Formula:</strong> If + Simple Past, would + V1</p>
                <p><strong>Contoh:</strong> If I were rich, I would travel the world.</p>
                
                <h4>Type 3 - Unreal Condition (Tidak Nyata di Masa Lalu)</h4>
                <p><strong>Formula:</strong> If + Past Perfect, would have + V3</p>
                <p><strong>Contoh:</strong> If I had studied harder, I would have passed the exam.</p>
            </div>
            
            <div style="background: rgba(96, 165, 250, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4>Catatan Penting:</h4>
                <p>Conditional sentences sangat berguna untuk mengekspresikan situasi hipotetis, memberikan saran, dan membicarakan kemungkinan.</p>
            </div>
        `
    },
    'daily-vocab': {
        title: 'Daily Vocabulary - Kosakata Sehari-hari',
        content: `
            <h3>Kosakata yang Sering Digunakan</h3>
            
            <div style="margin: 20px 0;">
                <h4>Family Members (Anggota Keluarga)</h4>
                <p>Father, Mother, Brother, Sister, Uncle, Aunt, Cousin, Grandmother, Grandfather</p>
                
                <h4>Daily Activities (Kegiatan Sehari-hari)</h4>
                <p>Wake up, Take a shower, Have breakfast, Go to work, Have lunch, Go home, Have dinner, Go to bed</p>
                
                <h4>Food & Drinks (Makanan & Minuman)</h4>
                <p>Rice, Bread, Milk, Water, Coffee, Tea, Apple, Banana, Chicken, Fish</p>
                
                <h4>Common Verbs (Kata Kerja Umum)</h4>
                <p>Go, Come, Take, Give, Make, Do, See, Look, Listen, Speak, Read, Write</p>
            </div>
            
            <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4>Tips Menghafal Vocabulary:</h4>
                <ul style="margin-left: 20px;">
                    <li>Gunakan flashcards untuk mengulang</li>
                    <li>Buat kalimat dengan kata baru</li>
                    <li>Praktikkan dalam percakapan sehari-hari</li>
                    <li>Kelompokkan kata berdasarkan tema</li>
                </ul>
            </div>
        `
    }
};

function openMateriModal(materiId) {
    const content = materiContent[materiId];
    if (!content || !DOMCache.materiModal || !DOMCache.materiModalBody) return;
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <h2 style="color: #60a5fa; margin-bottom: 20px;">${content.title}</h2>
        ${content.content}
    `;
    
    // Clear and append in one operation
    DOMCache.materiModalBody.innerHTML = '';
    DOMCache.materiModalBody.appendChild(wrapper);
    
    // Show modal with RAF for smooth animation
    requestAnimationFrame(() => {
        DOMCache.materiModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const closeBtn = DOMCache.materiModal.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    });
}

function closeMateriModal() {
    if (!DOMCache.materiModal) return;
    
    requestAnimationFrame(() => {
        DOMCache.materiModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// ===============================
// OPTIMIZED QUIZ SYSTEM
// ===============================
const quizData = {
    grammar: {
        title: 'Grammar Quiz',
        questions: [
            {
                question: 'What is the correct form of the verb in: "She _____ to school every day"?',
                options: ['go', 'goes', 'going', 'gone'],
                correct: 1,
                explanation: 'Simple present tense untuk orang ketiga tunggal menggunakan "goes"'
            },
            {
                question: 'Choose the correct sentence:',
                options: [
                    'I am eating breakfast now',
                    'I eating breakfast now',
                    'I eats breakfast now',
                    'I eat breakfast now'
                ],
                correct: 0,
                explanation: 'Present continuous tense menggunakan "am/is/are + V-ing"'
            },
            {
                question: 'Which sentence uses past perfect tense correctly?',
                options: [
                    'I finished my homework before dinner',
                    'I had finished my homework before dinner',
                    'I have finished my homework before dinner',
                    'I was finishing my homework before dinner'
                ],
                correct: 1,
                explanation: 'Past perfect tense menggunakan "had + V3" untuk menunjukkan tindakan yang selesai sebelum tindakan lain di masa lalu'
            },
            {
                question: 'What is the plural form of "child"?',
                options: ['childs', 'childes', 'children', 'child'],
                correct: 2,
                explanation: '"Children" adalah bentuk jamak tidak beraturan dari "child"'
            },
            {
                question: 'Choose the correct comparative form of "good":',
                options: ['gooder', 'more good', 'better', 'best'],
                correct: 2,
                explanation: '"Better" adalah bentuk comparative dari "good"'
            }
        ]
    },
    vocabulary: {
        title: 'Vocabulary Test',
        questions: [
            {
                question: 'What does "gorgeous" mean?',
                options: ['ugly', 'beautiful', 'average', 'strange'],
                correct: 1,
                explanation: '"Gorgeous" berarti sangat cantik atau indah'
            },
            {
                question: 'Which word is a synonym for "happy"?',
                options: ['sad', 'angry', 'joyful', 'tired'],
                correct: 2,
                explanation: '"Joyful" memiliki arti yang sama dengan "happy"'
            },
            {
                question: 'What is the opposite of "expensive"?',
                options: ['cheap', 'costly', 'valuable', 'priceless'],
                correct: 0,
                explanation: '"Cheap" adalah lawan kata dari "expensive"'
            },
            {
                question: 'Which word means "very tired"?',
                options: ['energetic', 'exhausted', 'excited', 'nervous'],
                correct: 1,
                explanation: '"Exhausted" berarti sangat lelah'
            }
        ]
    },
    reading: {
        title: 'Reading Comprehension',
        questions: [
            {
                question: 'Read the text: "Sarah loves reading books. She goes to the library every weekend to borrow new books. Her favorite genre is mystery novels." What does Sarah do every weekend?',
                options: [
                    'She reads at home',
                    'She goes to the library',
                    'She buys books',
                    'She writes stories'
                ],
                correct: 1,
                explanation: 'Teks menyebutkan "She goes to the library every weekend"'
            },
            {
                question: 'Based on the text above, what is Sarah\'s favorite type of book?',
                options: ['Romance novels', 'Mystery novels', 'Science fiction', 'Biography'],
                correct: 1,
                explanation: 'Teks menyebutkan "Her favorite genre is mystery novels"'
            },
            {
                question: 'The word "borrow" in the text means:',
                options: ['to buy', 'to take temporarily', 'to steal', 'to give'],
                correct: 1,
                explanation: '"Borrow" berarti meminjam atau mengambil sementara'
            }
        ]
    },
    listening: {
        title: 'Listening Test',
        questions: [
            {
                question: 'Listen to this conversation: "A: What time is it? B: It\'s quarter past three." What time is it?',
                options: ['3:15', '3:45', '2:15', '4:15'],
                correct: 0,
                explanation: '"Quarter past three" berarti pukul 3:15'
            },
            {
                question: 'In the phrase "half past six", what time is being referred to?',
                options: ['6:30', '6:15', '6:45', '7:30'],
                correct: 0,
                explanation: '"Half past six" berarti pukul 6:30'
            }
        ]
    }
};

// Quiz state management
const QuizState = {
    currentQuiz: null,
    currentQuestion: 0,
    userAnswers: [],
    score: 0,
    
    reset() {
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.score = 0;
    },
    
    init(category) {
        this.reset();
        this.currentQuiz = quizData[category];
        return this.currentQuiz !== null;
    }
};

function startQuiz(category) {
    if (!QuizState.init(category) || !DOMCache.quizModal) return;
    
    showQuestion();
    requestAnimationFrame(() => {
        DOMCache.quizModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

function showQuestion() {
    if (!QuizState.currentQuiz || !DOMCache.quizBody) return;
    
    const question = QuizState.currentQuiz.questions[QuizState.currentQuestion];
    const totalQuestions = QuizState.currentQuiz.questions.length;
    const progress = ((QuizState.currentQuestion + 1) / totalQuestions) * 100;
    
    // Use template literal with minimal DOM manipulation
    const questionHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <h2>${QuizState.currentQuiz.title}</h2>
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${progress}%"></div>
                </div>
                <p>Question ${QuizState.currentQuestion + 1} of ${totalQuestions}</p>
            </div>
            
            <div class="quiz-question">
                ${question.question}
            </div>
            
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option" data-option="${index}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
            
            <div class="quiz-navigation">
                <button class="quiz-btn" id="prev-btn" ${QuizState.currentQuestion === 0 ? 'disabled' : ''}>
                    Previous
                </button>
                <button class="quiz-btn" id="next-btn" disabled>
                    ${QuizState.currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    `;
    
    DOMCache.quizBody.innerHTML = questionHTML;
    
    // Add event listeners using event delegation
    setupQuizEventListeners();
    
    // Restore previous answer if exists
    if (QuizState.userAnswers[QuizState.currentQuestion] !== undefined) {
        const selectedOption = DOMCache.quizBody.querySelector(`[data-option="${QuizState.userAnswers[QuizState.currentQuestion]}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            document.getElementById('next-btn').disabled = false;
        }
    }
}

function setupQuizEventListeners() {
    const optionsContainer = DOMCache.quizBody.querySelector('.quiz-options');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Event delegation for quiz options
    if (optionsContainer) {
        optionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                const optionIndex = parseInt(e.target.getAttribute('data-option'));
                selectAnswer(optionIndex);
            }
        });
    }
    
    // Navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
}

function selectAnswer(optionIndex) {
    const options = DOMCache.quizBody.querySelectorAll('.quiz-option');
    
    // Batch DOM updates
    requestAnimationFrame(() => {
        options.forEach(option => option.classList.remove('selected'));
        options[optionIndex]?.classList.add('selected');
        
        QuizState.userAnswers[QuizState.currentQuestion] = optionIndex;
        document.getElementById('next-btn').disabled = false;
    });
}

function nextQuestion() {
    if (QuizState.currentQuestion < QuizState.currentQuiz.questions.length - 1) {
        QuizState.currentQuestion++;
        showQuestion();
    } else {
        calculateScore();
        showResults();
    }
}

function previousQuestion() {
    if (QuizState.currentQuestion > 0) {
        QuizState.currentQuestion--;
        showQuestion();
    }
}

function calculateScore() {
    QuizState.score = QuizState.currentQuiz.questions.reduce((score, question, index) => {
        return QuizState.userAnswers[index] === question.correct ? score + 1 : score;
    }, 0);
}

function showResults() {
    const totalQuestions = QuizState.currentQuiz.questions.length;
    const percentage = Math.round((QuizState.score / totalQuestions) * 100);
    
    let feedback = '';
    if (percentage >= 80) {
        feedback = 'Excellent! You have a great understanding of the material.';
    } else if (percentage >= 60) {
        feedback = 'Good job! Keep practicing to improve further.';
    } else {
        feedback = 'Keep studying! Review the materials and try again.';
    }
    
    const resultsHTML = `
        <div class="quiz-results">
            <h2>Quiz Results</h2>
            <div class="quiz-score">${percentage}%</div>
            <p>You scored ${QuizState.score} out of ${totalQuestions} questions correctly.</p>
            <div class="quiz-feedback">${feedback}</div>
            
            <div class="quiz-review">
                <h3>Review Your Answers:</h3>
                ${QuizState.currentQuiz.questions.map((question, index) => {
                    const isCorrect = QuizState.userAnswers[index] === question.correct;
                    return `
                        <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                            <p><strong>Q${index + 1}:</strong> ${question.question}</p>
                            <p style="color: ${isCorrect ? '#22c55e' : '#ef4444'};">
                                Your answer: ${question.options[QuizState.userAnswers[index]] || 'Not answered'}
                                ${isCorrect ? ' ✓' : ' ✗'}
                            </p>
                            ${!isCorrect ? `<p style="color: #22c55e;">Correct answer: ${question.options[question.correct]}</p>` : ''}
                            <p style="color: #cbd5e1; font-size: 0.9em;"><em>${question.explanation}</em></p>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button class="quiz-btn" id="close-quiz-btn">Close</button>
                <button class="quiz-btn" id="restart-quiz-btn" style="margin-left: 10px;">Try Again</button>
            </div>
        </div>
    `;
    
    DOMCache.quizBody.innerHTML = resultsHTML;
    
    // Add event listeners for results buttons
    document.getElementById('close-quiz-btn')?.addEventListener('click', closeQuizModal);
    document.getElementById('restart-quiz-btn')?.addEventListener('click', restartQuiz);
}

function restartQuiz() {
    QuizState.currentQuestion = 0;
    QuizState.userAnswers = [];
    QuizState.score = 0;
    showQuestion();
}

function closeQuizModal() {
    if (!DOMCache.quizModal) return;
    
    requestAnimationFrame(() => {
        DOMCache.quizModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// ===============================
// OPTIMIZED SCROLL ANIMATIONS
// ===============================
const AnimationController = {
    observer: null,
    
    init() {
        if (!('IntersectionObserver' in window)) return;
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.observeElements();
    },
    
    observeElements() {
        const elementsToAnimate = document.querySelectorAll('.feature-card, .materi-card, .category-card');
        
        elementsToAnimate.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
            this.observer.observe(el);
        });
    },
    
    animateElement(element) {
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }
};

// ===============================
// OPTIMIZED UTILITY FUNCTIONS
// ===============================

// Scroll to top with optimized animation
function scrollToTop() {
    if (window.scrollY === 0) return;
    
    const start = window.pageYOffset;
    const duration = Math.min(start / 3, 500); // Adaptive duration
    let startTime = null;
    
    const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, start * (1 - easeOutCubic));
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };
    
    requestAnimationFrame(animateScroll);
}

// Optimized scroll to top button
function initScrollTopButton() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateY(10px);
    `;
    
    scrollTopBtn.addEventListener('click', scrollToTop);
    document.body.appendChild(scrollTopBtn);
    
    // Optimized show/hide logic with throttling
    const toggleScrollButton = throttle(() => {
        const shouldShow = window.scrollY > 500;
        const currentlyVisible = scrollTopBtn.style.opacity === '1';
        
        if (shouldShow !== currentlyVisible) {
            requestAnimationFrame(() => {
                scrollTopBtn.style.opacity = shouldShow ? '1' : '0';
                scrollTopBtn.style.visibility = shouldShow ? 'visible' : 'hidden';
                scrollTopBtn.style.transform = shouldShow ? 'translateY(0)' : 'translateY(10px)';
            });
        }
    }, 100);
    
    window.addEventListener('scroll', toggleScrollButton, { passive: true });
}

// ===============================
// OPTIMIZED EVENT HANDLERS
// ===============================

// Global event delegation for modals
function initModalEventDelegation() {
    document.addEventListener('click', (e) => {
        // Handle modal close buttons
        if (e.target.classList.contains('close') || e.target.closest('.close')) {
            closeMateriModal();
            closeQuizModal();
            return;
        }
        
        // Handle modal background clicks
        if (e.target.classList.contains('modal')) {
            if (e.target === DOMCache.materiModal) {
                closeMateriModal();
            } else if (e.target === DOMCache.quizModal) {
                closeQuizModal();
            }
        }
    });
}

// Optimized keyboard shortcuts
function initKeyboardShortcuts() {
    const handleKeydown = (e) => {
        switch (e.key) {
            case 'Escape':
                closeMateriModal();
                closeQuizModal();
                break;
            case 'm':
            case 'M':
                if (window.innerWidth <= 768 && !e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    if (DOMCache.hamburger && DOMCache.navMenu) {
                        DOMCache.hamburger.classList.toggle('active');
                        DOMCache.navMenu.classList.toggle('active');
                    }
                }
                break;
            case 'Home':
                if (e.ctrlKey) {
                    e.preventDefault();
                    scrollToTop();
                }
                break;
        }
    };
    
    document.addEventListener('keydown', handleKeydown);
}

// ===============================
// PERFORMANCE MONITORING
// ===============================
const PerformanceMonitor = {
    startTime: Date.now(),
    
    init() {
        if ('performance' in window) {
            this.logLoadTime();
            this.monitorFPS();
        }
    },
    
    logLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.startTime;
            console.log(`🚀 EduVerse loaded in ${loadTime}ms`);
            
            if ('getEntriesByType' in performance) {
                const navigationEntries = performance.getEntriesByType('navigation');
                if (navigationEntries.length > 0) {
                    const entry = navigationEntries[0];
                    console.log('📊 Performance Metrics:', {
                        'DNS Lookup': `${entry.domainLookupEnd - entry.domainLookupStart}ms`,
                        'TCP Connection': `${entry.connectEnd - entry.connectStart}ms`,
                        'Server Response': `${entry.responseEnd - entry.responseStart}ms`,
                        'DOM Processing': `${entry.domComplete - entry.domLoading}ms`
                    });
                }
            }
        });
    },
    
    monitorFPS() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const checkFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                if (fps < 30) {
                    console.warn(`⚠️ Low FPS detected: ${fps}fps`);
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }
};

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache first
    DOMCache.init();
    
    // Initialize all components
    initLoadingScreen();
    initNavigation();
    initTabs();
    initScrollTopButton();
    initModalEventDelegation();
    initKeyboardShortcuts();
    AnimationController.init();
    PerformanceMonitor.init();
    
    // Mark body as ready for any CSS transitions
    requestAnimationFrame(() => {
        document.body.classList.add('js-ready');
    });
    
    console.log(`
🎓 EduVerse - English Learning Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Website loaded successfully!
📚 Interactive features ready
🚀 Optimized for performance
⚡ Using RAF and throttling
🎯 Event delegation active

Happy Learning! 📖
    `);
});

// ===============================
// ERROR HANDLING & FALLBACKS
// ===============================
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
    });
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Visibility API for performance optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy operations when tab is not visible
        AnimationController.observer?.disconnect();
    } else {
        // Resume operations when tab becomes visible
        AnimationController.init();
    }
});

// ===============================
// GLOBAL FUNCTION EXPORTS
// ===============================
window.scrollToSection = scrollToSection;
window.openMateriModal = openMateriModal;
window.closeMateriModal = closeMateriModal;
window.startQuiz = startQuiz;
window.closeQuizModal = closeQuizModal;
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.scrollToTop = scrollToTop;