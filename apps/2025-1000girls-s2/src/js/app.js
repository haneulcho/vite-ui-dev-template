/* eslint-disable no-undef */
const initSwiperSlider = () => {
  const section5Swiper = new Swiper('.section5 .slider-wrapper', {
    slidesPerView: 1,
    spaceBetween: 80,
    speed: 800,
    loop: true,
    pagination: {
      el: '.section5 .swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.section5 .swiper-button-next',
      prevEl: '.section5 .swiper-button-prev',
    },
    breakpoints: {
      719: {
        spaceBetween: 0,
      },
      720: {
        spaceBetween: 0,
      },
    },
  });
};

$(document).on('ready', function () {
  // FAQ 탭 전환
  $(document).on('click', '.faq-tabs .faq-tab', function (e) {
    e.preventDefault();

    const $clickedTab = $(this);
    const panelId = $clickedTab.attr('aria-controls');
    const $targetPanel = $(`#${panelId}`);
    const $activePanel = $('.faq-panels .faq-panel.active');

    if ($clickedTab.hasClass('active')) {
      return;
    }

    // 모든 탭에서 active 제거 및 aria 속성 업데이트
    $('.faq-tabs .faq-tab').removeClass('active').attr('aria-selected', 'false').attr('tabindex', '-1');

    $clickedTab.addClass('active').attr('aria-selected', 'true').removeAttr('tabindex');
    $activePanel.removeClass('active');
    $targetPanel.addClass('active');
  });

  // FAQ 아코디언
  $(document).on('click', '.faq-list li .question', function (e) {
    e.preventDefault();

    const $button = $(this);
    const $currentLi = $button.closest('li');
    const $currentAnswer = $currentLi.find('.answer');

    const isExpanded = $button.attr('aria-expanded') === 'true';
    const nextExpanded = !isExpanded;

    $button.attr('aria-expanded', String(nextExpanded));
    $currentLi.toggleClass('active', nextExpanded);
    $currentAnswer.attr('aria-hidden', String(!nextExpanded));
    $currentAnswer.stop(true, true).slideToggle(300);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});
