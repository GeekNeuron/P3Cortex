document.addEventListener('DOMContentLoaded', () => {

    const toPersianDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, d => persianDigits[d]);
};

    // --- DOM Elements ---
    const headerElement = document.querySelector('header');
    const TOTAL_SECTIONS = 20;
    const main = document.querySelector('main');
    const helpModal = document.getElementById('help-modal');
    const showHelpModalBtn = document.getElementById('show-help-modal-btn');
    const closeHelpModalBtn = helpModal.querySelector('.close-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmFinishBtn = document.getElementById('confirm-finish-btn');
    const cancelFinishBtn = document.getElementById('cancel-finish-btn');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
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
    let allSections = [];
    let savedQuestions = JSON.parse(localStorage.getItem('savedQuestions')) || [];
    let quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    let currentQuiz = { questions: [], userAnswers: {}, currentQuestionIndex: 0, timerInterval: null, timeRemaining: 0 };
    let historyItemToDelete = null;

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
        // ساخت اتوماتیک لیست فایل‌ها بر اساس متغیر
        const sectionFiles = [];
        for (let i = 1; i <= TOTAL_SECTIONS; i++) {
            sectionFiles.push(`section${i}.json`);
        }
        
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

    if (sectionId === 'practice') {
        createTabs(practiceTabsContainer, TOTAL_SECTIONS, 'practice');
        renderShowQuestionsButton();
    } else if (sectionId === 'quiz') {
        createTabs(quizTabsContainer, TOTAL_SECTIONS, 'quiz');
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

    const createTabs = (container, standardTabCount, type) => {
    container.innerHTML = ''; // پاک کردن محتوای قبلی

    // ساخت دکمه اصلی منو
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'dropdown-toggle';
    toggleBtn.textContent = 'انتخاب بخش';
    
    // ساخت لیست کشویی
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';

    const createTabItem = (text, index) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.tabIndex = index;
        btn.textContent = text;
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // جلوگیری از بسته شدن منو
            toggleBtn.textContent = text; // آپدیت متن دکمه اصلی
            handleTabClick(btn, type);
            dropdownMenu.classList.remove('show');
        });
        return btn;
    };

    // افزودن تب‌های استاندارد به لیست
    for (let i = 1; i <= standardTabCount; i++) {
        const text = (type === 'quiz') ? `آزمون ${toPersianDigits(i)}` : `بخش ${toPersianDigits(i)}`;
        dropdownMenu.appendChild(createTabItem(text, i));
    }

    // افزودن تب‌های ویژه برای بخش آزمون
    if (type === 'quiz') {
        const specialTabsData = [
            { name: 'آزمون نشان‌نشده‌ها', index: standardTabCount + 1 },
            { name: 'آزمون نشان‌شده‌ها', index: standardTabCount + 2 },
            { name: 'آزمون جامع (همه سوالات)', index: standardTabCount + 3 }
        ];
        specialTabsData.forEach(tabData => {
            dropdownMenu.appendChild(createTabItem(tabData.name, tabData.index));
        });
    }

    container.appendChild(toggleBtn);
    container.appendChild(dropdownMenu);
};

    // این تابع را به فایل js/app.js خود اضافه کنید
