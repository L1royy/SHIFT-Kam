document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация иконок и Telegram SDK
    lucide.createIcons();
    const isTelegram = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
    const tg = isTelegram ? window.Telegram.WebApp : null;

    if (tg) {
        tg.ready(); // Сообщаем Telegram, что приложение готово
        tg.expand();
        tg.setHeaderColor('#0D0D0D');
        tg.setBackgroundColor('#0D0D0D');
        // Включаем подтверждение закрытия, чтобы случайно не смахнуть
        if (tg.enableClosingConfirmation) tg.enableClosingConfirmation(); 
    }

    let currentBranch = '1';
    let currentBookingUrl = ''; // Переменная для хранения итоговой ссылки
    
    // Базовые ссылки (без endpoint'ов)
    const yclientsBaseUrls = {
        '1': 'https://n1765473.yclients.com/company/1464969/personal/',
        '2': 'https://n1765473.yclients.com/company/931929/personal/'
    };

    const hapticLight = () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); };
    const hapticRigid = () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('rigid'); };

    // Универсальная функция открытия внешней ссылки
    const openInBrowser = (url) => {
        hapticLight();
        if (tg && tg.openLink) {
            tg.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    // Слушатель для кастомной кнопки ВК (если добавите id="vk-link")
    const vkLink = document.getElementById('vk-link');
    if (vkLink) {
        vkLink.addEventListener('click', (e) => {
            e.preventDefault();
            openInBrowser('https://vk.com/shift.room');
        });
    }

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

    const startLoading = () => {
        loader.classList.remove('hidden');
        errorBlock.classList.add('hidden');

        // Подставляем сформированную ссылку
        iframe.src = currentBookingUrl;

        // Если за 6 секунд iframe не загрузился, показываем ошибку
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
            loader.classList.add('hidden');
            errorBlock.classList.remove('hidden');
        }, 6000);
    };

    // При успешной загрузке iframe
    iframe.addEventListener('load', () => {
        if (iframe.src && iframe.src.includes('yclients.com')) {
            clearTimeout(loadTimeout);
            loader.classList.add('hidden');
            errorBlock.classList.add('hidden');
        }
    });

    // Закрытие модалки (вынесено для использования в кнопке "Назад")
    const closeModal = () => {
        hapticLight();
        clearTimeout(loadTimeout);
        
        if (tg) {
            if (tg.enableVerticalSwipes) tg.enableVerticalSwipes();
            // Скрываем системную кнопку "Назад"
            if (tg.BackButton) {
                tg.BackButton.hide();
                tg.BackButton.offClick(closeModal);
            }
        }
        
        modal.classList.add('hidden');
        setTimeout(() => {
            iframe.src = '';
            loader.classList.remove('hidden');
            errorBlock.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    // Открытие модалки
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticRigid();
            
            if (tg) {
                if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
                // Показываем системную кнопку "Назад" и вешаем закрытие
                if (tg.BackButton) {
                    tg.BackButton.show();
                    tg.BackButton.onClick(closeModal);
                }
            }
            
            // Формируем URL в зависимости от наличия ID мастера или услуги
            const masterId = btn.getAttribute('data-master-id');
            const serviceId = btn.getAttribute('data-service-id');
            let targetUrl = yclientsBaseUrls[currentBranch];
            
            if (masterId) {
                targetUrl += `select-master?o=m${masterId}`;
            } else if (serviceId) {
                targetUrl += `select-services?o=s${serviceId}`;
            } else {
                targetUrl += `menu?o=`;
            }
            
            // Сохраняем ссылку, чтобы кнопки Fallback открывали именно её
            currentBookingUrl = targetUrl;
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            startLoading();
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    // Закрытие по фону (для ПК)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Кнопка в шапке модалки: открыть сразу в браузере
    externalLinkBtn.addEventListener('click', () => { openInBrowser(currentBookingUrl); });

    // Кнопка в блоке ошибки
    openDirectBtn.addEventListener('click', () => { openInBrowser(currentBookingUrl); });

    // Кнопка «Попробовать снова»
    retryBtn.addEventListener('click', () => { hapticLight(); startLoading(); });
});