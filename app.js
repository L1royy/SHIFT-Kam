document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация Telegram SDK и иконок
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.setHeaderColor('#0D0D0D');
    tg.setBackgroundColor('#0D0D0D');
    lucide.createIcons();

    // 2. Глобальное состояние
    let currentBranch = '1';
    
    // Ссылки YClients для филиалов из ТЗ
    const yclientsUrls = {
        '1': 'https://n1765473.yclients.com/company/1464969/personal/menu?o=',
        '2': 'https://n1765473.yclients.com/company/931929/personal/menu?o='
    };

    // 3. Функции тактильного отклика
    const hapticLight = () => {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    };

    const hapticRigid = () => {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('rigid');
        }
    };

    // 4. Логика переключения филиалов (Тургенева / 5-й мкр)
    const branchBtns = document.querySelectorAll('.branch-btn');
    const branchContents = document.querySelectorAll('[data-branch-content]');

    branchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            hapticLight();
            // Обновляем кнопки в шапке
            branchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Обновляем текущий филиал
            currentBranch = btn.getAttribute('data-branch');
            
            // Показываем/скрываем контент
            branchContents.forEach(content => {
                if (content.getAttribute('data-branch-content') === currentBranch) {
                    content.classList.remove('hidden');
                    if(content.tagName !== 'DIV' || content.classList.contains('card') === false) {
                       // Восстанавливаем display в зависимости от типа блока (grid/flex/block)
                       content.classList.add('active'); 
                    }
                } else {
                    content.classList.add('hidden');
                    content.classList.remove('active');
                }
            });
        });
    });

    // 5. Логика табов услуг
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

    // 6. Аккордеон FAQ
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            hapticLight();
            const isActive = item.classList.contains('active');
            accordionItems.forEach(acc => acc.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 7. Логика модального окна YClients
    const modal = document.getElementById('yclients-modal');
    const iframe = document.getElementById('yclients-iframe');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const bookBtns = document.querySelectorAll('.book-main-btn');

    // Открытие модалки записи
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hapticRigid();
            
            // Отключаем свайпы Telegram, чтобы скролл работал только внутри iframe YClients
            if(tg.disableVerticalSwipes) tg.disableVerticalSwipes();
            
            // Подставляем ссылку текущего выбранного филиала
            iframe.src = yclientsUrls[currentBranch];
            
            // Плавно показываем модалку
            modal.classList.remove('hidden');
            
            // Блокируем скролл фона
            document.body.style.overflow = 'hidden';
        });
    });

    // Закрытие модалки
    const closeModal = () => {
        hapticLight();
        
        // Включаем свайпы обратно для навигации по TMA
        if(tg.enableVerticalSwipes) tg.enableVerticalSwipes();
        
        // Скрываем модалку
        modal.classList.add('hidden');
        
        // Очищаем iframe для сброса состояния виджета
        setTimeout(() => {
            iframe.src = '';
            document.body.style.overflow = '';
        }, 300); // Ждем окончания CSS анимации
    };

    closeModalBtn.addEventListener('click', closeModal);
});