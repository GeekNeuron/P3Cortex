document.addEventListener('DOMContentLoaded', () => {

    const toPersianDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, d => persianDigits[d]);
};

    // --- DOM Elements ---
    const confirmModal = document.getElementById('confirm-modal');
    const confirmFinishBtn = document.getElementById('confirm-finish-btn');
    const cancelFinishBtn = document.getElementById('cancel-finish-btn');
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
    const quizHistoryList = document.getElementById('quiz-history-list');

    const resultsModal = document.getElementById('results-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const resultSummaryElement = document.getElementById('result-summary');
    
    // --- State Management ---
    let allSections = []; // جایگزین allQuestions
    let savedQuestions = JSON.parse(localStorage.getItem('savedQuestions')) || []; // ساختار جدید برای سوالات ذخیره شده
    let quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    let currentQuiz = { questions: [], userAnswers: {}, currentQuestionIndex: 0, timerInterval: null, timeRemaining: 0 };

    // --- Constants ---
    const QUESTIONS_PER_TAB = 30; // تعداد سوال در هر تب آزمون و نمونه سوال

    // --- Initialization ---
    const init = async () => {
    setupTheme();
    await loadQuestions();
    setupEventListeners();
    renderQuizHistory();
    showSection('practice'); // این خط به تنهایی برای شروع کافی است
};

    // --- Data Loading (New Logic) ---
    const loadQuestions = async () => {
    try {
        const sectionFiles = ['section1.json', 'section2.json', 'section3.json', 'section4.json'];
        const promises = sectionFiles.map(file => fetch(`data/${file}`).then(res => res.json()));
        allSections = await Promise.all(promises);
        } catch (error) {
        console.error('Failed to load questions:', error);
        practiceQuestionsContainer.innerHTML = '<p class="empty-message">خطا در بارگذاری سوالات.</p>';
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
    practiceQuestionsContainer.innerHTML = '';
    const showBtn = document.createElement('button');
    showBtn.className = 'show-questions-btn';
    showBtn.textContent = 'نمایش نمونه سوالات';
    showBtn.addEventListener('click', () => {
        let activeTab = practiceTabsContainer.querySelector('.tab-btn.active');
        if (!activeTab) {
            activeTab = practiceTabsContainer.querySelector('.tab-btn');
            if(activeTab) activeTab.classList.add('active');
            else { return; }
        }
        const sectionIndex = parseInt(activeTab.dataset.tabIndex) - 1;
        renderPracticeQuestions(allSections[sectionIndex], sectionIndex);
    });
    practiceQuestionsContainer.appendChild(showBtn);
};

    // --- Saved Questions Logic ---
    const toggleSaveQuestion = (sectionIndex, questionId) => {
    const savedIndex = savedQuestions.findIndex(sq => sq.sectionIndex === sectionIndex && sq.questionId === questionId);
    if (savedIndex > -1) {
        savedQuestions.splice(savedIndex, 1);
    } else {
        savedQuestions.push({ sectionIndex, questionId });
    }
    localStorage.setItem('savedQuestions', JSON.stringify(savedQuestions));

    // آپدیت آنی رابط کاربری
    if (document.getElementById('practice-section').classList.contains('active')) {
        const activeTab = practiceTabsContainer.querySelector('.tab-btn.active');
        if(activeTab) {
            const currentSectionIndex = parseInt(activeTab.dataset.tabIndex) - 1;
            renderPracticeQuestions(allSections[currentSectionIndex], currentSectionIndex);
        }
    }
    if (document.getElementById('saved-section').classList.contains('active')) {
        renderSavedQuestions();
    }
};
    
    const renderSavedQuestions = () => {
    savedQuestionsContainer.innerHTML = '';
    if (savedQuestions.length === 0) {
        savedQuestionsContainer.innerHTML = '<p class="empty-message">هنوز سوالی برای مرور نشان نکرده‌اید.<br>از بخش <b>نمونه سوالات</b>، روی آیکون ⭐ کنار هر سوال کلیک کنید تا به این بخش اضافه شود.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    savedQuestions.forEach(savedItem => {
        const question = allSections[savedItem.sectionIndex]?.find(q => q.id === savedItem.questionId);
        if (question) {
            fragment.appendChild(createQuestionCard(question, 'saved', savedItem.sectionIndex));
        }
    });
    savedQuestionsContainer.appendChild(fragment);
};


    // --- Quiz Logic ---
    const startQuiz = () => {
    let activeTab = quizTabsContainer.querySelector('.tab-btn.active');
    if (!activeTab) { activeTab = quizTabsContainer.querySelector('.tab-btn'); activeTab?.classList.add('active'); }
    if (!activeTab) { alert('لطفا یک نوع آزمون را انتخاب کنید.'); return; }
    
    const tabIndex = parseInt(activeTab.dataset.tabIndex);
    let duration = 20 * 60;
    let questionsForQuiz = [];

    if (tabIndex <= allSections.length) { // آزمون‌های استاندارد ۱ تا ۴
        questionsForQuiz = allSections[tabIndex - 1] || [];
    } else if (tabIndex === allSections.length + 1) { // دکمه همه سوالات
        questionsForQuiz = allSections.flat(); // تمام سوالات در یک آرایه
        duration = 60 * 60;
    } else if (tabIndex === allSections.length + 2) { // آزمون بدون ستاره‌دارها
        questionsForQuiz = [];
        allSections.forEach((section, sectionIndex) => {
            section.forEach(question => {
                const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === question.id);
                if (!isSaved) {
                    questionsForQuiz.push(question);
                }
            });
        });
        duration = 60 * 60;
    }

    if (questionsForQuiz.length === 0) { alert('سوالی برای این آزمون وجود ندارد.'); return; }
    
    currentQuiz = { questions: questionsForQuiz, userAnswers: {}, currentQuestionIndex: 0, timeRemaining: duration };
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

    let correctAnswers = 0;
    currentQuiz.questions.forEach(q => {
        if (currentQuiz.userAnswers[q.id] === q.answer) {
            correctAnswers++;
        }
    });

    const totalQuestions = currentQuiz.questions.length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    
    // فراخوانی برای ذخیره سابقه
    if (totalQuestions > 0) {
        saveQuizHistory(correctAnswers, totalQuestions);
    }
    
    showResults(correctAnswers, incorrectAnswers, totalQuestions);
};

    // --- History Logic ---
