document.addEventListener('DOMContentLoaded', () => {

    const toPersianDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, d => persianDigits[d]);
};

    // --- DOM Elements ---
    const headerElement = document.querySelector('header');
    const mainNavButtons = document.querySelectorAll('.main-nav .nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    
    const practiceTabsContainer = document.getElementById('practice-tabs');
    const practiceQuestionsContainer = document.getElementById('practice-questions-container');

    const quizTabsContainer = document.getElementById('quiz-tabs');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizSetupSection = document.getElementById('quiz-setup');
    const quizLiveSection = document.getElementById('quiz-live');
    const quizQuestionsContainer = document.getElementById('quiz-questions-container');
    const timerElement = document.getElementById('timer');
    const questionCounterElement = document.getElementById('question-counter');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const finishQuizBtn = document.getElementById('finish-quiz-btn');

    const savedQuestionsContainer = document.getElementById('saved-questions-container');

    const resultsModal = document.getElementById('results-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const resultsChartCanvas = document.getElementById('results-chart').getContext('2d');
    const resultSummaryElement = document.getElementById('result-summary');
    
    // --- State Management ---
    let allQuestions = [];
    let savedQuestionIds = JSON.parse(localStorage.getItem('savedQuestionIds')) || [];
    let currentQuiz = {
        questions: [],
        userAnswers: {},
        currentQuestionIndex: 0,
        timerInterval: null,
        timeRemaining: 0,
    };
    let resultsChart = null;

    // --- Constants ---
    const QUESTIONS_PER_TAB = 30; // تعداد سوال در هر تب آزمون و نمونه سوال

    // --- Initialization ---
    const init = async () => {
        setupTheme();
        await loadQuestions();
        setupEventListeners();
        
        // Load initial section
        showSection('practice'); 
        createTabs(practiceTabsContainer, 4, 'practice');
        if(practiceTabsContainer.querySelector('.tab-btn')) {
            practiceTabsContainer.querySelector('.tab-btn').click();
        }
    };

    // --- Data Loading ---
    const loadQuestions = async () => {
        try {
            const response = await fetch('data/questions.json');
            if (!response.ok) throw new Error('Network response was not ok');
            allQuestions = await response.json();
        } catch (error) {
            console.error('Failed to load questions:', error);
            practiceQuestionsContainer.innerHTML = '<p class="empty-message">خطا در بارگذاری سوالات. لطفاً صفحه را رفرش کنید.</p>';
        }
    };

    // --- Theme Switcher ---
    const setupTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${savedTheme}-mode`;
    };

    const toggleTheme = () => {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.className = `${newTheme}-mode`;
        localStorage.setItem('theme', newTheme);
    };

    // --- UI & Navigation ---
const showSection = (sectionId) => {
    contentSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}-section`);
    });
    mainNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // تغییر اصلی در این بخش
    if (sectionId === 'practice') {
        createTabs(practiceTabsContainer, 4, 'practice');
        renderShowQuestionsButton(); // نمایش دکمه "نمایش سوالات"
    } else if (sectionId === 'quiz') {
        createTabs(quizTabsContainer, 6, 'quiz');
        quizSetupSection.classList.remove('hidden');
        quizLiveSection.classList.add('hidden');
        clearInterval(currentQuiz.timerInterval);
    } else if (sectionId === 'saved') {
        renderSavedQuestions();
    }
};

const handleTabClick = (clickedBtn, type) => {
    const container = clickedBtn.parentElement;
    if(container.querySelector('.tab-btn.active')) {
         container.querySelector('.tab-btn.active').classList.remove('active');
    }
    clickedBtn.classList.add('active');

    // تغییر: با کلیک روی تب، فقط دکمه نمایش داده می‌شود
    if (type === 'practice') {
        renderShowQuestionsButton();
    }
};

    const createTabs = (container, count, type) => {
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.tabIndex = i;

        if (type === 'quiz') {
            if (i === 5) btn.textContent = 'همه سوالات';
            else if (i === 6) btn.textContent = 'آزمون بدون ستاره‌دارها';
            // اینجا اعداد فارسی می‌شوند
            else btn.textContent = `آزمون ${toPersianDigits(i)}`;
        } else {
            // اینجا اعداد فارسی می‌شوند
             btn.textContent = `بخش ${toPersianDigits(i)}`;
        }
        
        btn.addEventListener('click', () => handleTabClick(btn, type));
        container.appendChild(btn);
    }
    // Activate the first tab by default
    if(container.firstChild) container.firstChild.classList.add('active');
};

    // این تابع را به فایل js/app.js خود اضافه کنید
