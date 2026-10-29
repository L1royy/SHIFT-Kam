document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация иконок и Telegram SDK (с защитой для обычного браузера)
    lucide.createIcons();
    const isTelegram = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
    const tg = isTelegram ? window.Telegram.WebApp : null;

    if (tg) {
        tg.expand();
        tg.setHeaderColor('#0D0D0D');
        tg.setBackgroundColor('#0D0D0D');
    }

    let currentBranch = '1';
    
    const yclientsUrls = {
        '1': 'https://n1765473.yclients.com/company/1464969/personal/menu?o=',
        '2': 'https://n1765473.yclients.com/company/931929/personal/menu?o='
    };

    const hapticLight = () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); };
    const hapticRigid = () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('rigid'); };

    // Логика переключения филиалов
    const branchBtns = document.querySelectorAll('.branch-btn');
    const branchContents = document.querySelectorAll('[data-branch-content]');

    branchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticLight();
            branchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentBranch = btn.getAttribute('data-branch');
            
            branchContents.forEach(content => {
                if (content.getAttribute('data-branch-content') === currentBranch) {
                    content.classList.remove('hidden');
                    // Не сбрасываем display, оставляем управление классам CSS
                    content.classList.add('active'); 
                } else {
                    content.classList.add('hidden');
                    content.classList.remove('active');
                }
            });
        });
    });

    // Логика табов услуг
    const tabBtns = document.querySelectorAll('.tab-btn');
    const serviceLists = document.querySelectorAll('.services-list');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticLight();
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            serviceLists.forEach(list => {
                if (list.id === `tab-${targetTab}`) {
                    list.classList.remove('hidden');
                    list.classList.add('active');
                } else {
                    list.classList.add('hidden');
                    list.classList.remove('active');
                }
            });
        });
    });

    // Аккордеон FAQ
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            hapticLight();
            const isActive = item.classList.contains('active');
            accordionItems.forEach(acc => acc.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Модальное окно YClients и обработка проблем с VPN
    const modal = document.getElementById('yclients-modal');
    const iframe = document.getElementById('yclients-iframe');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const externalLinkBtn = document.getElementById('external-link-btn');
    const openDirectBtn = document.getElementById('open-direct-btn');
    const retryBtn = document.getElementById('retry-btn');
    const loader = document.getElementById('modal-loader');
    const errorBlock = document.getElementById('modal-error');
    const bookBtns = document.querySelectorAll('.book-main-btn');

    let loadTimeout = null;

    // Универсальная функция открытия внешней ссылки (в Telegram через openLink, на ПК через window.open)
    const openInBrowser = (url) => {
        hapticLight();
        if (tg && tg.openLink) {
            tg.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    const startLoading = () => {
        const targetUrl = yclientsUrls[currentBranch];
        loader.classList.remove('hidden');
        errorBlock.classList.add('hidden');

        // Сбрасываем и задаем src
        iframe.src = targetUrl;

        // Если за 6 секунд iframe не загрузился (типично при блокировке по VPN), показываем предупреждение
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
            loader.classList.add('hidden');
            errorBlock.classList.remove('hidden');
        }, 6000);
    };

    // При успешной загрузке iframe
    iframe.addEventListener('load', () => {
        // Проверяем, что это не пустой начальный src
        if (iframe.src && iframe.src.includes('yclients.com')) {
            clearTimeout(loadTimeout);
            loader.classList.add('hidden');
            errorBlock.classList.add('hidden');
        }
    });

    // Открытие модалки
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticRigid();
            if (tg && tg.disableVerticalSwipes) tg.disableVerticalSwipes();
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            startLoading();
        });
    });

    // Закрытие модалки
    const closeModal = () => {
        hapticLight();
        clearTimeout(loadTimeout);
        if (tg && tg.enableVerticalSwipes) tg.enableVerticalSwipes();
        
        modal.classList.add('hidden');
        setTimeout(() => {
            iframe.src = '';
            loader.classList.remove('hidden');
            errorBlock.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    closeModalBtn.addEventListener('click', closeModal);

    // Закрытие по фону (для ПК)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Кнопка в шапке модалки: открыть сразу в браузере
    externalLinkBtn.addEventListener('click', () => {
        openInBrowser(yclientsUrls[currentBranch]);
    });

    // Кнопка в блоке ошибки
    openDirectBtn.addEventListener('click', () => {
        openInBrowser(yclientsUrls[currentBranch]);
    });

    // Кнопка «Попробовать снова»
    retryBtn.addEventListener('click', () => {
        hapticLight();
        startLoading();
    });
});