const saveQuizHistory = (correct, total) => {
    const now = new Date();
    const newHistoryEntry = {
        date: now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        day: now.toLocaleDateString('fa-IR', { weekday: 'long' }),
        score: `${correct}/${total}`,
        timestamp: now.getTime() // برای قابلیت حذف در آینده
    };
    
    quizHistory.unshift(newHistoryEntry);
    if (quizHistory.length > 20) { quizHistory.pop(); }
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

    renderQuizHistory();
};

const renderQuizHistory = () => {
    if (!quizHistoryList) return;
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

// --- Practice Section Logic (Corrected Version) ---
const renderPracticeQuestions = (sessionQuestions, sectionIndex) => {
    practiceQuestionsContainer.innerHTML = '';
    if (!sessionQuestions || sessionQuestions.length === 0) {
        practiceQuestionsContainer.innerHTML = '<p class="empty-message">سوالی برای نمایش در این بخش وجود ندارد.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    sessionQuestions.forEach(q => {
        // منطق صحیح برای بررسی سوالات ذخیره شده
        const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === q.id);
        if (!isSaved) {
            // ارسال شماره بخش به تابع ساخت کارت
            fragment.appendChild(createQuestionCard(q, 'practice', sectionIndex));
        }
    });
    if (fragment.children.length === 0) {
        practiceQuestionsContainer.innerHTML = '<p class="empty-message">تمام سوالات این بخش را برای مرور انتخاب کرده‌اید.</p>';
    } else {
        practiceQuestionsContainer.appendChild(fragment);
    }
};
    
    // --- Results Modal & Chart ---
