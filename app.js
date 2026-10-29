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

    // Модальное окно YClients
    const modal = document.getElementById('yclients-modal');
    const iframe = document.getElementById('yclients-iframe');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const bookBtns = document.querySelectorAll('.book-main-btn');

    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticRigid();
            if (tg && tg.disableVerticalSwipes) tg.disableVerticalSwipes();
            
            iframe.src = yclientsUrls[currentBranch];
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        hapticLight();
        if (tg && tg.enableVerticalSwipes) tg.enableVerticalSwipes();
        
        modal.classList.add('hidden');
        setTimeout(() => {
            iframe.src = '';
            document.body.style.overflow = '';
        }, 300);
    };

    closeModalBtn.addEventListener('click', closeModal);
    
    // Закрытие модалки по клику на темный фон (для ПК)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});