const renderShowQuestionsButton = () => {
    practiceQuestionsContainer.innerHTML = ''; // پاک کردن محتوای قبلی
    const showBtn = document.createElement('button');
    showBtn.className = 'show-questions-btn';
    showBtn.textContent = 'نمایش نمونه سوالات';
    
    showBtn.addEventListener('click', () => {
        let activeTab = practiceTabsContainer.querySelector('.tab-btn.active');
        
        // اگر هیچ تبی فعال نبود، اولین تب را فعال کن
        if (!activeTab) {
            activeTab = practiceTabsContainer.querySelector('.tab-btn');
            if (activeTab) {
                activeTab.classList.add('active');
            } else {
                practiceQuestionsContainer.innerHTML = '<p class="empty-message">هیچ بخشی برای نمایش وجود ندارد.</p>';
                return;
            }
        }

        const tabIndex = parseInt(activeTab.dataset.tabIndex);
        const start = (tabIndex - 1) * QUESTIONS_PER_TAB;
        const end = start + QUESTIONS_PER_TAB;
        const questions = allQuestions.slice(start, end);
        renderPracticeQuestions(questions);
    });

    practiceQuestionsContainer.appendChild(showBtn);
};
    
    // --- Practice Section Logic ---
    const renderPracticeQuestions = (questions) => {
        practiceQuestionsContainer.innerHTML = '';
        if (questions.length === 0) {
            practiceQuestionsContainer.innerHTML = '<p class="empty-message">سوالی برای نمایش در این بخش وجود ندارد.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        questions.forEach(q => {
             // Do not show saved questions in the practice list
            if (savedQuestionIds.includes(q.id)) return;
            fragment.appendChild(createQuestionCard(q, 'practice'));
        });
        practiceQuestionsContainer.appendChild(fragment);
    };

    // --- Saved Questions Logic ---
    const toggleSaveQuestion = (questionId, starIcon) => {
        const index = savedQuestionIds.indexOf(questionId);
        if (index > -1) {
            savedQuestionIds.splice(index, 1); // Unsave
            starIcon.src = 'images/star-outline.svg';
        } else {
            savedQuestionIds.push(questionId); // Save
            starIcon.src = 'images/star-filled.svg';
        }
        localStorage.setItem('savedQuestionIds', JSON.stringify(savedQuestionIds));

        // Instantly update UI
        const activePracticeTab = practiceTabsContainer.querySelector('.tab-btn.active');
        if (activePracticeTab) activePracticeTab.click(); // Re-render practice questions
        
        // If in saved questions section, re-render it
        if(document.getElementById('saved-section').classList.contains('active')) {
            renderSavedQuestions();
        }
    };
    
    const renderSavedQuestions = () => {
        savedQuestionsContainer.innerHTML = '';
        const savedQuestions = allQuestions.filter(q => savedQuestionIds.includes(q.id));

        if (savedQuestions.length === 0) {
            savedQuestionsContainer.innerHTML = '<p class="empty-message">هنوز سوالی برای مرور نشان نکرده‌اید.<br>از بخش <b>نمونه سوالات</b>، روی آیکون ⭐ کنار هر سوال کلیک کنید تا به این بخش اضافه شود.</p>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        savedQuestions.forEach(q => {
            fragment.appendChild(createQuestionCard(q, 'saved'));
        });
        savedQuestionsContainer.appendChild(fragment);
    };


    // --- Quiz Logic ---
    const startQuiz = () => {
        const activeTab = quizTabsContainer.querySelector('.tab-btn.active');
        if (!activeTab) {
            alert('لطفا ابتدا یک نوع آزمون را انتخاب کنید.');
            return;
        }
        
        const tabIndex = parseInt(activeTab.dataset.tabIndex);
        let duration = 20 * 60; // 20 minutes in seconds
        
        switch (tabIndex) {
            case 1:
            case 2:
            case 3:
            case 4:
                const start = (tabIndex - 1) * QUESTIONS_PER_TAB;
                const end = start + QUESTIONS_PER_TAB;
                currentQuiz.questions = allQuestions.slice(start, end);
                break;
            case 5:
                currentQuiz.questions = [...allQuestions];
                duration = 60 * 60; // 1 hour for all questions
                break;
            case 6:
                currentQuiz.questions = allQuestions.filter(q => !savedQuestionIds.includes(q.id));
                break;
        }

        if (currentQuiz.questions.length === 0) {
             alert('سوالی برای این آزمون وجود ندارد.');
             return;
        }

        currentQuiz.userAnswers = {};
        currentQuiz.currentQuestionIndex = 0;
        currentQuiz.timeRemaining = duration;

        quizSetupSection.classList.add('hidden');
        quizLiveSection.classList.remove('hidden');

        renderQuizQuestion();
        startTimer();
    };

    const startTimer = () => {
        clearInterval(currentQuiz.timerInterval);
        currentQuiz.timerInterval = setInterval(() => {
            currentQuiz.timeRemaining--;
            const minutes = Math.floor(currentQuiz.timeRemaining / 60);
            const seconds = currentQuiz.timeRemaining % 60;
            timerElement.textContent = `زمان باقی‌مانده: ${toPersianDigits(String(minutes).padStart(2, '0'))}:${toPersianDigits(String(seconds).padStart(2, '0'))}`;

            if (currentQuiz.timeRemaining <= 0) {
                endQuiz();
            }
        }, 1000);
    };

    const renderQuizQuestion = () => {
        quizQuestionsContainer.innerHTML = '';
        const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
        quizQuestionsContainer.appendChild(createQuestionCard(question, 'quiz'));
        
        questionCounterElement.textContent = `سوال ${toPersianDigits(currentQuiz.currentQuestionIndex + 1)} از ${toPersianDigits(currentQuiz.questions.length)}`;
        prevQuestionBtn.disabled = currentQuiz.currentQuestionIndex === 0;
        nextQuestionBtn.disabled = currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1;
    };
    
    const navigateQuiz = (direction) => {
        const newIndex = currentQuiz.currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < currentQuiz.questions.length) {
            currentQuiz.currentQuestionIndex = newIndex;
            renderQuizQuestion();
        }
    };
    
    const endQuiz = () => {
        clearInterval(currentQuiz.timerInterval);
        quizLiveSection.classList.add('hidden');
        quizSetupSection.classList.remove('hidden');

        // Calculate score
        let correctAnswers = 0;
        currentQuiz.questions.forEach(q => {
            if (currentQuiz.userAnswers[q.id] === q.answer) {
                correctAnswers++;
            }
        });

        const totalQuestions = currentQuiz.questions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        
        showResults(correctAnswers, incorrectAnswers, totalQuestions);
    };
    
    // --- Results Modal & Chart ---
