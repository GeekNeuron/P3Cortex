document.addEventListener('DOMContentLoaded', () => {

    const toPersianDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, d => persianDigits[d]);
};

    const FEE_YEAR_START = 1390;
    const FEE_YEAR_END = 1405;

    const DEFAULT_FEES = {
        1390: 350000,
        1391: 250000,
        1392: 450000,
        1394: 500000,
        1400: 2750000,
        1401: 1850000,
        1402: 2900000,
        1403: 6885000,
        1404: 9960000,
        1405: 15920000
    };

    const loadFees = () => {
        try {
            return JSON.parse(localStorage.getItem('registrationFees')) || {};
        } catch {
            return {};
        }
    };

    const saveFees = (fees) => {
        localStorage.setItem('registrationFees', JSON.stringify(fees));
    };

    const renderFeeYears = () => {
        const fees = loadFees();
        feeYearsList.innerHTML = '';
        for (let year = FEE_YEAR_END; year >= FEE_YEAR_START; year--) {
            const hasUserValue = Object.prototype.hasOwnProperty.call(fees, year);
            const isApprox = !hasUserValue && DEFAULT_FEES[year] !== undefined;
            const value = hasUserValue ? fees[year] : (DEFAULT_FEES[year] ?? 0);
            const row = document.createElement('div');
            row.className = 'fee-year-row';
            row.style.setProperty('--i', Math.min(FEE_YEAR_END - year, 8));
            row.innerHTML = `
                <span class="fee-year-label">${toPersianDigits(year)}</span>
                <div class="fee-year-input-wrap">
                    ${isApprox ? '<span class="fee-year-approx-badge">تقریبی</span>' : ''}
                    <input type="number" class="fee-year-input" data-year="${year}" value="${value}" min="0" step="1000" inputmode="numeric">
                    <span class="fee-year-currency">تومان</span>
                </div>
            `;
            feeYearsList.appendChild(row);
        }
    };

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const appLoader = document.getElementById('app-loader');
    const TOTAL_SECTIONS = 20;
    const main = document.querySelector('main');
    const helpModal = document.getElementById('help-modal');
    const showHelpModalBtn = document.getElementById('show-help-modal-btn');
    const feeModal = document.getElementById('fee-modal');
    const feeToggleBtn = document.getElementById('fee-toggle-btn');
    const feeYearsList = document.getElementById('fee-years-list');
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
    const quizHistorySection = document.getElementById('quiz-history-section');
    const quizQuestionsContainer = document.getElementById('quiz-questions-container');
    const timerElement = document.getElementById('timer');
    const questionCounterElement = document.getElementById('question-counter');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const finishQuizBtn = document.getElementById('finish-quiz-btn');

    const savedQuestionsContainer = document.getElementById('saved-questions-container');
    const savedCountBadge = document.getElementById('saved-count-badge');
    const quizHistoryList = document.getElementById('quiz-history-list');
    const historyCountBadge = document.getElementById('history-count-badge');

    const resultsModal = document.getElementById('results-modal');
    const resultSummaryElement = document.getElementById('result-summary');
    const timerBarFill = document.getElementById('timer-bar-fill');

    let allSections = [];
    let savedQuestions = JSON.parse(localStorage.getItem('savedQuestions')) || [];
    let quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    let currentQuiz = { questions: [], userAnswers: {}, currentQuestionIndex: 0, timerInterval: null, timeRemaining: 0 };
    let historyItemToDelete = null;

    const QUESTIONS_PER_TAB = 30;

    const init = async () => {
    hydrateStaticIcons();
    setupTheme();
    await loadQuestions();
    setupEventListeners();
    renderQuizHistory();
    showSection('practice');
    hideAppLoader();
};

