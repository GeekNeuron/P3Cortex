const ICONS = {

    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5243 12.0005C18.5243 15.8665 15.4687 19.0005 11.6993 19.0005C11.6993 15.6865 12.6743 11.5005 17.5493 11.0005H18.4551C18.5013 11.3317 18.5244 11.6659 18.5243 12.0005V12.0005Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.92587 10.2543C5.51382 10.2121 5.14552 10.5119 5.10326 10.9239C5.061 11.336 5.36078 11.7043 5.77283 11.7465L5.92587 10.2543ZM11.6993 19.0004L11.6993 19.7504C11.8982 19.7505 12.089 19.6714 12.2296 19.5308C12.3703 19.3901 12.4493 19.1994 12.4493 19.0004H11.6993ZM4.88289 12.3342L4.1337 12.3691L4.88289 12.3342ZM11.0491 5.03234L10.9758 4.28594L11.0491 5.03234ZM17.7124 11.1049C17.7702 11.5151 18.1495 11.8008 18.5596 11.7431C18.9698 11.6854 19.2555 11.3061 19.1978 10.8959L17.7124 11.1049ZM5.84935 11.7504C6.26356 11.7504 6.59935 11.4146 6.59935 11.0004C6.59935 10.5862 6.26356 10.2504 5.84935 10.2504V11.7504ZM4.94357 10.2504C4.52936 10.2504 4.19357 10.5862 4.19357 11.0004C4.19357 11.4146 4.52936 11.7504 4.94357 11.7504V10.2504ZM5.84935 10.2504C5.43514 10.2504 5.09935 10.5862 5.09935 11.0004C5.09935 11.4146 5.43514 11.7504 5.84935 11.7504V10.2504ZM17.5493 11.7504C17.9636 11.7504 18.2993 11.4146 18.2993 11.0004C18.2993 10.5862 17.9636 10.2504 17.5493 10.2504V11.7504ZM5.77283 11.7465C7.96327 11.9712 9.21227 12.9978 9.94811 14.3117C10.7101 15.6722 10.9493 17.3973 10.9493 19.0004H12.4493C12.4493 17.2895 12.2011 15.2646 11.2568 13.5787C10.2864 11.846 8.61043 10.5297 5.92587 10.2543L5.77283 11.7465ZM11.6994 18.2504C8.47411 18.2501 5.78794 15.6476 5.63208 12.2994L4.1337 12.3691C4.32526 16.4842 7.63958 19.75 11.6993 19.7504L11.6994 18.2504ZM5.63208 12.2994C5.47617 8.95004 7.91012 6.09445 11.1225 5.77875L10.9758 4.28594C6.93637 4.68292 3.9422 8.25515 4.1337 12.3691L5.63208 12.2994ZM11.1225 5.77875C14.3322 5.46331 17.2458 7.78918 17.7124 11.1049L19.1978 10.8959C18.6237 6.8165 15.0179 3.8887 10.9758 4.28594L11.1225 5.77875ZM5.84935 10.2504H4.94357V11.7504H5.84935V10.2504ZM5.84935 11.7504H17.5493V10.2504H5.84935V11.7504Z" fill="currentColor"/>
    </svg>`,

    practice: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5.6C4 4.72 4.72 4 5.6 4H11V20H5.6C4.72 20 4 19.28 4 18.4V5.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M20 5.6C20 4.72 19.28 4 18.4 4H13V20H18.4C19.28 20 20 19.28 20 18.4V5.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M7 7.4H11M7 10.6H11M13 7.4H17M13 10.6H17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    review: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 3H14.5L18 6.5V19.5C18 20.6 17.1 21.5 16 21.5H6.5C5.4 21.5 4.5 20.6 4.5 19.5V5C4.5 3.9 5.4 3 6.5 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M7.7 11H12.8M7.7 14.2H10.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="15.3" cy="15.6" r="2.9" fill="var(--bg-surface)" stroke="currentColor" stroke-width="1.6"/>
        <path d="M17.3 17.6L19.2 19.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    quiz: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4.2" width="14" height="17" rx="2.2" stroke="currentColor" stroke-width="1.7"/>
        <path d="M9 4.2V3.6C9 2.72 9.72 2 10.6 2H13.4C14.28 2 15 2.72 15 3.6V4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M8.6 12.8L10.9 15.1L15.6 9.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    history: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.3 12a8.7 8.7 0 1 0 3-6.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M3 4.3V8.3H7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 7.6V12.3L15.2 14.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    savedTitle: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.3 3.7C6.3 2.76 7.06 2 8 2H16C16.94 2 17.7 2.76 17.7 3.7V21L12 17.4L6.3 21V3.7Z" fill="currentColor"/>
    </svg>`,

    bookmarkAdd: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 21L12 16.6L6 21V4.6C6 3.72 6.72 3 7.6 3H16.4C17.28 3 18 3.72 18 4.6V21Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M9.2 9.5H14.8M12 6.7V12.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    bookmarkAdded: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 21L12 16.6L6 21V4.6C6 3.72 6.72 3 7.6 3H16.4C17.28 3 18 3.72 18 4.6V21Z" fill="currentColor"/>
        <path d="M9 9.6L11.1 11.7L15.2 7.4" stroke="var(--bg-surface)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    trash: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 7H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M9 7V4.8C9 4.36 9.36 4 9.8 4H14.2C14.64 4 15 4.36 15 4.8V7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 7L7.3 19.2C7.35 19.9 7.94 20.5 8.65 20.5H15.35C16.06 20.5 16.65 19.9 16.7 19.2L17.5 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 10.6V17M14 10.6V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    chevronDown: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    sun: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4.1" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 2.5V5M12 19V21.5M4.2 4.2L6 6M18 18L19.8 19.8M2.5 12H5M19 12H21.5M4.2 19.8L6 18M18 6L19.8 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

    moon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.4 14.7A8.5 8.5 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1Z" fill="currentColor"/>
    </svg>`,

    help: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>
        <path d="M9.9 9.4C10.3 8.2 11.5 7.5 12.7 7.7C13.9 7.9 14.8 9 14.7 10.2C14.6 11.2 13.9 11.7 13.2 12.1C12.6 12.5 12 12.9 12 13.7V14.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>`,

    close: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
    </svg>`,

    wallet: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 6V5C7 3.9 7.9 3 9 3H15C16.1 3 17 3.9 17 5V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <rect x="3" y="6" width="18" height="13" rx="2.4" stroke="currentColor" stroke-width="1.7"/>
        <path d="M3 10.2H21" stroke="currentColor" stroke-width="1.7"/>
        <circle cx="16.6" cy="14.6" r="1.4" fill="currentColor"/>
    </svg>`,
};

function getIcon(name, extraClass = '') {
    const raw = ICONS[name];
    if (!raw) return '';
    const cls = `icon${extraClass ? ' ' + extraClass : ''}`;
    return raw.replace('<svg ', `<svg class="${cls}" `);
}

function hydrateStaticIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        const extraClass = el.getAttribute('data-icon-class') || '';
        el.innerHTML = getIcon(name, extraClass);
    });
}