const showResults = (correct, incorrect, total) => {
    // پاک کردن محتوای قبلی و نمایش خلاصه متنی
    const resultsChartContainer = document.getElementById('chart-container');
    resultsChartContainer.innerHTML = '';
    if (total === 0) return;
    resultSummaryElement.textContent = `شما به ${toPersianDigits(correct)} سوال از ${toPersianDigits(total)} سوال پاسخ صحیح دادید.`;

    // تنظیمات نمودار جدید
    const options = {
        // داده‌های نمودار
        series: [{
            name: 'تعداد',
            data: [correct, incorrect],
        }],
        // مشخصات کلی نمودار
        chart: {
            height: 300,
            type: 'radar',
            toolbar: {
                show: false // حذف منوی ابزار
            },
            fontFamily: 'Vazirmatn, sans-serif' // تنظیم فونت
        },
        // رنگ اصلی نمودار
        colors: ['#007BFF'],
        // استایل نقاط روی نمودار
        markers: {
            size: 5,
            hover: {
                size: 8
            }
        },
        // تنظیمات محور افقی (دسته‌بندی‌ها)
        xaxis: {
            categories: ['پاسخ‌های صحیح', 'پاسخ‌های غلط'],
            labels: {
                style: {
                    colors: [document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#212529'],
                }
            }
        },
        // تنظیمات محور عمودی (مقادیر)
        yaxis: {
            tickAmount: Math.min(total, 5), // تعداد خطوط راهنما
            labels: {
                formatter: function (val) {
                    return toPersianDigits(Math.round(val)); // گرد کردن و فارسی‌سازی اعداد
                },
                style: {
                     colors: [document.body.classList.contains('dark-mode') ? '#a0a0a0' : '#6c757d'],
                }
            }
        },
        // شفافیت سطح رنگی نمودار
        fill: {
            opacity: 0.2
        },
        // ضخامت خط نمودار
        stroke: {
            width: 2
        },
    };

    // ساخت و رندر کردن نمودار جدید
    const chart = new ApexCharts(resultsChartContainer, options);
    chart.render();

    // نمایش مدال نتایج
    resultsModal.classList.remove('hidden');
};

// --- Card Creation (Factory) ---
    const createQuestionCard = (q, type) => {
        const card = document.createElement('div');
        card.className = 'question-card fade-in';
        card.dataset.questionId = q.id;

        let imageHtml = '';
        if (q.image) {
            imageHtml = `<img src="${q.image}" alt="تصویر سوال" class="question-image">`;
        }

        // **تغییر اصلی اینجا شروع می‌شود**
        const isImageOptions = q.optionType === 'image';
        
        const optionsListClass = isImageOptions ? 'options-list image-options-grid' : 'options-list';

        const optionsHtml = q.options.map((option, index) => {
            let classes = 'option';
            if (type === 'practice' || type === 'saved') {
                if (index === q.answer) classes += ' correct';
            } else if (type === 'quiz' && currentQuiz.userAnswers[q.id] === index) {
                classes += ' selected';
            }

            // اگر گزینه‌ها تصویری هستند، تگ img بساز، در غیر این صورت متن را قرار بده
            const optionContent = isImageOptions
                ? `<img src="${option}" alt="گزینه ${index + 1}" class="option-image">`
                : `<span>${option}</span>`;

            return `<li class="${classes}" data-option-index="${index}">${optionContent}</li>`;
        }).join('');
        // **پایان تغییرات اصلی**
        
        const isSaved = savedQuestionIds.includes(q.id);
        const starIconSrc = isSaved ? 'images/star-filled.svg' : 'images/star-outline.svg';
        
        const footerHtml = `
            <div class="card-footer">
                <button class="save-star">
                    <img src="${starIconSrc}" alt="ذخیره سوال">
                </button>
            </div>
        `;

        card.innerHTML = `
            ${imageHtml}
            <div class="question-content">
                <p class="question-text">${toPersianDigits(q.id)}. ${q.question}</p>
                <ul class="${optionsListClass}">${optionsHtml}</ul>
                ${(type === 'practice' || type === 'saved') ? footerHtml : ''}
            </div>
        `;

        // Event Listeners for the card
        if (type === 'quiz') {
            card.querySelectorAll('.option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const selectedIndex = parseInt(opt.dataset.optionIndex);
                    currentQuiz.userAnswers[q.id] = selectedIndex;
                    
                    card.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                });
            });
        }
        
        const starButton = card.querySelector('.save-star');
        if (starButton) {
            starButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSaveQuestion(q.id, starButton.querySelector('img'));
                if(type === 'saved' && !savedQuestionIds.includes(q.id)) {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => card.remove(), 300);
                }
            });
        }

        return card;
    };

    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        headerElement.addEventListener('click', toggleTheme);

        mainNavButtons.forEach(btn => {
            btn.addEventListener('click', () => showSection(btn.dataset.section));
        });

        startQuizBtn.addEventListener('click', startQuiz);
        prevQuestionBtn.addEventListener('click', () => navigateQuiz(-1));
        nextQuestionBtn.addEventListener('click', () => navigateQuiz(1));
        finishQuizBtn.addEventListener('click', () => {
            if (confirm('آیا از پایان آزمون مطمئن هستید؟')) {
                endQuiz();
            }
        });
        
        closeModalBtn.addEventListener('click', () => resultsModal.classList.add('hidden'));
        resultsModal.addEventListener('click', (e) => {
            if(e.target === resultsModal) resultsModal.classList.add('hidden');
        });
    };

    // --- Run Application ---
    init();
});

