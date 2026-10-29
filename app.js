document.addEventListener("DOMContentLoaded", () => {
  // 1. Инициализация иконок и Telegram SDK
  lucide.createIcons();
  const isTelegram =
    window.Telegram &&
    window.Telegram.WebApp &&
    window.Telegram.WebApp.initData;
  const tg = isTelegram ? window.Telegram.WebApp : null;

  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#0D0D0D");
    tg.setBackgroundColor("#0D0D0D");
    if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
  }

  let currentBranch = "1";
  let currentBookingUrl = "";

  // Базовые ссылки для филиалов
  const branchCompanies = {
    1: "https://n1765473.yclients.com/company/1464969/personal/",
    2: "https://n1765473.yclients.com/company/931929/personal/",
  };

  const VK_URL = "https://vk.com/shift.room";

  const hapticLight = () => {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
  };
  const hapticRigid = () => {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred("rigid");
  };

  // Универсальное открытие ссылок (Telegram WebApp / обычный браузер)
  const openInBrowser = (url) => {
    hapticLight();
    if (tg && tg.openLink) {
      tg.openLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  // Обработка кликов по кнопкам ВК
  document.querySelectorAll(".vk-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openInBrowser(VK_URL);
    });
  });

  // Переключение филиалов (Тургенева / 5-й мкр)
  const branchBtns = document.querySelectorAll(".branch-btn");
  const branchContents = document.querySelectorAll("[data-branch-content]");

  branchBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticLight();
      branchBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentBranch = btn.getAttribute("data-branch");

      branchContents.forEach((content) => {
        if (content.getAttribute("data-branch-content") === currentBranch) {
          content.classList.remove("hidden");
          content.classList.add("active");
        } else {
          content.classList.add("hidden");
          content.classList.remove("active");
        }
      });
    });
  });

  // Логика табов услуг
  const tabBtns = document.querySelectorAll(".tab-btn");
  const serviceLists = document.querySelectorAll(".services-list");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticLight();
      const targetTab = btn.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      serviceLists.forEach((list) => {
        if (list.id === `tab-${targetTab}`) {
          list.classList.remove("hidden");
          list.classList.add("active");
        } else {
          list.classList.add("hidden");
          list.classList.remove("active");
        }
      });
    });
  });

  // FAQ Аккордеон
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      hapticLight();
      const isActive = item.classList.contains("active");
      accordionItems.forEach((acc) => acc.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    });
  });

  // Модальное окно записи YClients
  const modal = document.getElementById("yclients-modal");
  const iframe = document.getElementById("yclients-iframe");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const externalLinkBtn = document.getElementById("external-link-btn");
  const openDirectBtn = document.getElementById("open-direct-btn");
  const retryBtn = document.getElementById("retry-btn");
  const loader = document.getElementById("modal-loader");
  const errorBlock = document.getElementById("modal-error");
  const bookBtns = document.querySelectorAll(".book-main-btn");

  let loadTimeout = null;

  const startLoading = () => {
    loader.classList.remove("hidden");
    errorBlock.classList.add("hidden");

    iframe.src = currentBookingUrl;

    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(() => {
      loader.classList.add("hidden");
      errorBlock.classList.remove("hidden");
    }, 6000);
  };

  iframe.addEventListener("load", () => {
    if (iframe.src && iframe.src.includes("yclients.com")) {
      clearTimeout(loadTimeout);
      loader.classList.add("hidden");
      errorBlock.classList.add("hidden");
    }
  });

  const closeModal = () => {
    hapticLight();
    clearTimeout(loadTimeout);

    if (tg) {
      if (tg.enableVerticalSwipes) tg.enableVerticalSwipes();
      if (tg.BackButton) {
        tg.BackButton.hide();
        tg.BackButton.offClick(closeModal);
      }
    }

    modal.classList.add("hidden");
    setTimeout(() => {
      iframe.src = "";
      loader.classList.remove("hidden");
      errorBlock.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);
  };

  // Нажатие на любую кнопку записи
  bookBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticRigid();

      if (tg) {
        if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
        if (tg.BackButton) {
          tg.BackButton.show();
          tg.BackButton.onClick(closeModal);
        }
      }

      // Определяем целевой экран в зависимости от атрибута data-booking-type
      const bookingType = btn.getAttribute("data-booking-type");
      const base = branchCompanies[currentBranch];

      if (bookingType === "master") {
        currentBookingUrl = `${base}select-master?o=`;
      } else if (bookingType === "service") {
        currentBookingUrl = `${base}select-services?o=`;
      } else {
        currentBookingUrl = `${base}menu?o=`;
      }

      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      startLoading();
    });
  });

  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  externalLinkBtn.addEventListener("click", () =>
    openInBrowser(currentBookingUrl),
  );
  openDirectBtn.addEventListener("click", () =>
    openInBrowser(currentBookingUrl),
  );
  retryBtn.addEventListener("click", () => {
    hapticLight();
    startLoading();
  });
});