const showResults = (correct, incorrect, total) => {
    const resultsChartContainer = document.getElementById('chart-container');
    resultsChartContainer.innerHTML = '';
    if (total === 0) return;
    resultSummaryElement.textContent = `شما به ${toPersianDigits(correct)} سوال از ${toPersianDigits(total)} سوال پاسخ صحیح دادید.`;

    // --- منطق اصلی برای ساخت سری‌های داده ---
    const series = [];

    // سری اول: آزمون فعلی
    series.push({
        name: 'آزمون فعلی',
        data: [correct, incorrect],
    });

    // سری دوم: آزمون قبلی (اگر وجود داشته باشد)
    // quizHistory[0] آزمون فعلی است که همین الان ذخیره شده
    if (quizHistory[1]) {
        const [prevCorrect, prevTotal] = quizHistory[1].score.split('/').map(Number);
        const prevIncorrect = prevTotal - prevCorrect;
        series.push({
            name: 'آزمون قبلی',
            data: [prevCorrect, prevIncorrect],
        });
    }

    // سری سوم: آزمون دو مرحله قبل (اگر وجود داشته باشد)
    if (quizHistory[2]) {
        const [prev2Correct, prev2Total] = quizHistory[2].score.split('/').map(Number);
        const prev2Incorrect = prev2Total - prev2Correct;
        series.push({
            name: 'دو آزمون قبل',
            data: [prev2Correct, prev2Incorrect],
        });
    }
    // --- پایان منطق ساخت سری‌ها ---

    const options = {
        series: series, // استفاده از سری‌های ساخته شده
        chart: {
            height: 350,
            type: 'radar',
            toolbar: { show: false },
            fontFamily: 'Vazirmatn, sans-serif'
        },
        // رنگ‌های متمایز برای هر آزمون
        colors: ['#007BFF', '#28a745', '#ffc107'],
        // خطوط متمایز (ممتد، خط‌چین، نقطه‌چین)
        stroke: {
            width: 2,
            dashArray: [0, 4, 8] 
        },
        fill: {
            opacity: 0.1
        },
        markers: {
            size: 4,
            hover: { size: 7 }
        },
        // فعال کردن راهنمای نمودار (Legend)
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: {
                colors: document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#212529'
            }
        },
        xaxis: {
            categories: ['پاسخ‌های صحیح', 'پاسخ‌های غلط'],
            labels: {
                style: {
                    colors: [document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#212529'],
                }
            }
        },
        yaxis: {
            show: true, // نمایش محور عمودی
            tickAmount: Math.min(total, 4),
            labels: {
                formatter: (val) => toPersianDigits(Math.round(val)),
                style: {
                     colors: [document.body.classList.contains('dark-mode') ? '#a0a0a0' : '#6c757d'],
                }
            }
        },
    };

    const chart = new ApexCharts(resultsChartContainer, options);
    chart.render();
    resultsModal.classList.remove('hidden');
};

const createQuestionCard = (q, type, sectionIndex) => {
    const card = document.createElement('div');
    card.className = 'question-card fade-in';

    const sessionInfoHtml = (type === 'saved') 
        ? `<span class="section-source">از بخش ${toPersianDigits(sectionIndex + 1)}</span>` 
        : '';

    let imageHtml = '';
    if (q.image) {
        const style = q.aspectRatio ? `style="aspect-ratio: ${q.aspectRatio};"` : '';
        imageHtml = `<img src="${q.image}" alt="تصویر سوال" class="question-image" ${style}>`;
    }

    const isImageOptions = q.optionType === 'image';
    const optionsListClass = isImageOptions ? 'options-list image-options-grid' : 'options-list';
    const optionsHtml = q.options.map((option, index) => {
        let classes = 'option';
        if ((type === 'practice' || type === 'saved') && index === q.answer) classes += ' correct';
        else if (type === 'quiz' && currentQuiz.userAnswers[q.id] === index) classes += ' selected';
        const numberHtml = `<div class="option-number">${toPersianDigits(index + 1)}</div>`;
        const optionContent = isImageOptions ? `<img src="${option}" alt="گزینه" class="option-image">` : `<span>${option}</span>`;
        return `<li class="${classes}" data-option-index="${index}">${numberHtml}${optionContent}</li>`;
    }).join('');
    
    let starButtonHtml = '';
    if (type === 'practice' || type === 'saved') {
        const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === q.id);
        const starIconSrc = isSaved ? 'images/star-filled.svg' : 'images/star-outline.svg';
        starButtonHtml = `<button class="save-star"><img src="${starIconSrc}" alt="ذخیره"></button>`;
    }

    card.innerHTML = `
        <div class="question-content">
            ${sessionInfoHtml}
            ${imageHtml}
            <p class="question-text">
                ${starButtonHtml}
                <span>${toPersianDigits(q.id)}. ${q.question}</span>
            </p>
            <ul class="${optionsListClass}">${optionsHtml}</ul>
        </div>
    `;
    
    const starButton = card.querySelector('.save-star');
    if (starButton) {
        starButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSaveQuestion(sectionIndex, q.id);
        });
    }
    
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
        confirmModal.classList.remove('hidden');
        });
        
        closeModalBtn.addEventListener('click', () => resultsModal.classList.add('hidden'));
        resultsModal.addEventListener('click', (e) => {
            if(e.target === resultsModal) resultsModal.classList.add('hidden');
        });
    };

    confirmFinishBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        endQuiz();
    });

    cancelFinishBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });
    
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