// تابع ذخیره سوابق آزمون
    const saveQuizHistory = (correct, total) => {
        const now = new Date();
        const newHistoryEntry = {
            date: now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            day: now.toLocaleDateString('fa-IR', { weekday: 'long' }),
            score: `${correct}/${total}`,
            timestamp: now.getTime()
        };
        
        quizHistory.unshift(newHistoryEntry);
        if (quizHistory.length > 20) { // محدود کردن تعداد سوابق
            quizHistory.pop();
        }
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

        renderQuizHistory(); // آپدیت نمایش سوابق
    };

    // تابع نمایش سوابق آزمون
    const renderQuizHistory = () => {
        const quizHistoryList = document.getElementById('quiz-history-list');
        quizHistoryList.innerHTML = '';
        if (quizHistory.length === 0) {
            quizHistoryList.innerHTML = `<p class="empty-message" style="border: none; padding: 1rem 0;">هنوز آزمونی را به پایان نرسانده‌اید.</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        quizHistory.forEach(item => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            historyDiv.innerHTML = `
                <div class="date-time">
                    <span>${item.day}، ${item.date}</span> - <span>ساعت ${item.time}</span>
                </div>
                <div class="score">${toPersianDigits(item.score)}</div>
            `;
            fragment.appendChild(historyDiv);
        });
        quizHistoryList.appendChild(fragment);
    };