const hideAppLoader = () => {
    if (!appLoader) return;
    appLoader.classList.add('is-hidden');
    setTimeout(() => appLoader.remove(), 500);
};

    const loadQuestions = async () => {
    try {

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

    const setupTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${savedTheme}-mode`;
    };

    const toggleTheme = () => {
        const root = document.documentElement;
        root.classList.add('theme-switching');
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.className = `${newTheme}-mode`;
        localStorage.setItem('theme', newTheme);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove('theme-switching');
            });
        });
    };

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

    if (type === 'practice') {
        renderShowQuestionsButton();
    }
};

    const createTabs = (container, standardTabCount, type) => {
    container.innerHTML = '';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'dropdown-toggle';
    toggleBtn.innerHTML = `<span class="dropdown-label">انتخاب بخش</span>${getIcon('chevronDown', 'dropdown-chevron')}`;

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';

    const createTabItem = (text, index) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.tabIndex = index;
        btn.textContent = text;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBtn.querySelector('.dropdown-label').textContent = text;
            handleTabClick(btn, type);
            dropdownMenu.classList.remove('show');
            toggleBtn.classList.remove('open');
        });
        return btn;
    };

    for (let i = 1; i <= standardTabCount; i++) {
        const text = (type === 'quiz') ? `آزمون ${toPersianDigits(i)}` : `بخش ${toPersianDigits(i)}`;
        dropdownMenu.appendChild(createTabItem(text, i));
    }

    if (type === 'quiz') {
        const specialTabsData = [
            { name: 'آزمون نشان‌نشده‌ها', index: standardTabCount + 1 },
            { name: 'آزمون نشان‌شده‌ها', index: standardTabCount + 2 },
            { name: 'آزمون جامع (همه)', index: standardTabCount + 3 }
        ];
        specialTabsData.forEach(tabData => {
            dropdownMenu.appendChild(createTabItem(tabData.name, tabData.index));
        });
    }

    container.appendChild(toggleBtn);
    container.appendChild(dropdownMenu);
};

const renderShowQuestionsButton = () => {
    practiceQuestionsContainer.innerHTML = '';

    const setupContainer = document.getElementById('practice-setup');
    const oldBtn = setupContainer.querySelector('.show-questions-btn');
    if (oldBtn) oldBtn.remove();

    const showBtn = document.createElement('button');
    showBtn.className = 'show-questions-btn';
    showBtn.innerHTML = `
        <span class="icon-slot" data-icon="practice"></span>
        <span>نمایش نمونه سوالات</span>
        <span class="btn-arrow icon-slot" data-icon="chevronLeft"></span>
    `;
    hydrateStaticIcons(showBtn);

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

    const toggleSaveQuestion = (sectionIndex, questionId) => {
    const savedIndex = savedQuestions.findIndex(sq => sq.sectionIndex === sectionIndex && sq.questionId === questionId);
    if (savedIndex > -1) {
        savedQuestions.splice(savedIndex, 1);
    } else {
        savedQuestions.push({ sectionIndex, questionId });
    }
    localStorage.setItem('savedQuestions', JSON.stringify(savedQuestions));

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

    if (savedCountBadge) {
        if (savedQuestions.length > 0) {
            savedCountBadge.textContent = toPersianDigits(savedQuestions.length);
            savedCountBadge.classList.remove('hidden');
        } else {
            savedCountBadge.classList.add('hidden');
        }
    }

    if (savedQuestions.length === 0) {
    savedQuestionsContainer.innerHTML = `
        <p class="empty-message">
            هنوز سوالی برای مرور نشان نکرده‌اید.<br>
            از بخش <b>نمونه سوالات</b>، روی آیکون
            <span class="inline-icon">${getIcon('bookmarkAdd')}</span>
            زیر هر سوال کلیک کنید تا به این بخش اضافه شود.
        </p>`;
    return;
}
    const fragment = document.createDocumentFragment();
    savedQuestions.forEach((savedItem, i) => {
        const question = allSections[savedItem.sectionIndex]?.find(q => q.id === savedItem.questionId);
        if (question) {
            fragment.appendChild(createQuestionCard(question, 'saved', savedItem.sectionIndex, i));
        }
    });
    savedQuestionsContainer.appendChild(fragment);
};

    const startQuiz = () => {
    let activeTab = quizTabsContainer.querySelector('.tab-btn.active');
    if (!activeTab) { activeTab = quizTabsContainer.querySelector('.tab-btn'); activeTab?.classList.add('active'); }
    if (!activeTab) { alert('لطفا یک نوع آزمون را انتخاب کنید.'); return; }

    const tabIndex = parseInt(activeTab.dataset.tabIndex);
    let duration = 20 * 60;
    let questionsForQuiz = [];
    let quizName = activeTab.textContent;

    if (tabIndex <= allSections.length) {
        questionsForQuiz = allSections[tabIndex - 1] || [];
        quizName = `آزمون بخش ${toPersianDigits(tabIndex)}`;
    } else if (tabIndex === allSections.length + 1) {
        questionsForQuiz = [];
        allSections.forEach((section, sectionIndex) => {
            section.forEach(question => {
                const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === question.id);
                if (!isSaved) questionsForQuiz.push(question);
            });
        });
        quizName = 'آزمون نشان‌نشده‌ها';
        duration = 60 * 60;
    } else if (tabIndex === allSections.length + 2) {
        questionsForQuiz = [];
        savedQuestions.forEach(savedItem => {
            const question = allSections[savedItem.sectionIndex]?.find(q => q.id === savedItem.questionId);
            if (question) questionsForQuiz.push(question);
        });
        quizName = 'آزمون نشان‌شده‌ها';
    } else if (tabIndex === allSections.length + 3) {
        questionsForQuiz = allSections.flat();
        quizName = 'آزمون جامع (همه)';
        duration = 60 * 60;
    }

    if (questionsForQuiz.length === 0) { alert('سوالی برای این آزمون وجود ندارد.'); return; }

    currentQuiz = { questions: questionsForQuiz, userAnswers: {}, currentQuestionIndex: 0, timeRemaining: duration, totalDuration: duration, name: quizName };
    quizSetupSection.classList.add('hidden');
    quizLiveSection.classList.remove('hidden');
    if (quizHistorySection) quizHistorySection.classList.add('hidden');
    if (timerBarFill) {
        timerBarFill.style.width = '100%';
        timerBarFill.classList.remove('is-low');
    }
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

            if (timerBarFill && currentQuiz.totalDuration) {
                const percent = Math.max(0, (currentQuiz.timeRemaining / currentQuiz.totalDuration) * 100);
                timerBarFill.style.width = `${percent}%`;
                timerBarFill.classList.toggle('is-low', currentQuiz.timeRemaining <= 60);
            }

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
        saveQuizHistory(correct, incorrect, unanswered, total, currentQuiz.name);
    }

    showResults(correct, incorrect, unanswered, total);
};

const saveQuizHistory = (correct, incorrect, unanswered, total, quizName) => {
    const now = new Date();
    const newHistoryEntry = {
        date: now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        day: now.toLocaleDateString('fa-IR', { weekday: 'long' }),
        score: `${correct}/${total}`,
        correct, incorrect, unanswered, total,
        quizName: quizName,
        timestamp: now.getTime()
    };

    quizHistory.unshift(newHistoryEntry);
    if (quizHistory.length > 20) { quizHistory.pop(); }
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

    renderQuizHistory();
};

const getHistoryStats = (item) => {
    const total = item.total ?? Number(item.score.split('/')[1]) ?? 0;
    const correct = item.correct ?? Number(item.score.split('/')[0]) ?? 0;
    const incorrect = item.incorrect ?? Math.max(total - correct, 0);
    const unanswered = item.unanswered ?? Math.max(total - correct - incorrect, 0);
    return { correct, incorrect, unanswered, total };
};

const renderQuizHistory = () => {
    if (!quizHistoryList) return;
    quizHistoryList.innerHTML = '';

    if (historyCountBadge) {
        if (quizHistory.length > 0) {
            historyCountBadge.textContent = toPersianDigits(quizHistory.length);
            historyCountBadge.classList.remove('hidden');
        } else {
            historyCountBadge.classList.add('hidden');
        }
    }

    if (quizHistory.length === 0) {
        quizHistoryList.innerHTML = `<p class="empty-message" style="border: none; padding: 1rem 0;">هنوز آزمونی را به پایان نرسانده‌اید.</p>`;
        return;
    }
    quizHistory.forEach((item, i) => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item fade-in';
        historyDiv.style.setProperty('--i', Math.min(i, 8));
        historyDiv.dataset.timestamp = item.timestamp;
        historyDiv.setAttribute('role', 'button');
        historyDiv.tabIndex = 0;
        historyDiv.title = 'مشاهده نمودار نتایج این آزمون';

        const { incorrect, unanswered } = getHistoryStats(item);

        const failed = (incorrect + unanswered) > 4;
        const statusClass = failed ? 'status-fail' : 'status-pass';
        const statusText = failed ? 'مردود' : 'قبول';

        historyDiv.innerHTML = `
            <button class="delete-history-btn" data-timestamp="${item.timestamp}" title="حذف این سابقه">
                ${getIcon('trash')}
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

const renderPracticeQuestions = (sessionQuestions, sectionIndex) => {
    practiceQuestionsContainer.innerHTML = '';
    if (!sessionQuestions || sessionQuestions.length === 0) {
        practiceQuestionsContainer.innerHTML = '<p class="empty-message">سوالی برای نمایش در این بخش وجود ندارد.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    let visibleIndex = 0;
    sessionQuestions.forEach(q => {
        const isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === q.id);
        if (!isSaved) {
            fragment.appendChild(createQuestionCard(q, 'practice', sectionIndex, visibleIndex));
            visibleIndex++;
        }
    });
    if (fragment.children.length === 0) {
        practiceQuestionsContainer.innerHTML = '<p class="empty-message">تمام سوالات این بخش را برای مرور انتخاب کرده‌اید.</p>';
    } else {
        practiceQuestionsContainer.appendChild(fragment);
    }
};

const getThemeChartColors = () => {
    const styles = getComputedStyle(document.body);
    const pick = (name, fallback) => (styles.getPropertyValue(name) || '').trim() || fallback;
    return {
        success: pick('--success-color', '#17A863'),
        error: pick('--error-color', '#EF4358'),
        muted: pick('--text-secondary', '#6B7280'),
        text: pick('--text-primary', '#1B2030'),
    };
};

const renderResultsModal = (correct, incorrect, unanswered, total, meta = {}) => {
    const resultsChartContainer = document.getElementById('chart-container');
    const resultMessageEl = document.getElementById('result-message');
    const resultMetaEl = document.getElementById('result-meta');
    resultsChartContainer.innerHTML = '';

    if (total === 0) return;

    const failed = (incorrect + unanswered) > 4;

    if (!failed) {
        resultMessageEl.textContent = 'تبریک! شما در آزمون قبول شدید. با این تعداد اشتباه، آمادگی لازم برای آزمون اصلی را دارید.';
        resultMessageEl.className = 'pass';
    } else {
        resultMessageEl.textContent = 'متاسفانه تعداد اشتباهات شما بیش از حد مجاز بود. برای آمادگی بیشتر، نقاط ضعف خود را در بخش «مرور» مطالعه کنید.';
        resultMessageEl.className = 'fail';
    }

    if (resultMetaEl) {
        if (meta.quizName) {
            resultMetaEl.textContent = `${meta.quizName} — ${meta.day ? meta.day + '، ' : ''}${meta.date || ''}`;
            resultMetaEl.classList.remove('hidden');
        } else {
            resultMetaEl.classList.add('hidden');
        }
    }

    resultSummaryElement.textContent = `شما به ${toPersianDigits(correct)} سوال پاسخ صحیح، به ${toPersianDigits(incorrect)} سوال پاسخ غلط و ${toPersianDigits(unanswered)} سوال را بدون پاسخ گذاشته‌اید.`;

    const colors = getThemeChartColors();
    const pct = (val) => total ? Math.round((val / total) * 100) : 0;
    const isDark = document.body.classList.contains('dark-mode');

    const options = {
        series: [{
            name: 'تعداد',
            data: [correct, incorrect, unanswered]
        }],
        chart: {
            type: 'bar',
            height: 260,
            toolbar: { show: false },
            fontFamily: 'Vazirmatn, sans-serif',
            animations: { speed: 450, easing: 'easeinout' },
            background: 'transparent'
        },
        theme: { mode: isDark ? 'dark' : 'light' },
        plotOptions: {
            bar: {
                distributed: true,
                borderRadius: 8,
                borderRadiusApplication: 'end',
                columnWidth: '55%',
                horizontal: false,
            }
        },
        colors: [colors.success, colors.error, colors.muted],
        dataLabels: {
            enabled: true,
            formatter: (val) => `${toPersianDigits(val)} (${toPersianDigits(pct(val))}٪)`,
            style: { fontSize: '13px', fontWeight: 700, fontFamily: 'Vazirmatn, sans-serif' },
            offsetY: -22
        },
        legend: { show: false },
        grid: {
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,50,0.07)',
            yaxis: { lines: { show: true } }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: { formatter: (val) => `${toPersianDigits(val)} سوال از ${toPersianDigits(total)} (${toPersianDigits(pct(val))}٪)` }
        },
        xaxis: {
            categories: ['پاسخ صحیح', 'پاسخ غلط', 'بدون پاسخ'],
            labels: {
                style: {
                    colors: [colors.text, colors.text, colors.text],
                    fontFamily: 'Vazirmatn, sans-serif',
                    fontWeight: 600
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            max: total,
            labels: { show: false }
        }
    };

    resultsModal.classList.remove('hidden');

    try {
        const chart = new ApexCharts(resultsChartContainer, options);
        chart.render();
    } catch (err) {

        console.error('ApexCharts failed to load/render; showing results without chart.', err);
    }
};

const showResults = (correct, incorrect, unanswered, total) => {
    quizLiveSection.classList.add('hidden');
    quizSetupSection.classList.remove('hidden');
    if (quizHistorySection) quizHistorySection.classList.remove('hidden');
    renderResultsModal(correct, incorrect, unanswered, total);
};

const createQuestionCard = (q, type, sectionIndex = -1, cardOrderIndex = 0) => {
    const card = document.createElement('div');
    card.className = 'question-card fade-in';
    card.style.setProperty('--i', Math.min(cardOrderIndex, 8));

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
        return `<li class="${classes}" data-option-index="${index}" style="--i:${index}">${numberHtml}${optionContent}</li>`;
    }).join('');

    let starButtonHtml = '';
    let isSaved = false;
    if (type === 'practice' || type === 'saved') {
        isSaved = savedQuestions.some(sq => sq.sectionIndex === sectionIndex && sq.questionId === q.id);
        const starIconName = isSaved ? 'bookmarkAdded' : 'bookmarkAdd';
        starButtonHtml = `<button class="save-star${isSaved ? ' is-saved' : ''}" title="نشان کردن سوال">${getIcon(starIconName)}</button>`;
    }

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

const setupEventListeners = () => {

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    mainNavButtons.forEach(btn => {
        btn.addEventListener('click', () => showSection(btn.dataset.section));
    });

    startQuizBtn.addEventListener('click', startQuiz);
    prevQuestionBtn.addEventListener('click', () => navigateQuiz(-1));
    nextQuestionBtn.addEventListener('click', () => navigateQuiz(1));

    finishQuizBtn.addEventListener('click', () => confirmModal.classList.remove('hidden'));
    confirmFinishBtn.addEventListener('click', () => { confirmModal.classList.add('hidden'); endQuiz(); });
    cancelFinishBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));
    resultsModal.querySelector('.close-modal').addEventListener('click', () => resultsModal.classList.add('hidden'));
    resultsModal.addEventListener('click', (e) => { if(e.target === resultsModal) resultsModal.classList.add('hidden'); });
    showHelpModalBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
    helpModal.querySelector('.close-modal').addEventListener('click', () => helpModal.classList.add('hidden'));
    helpModal.addEventListener('click', (e) => { if(e.target === helpModal) helpModal.classList.add('hidden'); });

    feeToggleBtn.addEventListener('click', () => {
        renderFeeYears();
        feeModal.classList.remove('hidden');
    });
    feeModal.querySelector('.close-modal').addEventListener('click', () => feeModal.classList.add('hidden'));
    feeModal.addEventListener('click', (e) => { if(e.target === feeModal) feeModal.classList.add('hidden'); });
    feeYearsList.addEventListener('input', (e) => {
        const input = e.target.closest('.fee-year-input');
        if (!input) return;
        const year = input.dataset.year;
        const fees = loadFees();
        fees[year] = Number(input.value) || 0;
        saveFees(fees);
    });
    quizHistoryList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-history-btn');
        if (deleteBtn) {
            historyItemToDelete = Number(deleteBtn.dataset.timestamp);
            deleteConfirmModal.classList.remove('hidden');
            return;
        }
        const itemDiv = e.target.closest('.history-item');
        if (itemDiv) {
            const timestamp = Number(itemDiv.dataset.timestamp);
            const item = quizHistory.find(h => h.timestamp === timestamp);
            if (item) {
                const { correct, incorrect, unanswered, total } = getHistoryStats(item);
                renderResultsModal(correct, incorrect, unanswered, total, {
                    quizName: item.quizName,
                    day: item.day,
                    date: item.date
                });
            }
        }
    });

    quizHistoryList.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('history-item')) {
            e.preventDefault();
            e.target.click();
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

    document.addEventListener('click', (e) => {
        const dropdownToggle = e.target.closest('.dropdown-toggle');

        if (dropdownToggle) {
            const menu = dropdownToggle.nextElementSibling;

            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('show');
                    m.previousElementSibling?.classList.remove('open');
                }
            });
            menu.classList.toggle('show');
            dropdownToggle.classList.toggle('open', menu.classList.contains('show'));
        } else if (!e.target.closest('.dropdown-container')) {

            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                menu.previousElementSibling?.classList.remove('open');
            });
        }
    });
};

    init();
});