const renderShowQuestionsButton = () => {
    practiceQuestionsContainer.innerHTML = ''; 

    const setupContainer = document.getElementById('practice-setup');
    const oldBtn = setupContainer.querySelector('.show-questions-btn');
    if (oldBtn) oldBtn.remove();

    const showBtn = document.createElement('button');
    showBtn.className = 'show-questions-btn';
    showBtn.textContent = 'نمایش نمونه سوالات';
    
    showBtn.addEventListener('click', (e) => {
        let activeTab = practiceTabsContainer.querySelector('.tab-btn.active');
        if (!activeTab) {
            activeTab = practiceTabsContainer.querySelector('.tab-btn');
            if(activeTab) activeTab.classList.add('active');
            else { return; }
        }
        const sectionIndex = parseInt(activeTab.dataset.tabIndex) - 1;
        renderPracticeQuestions(allSections[sectionIndex], sectionIndex);
        e.target.style.display = 'none'; 
    });
    setupContainer.appendChild(showBtn);
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
        <p class="empty-message">
                هنوز سوالی برای مرور نشان نکرده‌اید.<br>
                از بخش <b>نمونه سوالات</b>، روی آیکون 
                <img src="images/bookmark-add.svg" alt="نشان" style="width:18px; height:18px; vertical-align:middle; filter:invert(0.5);">
                زیر هر سوال کلیک کنید تا به این بخش اضافه شود.
            </p>`;
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
    let quizName = activeTab.textContent;

    if (tabIndex <= allSections.length) { // آزمون‌های استاندارد
        questionsForQuiz = allSections[tabIndex - 1] || [];
        quizName = `آزمون بخش ${toPersianDigits(tabIndex)}`;
    } else if (tabIndex === allSections.length + 1) { // آزمون نشان‌نشده‌ها
        questionsForQuiz = [];
        allSections.forEach((section, sectionIndex) => {
            section.forEach(question => {
                const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === question.id);
                if (!isSaved) questionsForQuiz.push(question);
            });
        });
        quizName = 'آزمون نشان‌نشده‌ها';
        duration = 60 * 60;
    } else if (tabIndex === allSections.length + 2) { // ✅ آزمون نشان‌شده‌ها (گزینه جدید)
        questionsForQuiz = [];
        savedQuestions.forEach(savedItem => {
            const question = allSections[savedItem.sectionIndex]?.find(q => q.id === savedItem.questionId);
            if (question) questionsForQuiz.push(question);
        });
        quizName = 'آزمون نشان‌شده‌ها';
    } else if (tabIndex === allSections.length + 3) { // آزمون جامع
        questionsForQuiz = allSections.flat();
        quizName = 'آزمون جامع (همه سوالات)';
        duration = 60 * 60;
    }

    if (questionsForQuiz.length === 0) { alert('سوالی برای این آزمون وجود ندارد.'); return; }
    
    currentQuiz = { questions: questionsForQuiz, userAnswers: {}, currentQuestionIndex: 0, timeRemaining: duration, name: quizName };
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
        
    quizQuestionsContainer.appendChild(createQuestionCard(question, 'quiz', -1));
    
    questionCounterElement.textContent = `سوال ${toPersianDigits(currentQuiz.currentQuestionIndex + 1)} از ${toPersianDigits(currentQuiz.questions.length)}`;

    prevQuestionBtn.disabled = (currentQuiz.currentQuestionIndex === 0);
    nextQuestionBtn.disabled = (currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1);
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
    
    let correct = 0;
    let incorrect = 0;

    currentQuiz.questions.forEach(q => {
        const userAnswer = currentQuiz.userAnswers[q.id];
        if (userAnswer !== undefined) {
            if (userAnswer === q.answer) {
                correct++;
            } else {
                incorrect++;
            }
        }
    });

    const total = currentQuiz.questions.length;
    const unanswered = total - correct - incorrect;

    if (total > 0) {
        saveQuizHistory(correct, total, currentQuiz.name);
    }
    
    showResults(correct, incorrect, unanswered, total);
};

    // --- History Logic ---
const saveQuizHistory = (correct, total, quizName) => {
    const now = new Date();
    const newHistoryEntry = {
        date: now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        day: now.toLocaleDateString('fa-IR', { weekday: 'long' }),
        score: `${correct}/${total}`,
        quizName: quizName,
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
    quizHistory.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';

        const [correct, total] = item.score.split('/').map(Number);
        const incorrect = total - correct;
        
        // تعیین وضعیت قبولی یا مردودی
        const statusClass = incorrect <= 4 ? 'status-pass' : 'status-fail';
        const statusText = incorrect <= 4 ? 'قبول' : 'مردود';

        historyDiv.innerHTML = `
            <button class="delete-history-btn" data-timestamp="${item.timestamp}" title="حذف این سابقه">
                <img src="images/trash-icon.svg" alt="حذف">
            </button>
            <div class="history-details">
                <span class="history-quiz-name">${item.quizName || 'آزمون'}</span>
                <span class="history-date-time">${item.day}، ${item.date}</span>
            </div>
            <div class="history-result">
                <span class="history-status ${statusClass}">${statusText}</span>
                <div class="score">${toPersianDigits(item.score)}</div>
            </div>
        `;
        quizHistoryList.appendChild(historyDiv);
    });
};

const deleteHistoryItem = (timestamp) => {
    quizHistory = quizHistory.filter(item => item.timestamp !== timestamp);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    renderQuizHistory();
};

// این کد را به تابع setupEventListeners اضافه کنید
quizHistoryList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-history-btn');
    if (deleteBtn) {
        historyItemToDelete = Number(deleteBtn.dataset.timestamp);
        deleteConfirmModal.classList.remove('hidden');
    }
});
    
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
const showResults = (correct, incorrect, unanswered, total) => {
    const resultsChartContainer = document.getElementById('chart-container');
    const resultMessageEl = document.getElementById('result-message');
    resultsChartContainer.innerHTML = '';
    quizLiveSection.classList.add('hidden');
    quizSetupSection.classList.remove('hidden');

    if (total === 0) return;

    // --- منطق نمایش پیام قبولی یا مردودی ---
    if ((incorrect + unanswered) <= 4) {
        resultMessageEl.textContent = 'تبریک! شما در آزمون قبول شدید. با این تعداد اشتباه، آمادگی لازم برای آزمون اصلی را دارید.';
        resultMessageEl.className = 'pass';
    } else {
        resultMessageEl.textContent = 'متاسفانه تعداد اشتباهات شما بیش از حد مجاز بود. برای آمادگی بیشتر، نقاط ضعف خود را در بخش «مرور» مطالعه کنید.';
        resultMessageEl.className = 'fail';
    }

    resultSummaryElement.textContent = `شما به ${toPersianDigits(correct)} سوال پاسخ صحیح، به ${toPersianDigits(incorrect)} سوال پاسخ غلط و ${toPersianDigits(unanswered)} سوال را بدون پاسخ گذاشته‌اید.`;

    // --- تنظیمات نمودار ستونی جدید ---
    const options = {
        series: [{
            name: 'تعداد',
            data: [correct, incorrect, unanswered]
        }],
        chart: {
            type: 'bar', // تغییر نوع نمودار به ستونی
            height: 250,
            toolbar: { show: false },
            fontFamily: 'Vazirmatn, sans-serif'
        },
        plotOptions: {
            bar: {
                distributed: true, // هر ستون رنگ متفاوتی می‌گیرد
                borderRadius: 4,
                horizontal: false,
            }
        },
        colors: ['#28a745', '#dc3545', '#6c757d'], // سبز برای صحیح، قرمز برای غلط، خاکستری برای بی‌ پاسخ
        dataLabels: {
            enabled: true,
            formatter: (val) => toPersianDigits(val),
        },
        legend: {
            show: false
        },
        xaxis: {
            categories: ['پاسخ صحیح', 'پاسخ غلط', 'بدون پاسخ'],
            labels: {
                style: {
                    colors: document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#212529',
                }
            }
        },
        yaxis: {
            labels: {
                show: false
            }
        }
    };

    const chart = new ApexCharts(resultsChartContainer, options);
    chart.render();
    resultsModal.classList.remove('hidden');
};

const createQuestionCard = (q, type, sectionIndex) => {
    const card = document.createElement('div');
    card.className = 'question-card fade-in';

    const sectionInfoHtml = (type === 'saved') 
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
    
    // ساخت HTML دکمه ستاره
    let starButtonHtml = '';
    if (type === 'practice' || type === 'saved') {
        const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === q.id);
        const starIconSrc = isSaved ? 'images/bookmark_added.svg' : 'images/bookmark_add.svg';
        starButtonHtml = `<button class="save-star"><img src="${starIconSrc}" alt="ذخیره"></button>`;
    }
    
    // ساخت فوتر کارت فقط در صورت وجود دکمه ستاره
    const footerHtml = starButtonHtml ? `<div class="card-footer">${starButtonHtml}</div>` : '';

    card.innerHTML = `
        <div class="question-content">
            ${sectionInfoHtml}
            ${imageHtml}
            <p class="question-text">
                <span>${toPersianDigits(q.id)}. ${q.question}</span>
            </p>
            <ul class="${optionsListClass}">${optionsHtml}</ul>
        </div>
        ${footerHtml}
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
    // رویداد تغییر تم
    headerElement.addEventListener('click', toggleTheme);

    // رویداد دکمه‌های منوی اصلی
    mainNavButtons.forEach(btn => {
        btn.addEventListener('click', () => showSection(btn.dataset.section));
    });

    // رویداد دکمه‌های شروع و حین آزمون
    startQuizBtn.addEventListener('click', startQuiz);
    prevQuestionBtn.addEventListener('click', () => navigateQuiz(-1));
    nextQuestionBtn.addEventListener('click', () => navigateQuiz(1));
    
    // --- رویدادهای مودال‌ها ---
    finishQuizBtn.addEventListener('click', () => confirmModal.classList.remove('hidden'));
    confirmFinishBtn.addEventListener('click', () => { confirmModal.classList.add('hidden'); endQuiz(); });
    cancelFinishBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));
    resultsModal.querySelector('.close-modal').addEventListener('click', () => resultsModal.classList.add('hidden'));
    resultsModal.addEventListener('click', (e) => { if(e.target === resultsModal) resultsModal.classList.add('hidden'); });
    showHelpModalBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
    helpModal.querySelector('.close-modal').addEventListener('click', () => helpModal.classList.add('hidden'));
    helpModal.addEventListener('click', (e) => { if(e.target === helpModal) helpModal.classList.add('hidden'); });
    quizHistoryList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-history-btn');
        if (deleteBtn) {
            historyItemToDelete = Number(deleteBtn.dataset.timestamp);
            deleteConfirmModal.classList.remove('hidden');
        }
    });
    confirmDeleteBtn.addEventListener('click', () => {
        if (historyItemToDelete !== null) deleteHistoryItem(historyItemToDelete);
        historyItemToDelete = null;
        deleteConfirmModal.classList.add('hidden');
    });
    cancelDeleteBtn.addEventListener('click', () => {
        historyItemToDelete = null;
        deleteConfirmModal.classList.add('hidden');
    });

    // --- رویداد کلی صفحه برای منوهای کشویی و چیدمان ---
    document.addEventListener('click', (e) => {
        const layoutToggleBtn = e.target.closest('.layout-toggle-btn');
        const layoutOptionBtn = e.target.closest('.layout-options button');
        const dropdownToggle = e.target.closest('.dropdown-toggle');

        // منطق منوی کشویی بخش‌ها
        if (dropdownToggle) {
            const menu = dropdownToggle.nextElementSibling;
            // بستن بقیه منوها
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            menu.classList.toggle('show');
        } else if (!e.target.closest('.dropdown-container')) {
            // بستن منو با کلیک در جای دیگر
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
        }

        // منطق منوی چیدمان
        if (layoutToggleBtn) {
            layoutToggleBtn.closest('.layout-switcher').classList.toggle('switcher-expanded');
        }
        if (layoutOptionBtn) {
            const layout = layoutOptionBtn.dataset.layout;
            const questionsContainer = layoutOptionBtn.closest('.content-section').querySelector('.questions-list');
            if (questionsContainer) {
                questionsContainer.className = 'questions-list';
                questionsContainer.classList.add(`grid-${layout}`);
                layoutOptionBtn.closest('.layout-options').querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                layoutOptionBtn.classList.add('active');
            }
        }
    });
};
    
    // --- Run Application ---
    init();
});
