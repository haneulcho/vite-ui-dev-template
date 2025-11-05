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

  const section7Swiper = new Swiper('.section7 .slider-wrapper', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 25,
    loop: true,
    speed: 7500,
    autoplay: {
      delay: 0,
      disableOnInteraction: true,
    },
    freeMode: true,
    freeModeMomentum: false,
    allowTouchMove: true,
    pagination: false,
    navigation: false,
    breakpoints: {
      0: {
        spaceBetween: 18,
      },
      1024: {
        spaceBetween: 25,
      },
    },
  });

  section7Swiper.on('touchEnd', () => {
    if (section7Swiper.autoplay && typeof section7Swiper.autoplay.resume === 'function') {
      section7Swiper.autoplay.resume();
    } else if (section7Swiper.autoplay && typeof section7Swiper.autoplay.start === 'function') {
      section7Swiper.autoplay.start();
    }
  });

  const section8Swiper = new Swiper('.section8 .slider-wrapper', {
    slidesPerView: 'auto',
    centeredSlides: false,
    spaceBetween: 23,
    loop: true,
    speed: 800,
    pagination: {
      el: '.section8 .swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.section8 .swiper-button-next',
      prevEl: '.section8 .swiper-button-prev',
    },
    breakpoints: {
      768: {
        centeredSlides: true,
        spaceBetween: 16,
      },
    },
  });

  const section9Swiper = new Swiper('.section9 .slider-wrapper', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 15,
    loop: true,
    speed: 800,
    pagination: {
      el: '.section9 .swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.section9 .swiper-button-next',
      prevEl: '.section9 .swiper-button-prev',
    },
    breakpoints: {
      768: {
        // spaceBetween: '42%',
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

    const $faqList = $currentLi.closest('.faq-list');
    $faqList.find('li').each(function () {
      const $li = $(this);
      const $questionBtn = $li.find('.question');
      const $answerDiv = $li.find('.answer');
      $questionBtn.attr('aria-expanded', 'false');
      $li.removeClass('active');
      $answerDiv.attr('aria-hidden', 'true');
      $answerDiv.stop(true, true).slideUp(300);
    });

    if (nextExpanded) {
      $button.attr('aria-expanded', 'true');
      $currentLi.addClass('active');
      $currentAnswer.attr('aria-hidden', 'false');
      $currentAnswer.stop(true, true).slideDown(300);
    }
  });

  // 소녀를 구한 위드베어
  $(document).on('click', '.section4 button.bear', function (e) {
    e.preventDefault();
    const $this = $(this);
    const delay = $(window).width() < 768 ? 1450 : 1850;

    $this.parent('.girl').addClass('active');
    setTimeout(() => {
      $this.addClass('leave');
    }, delay);
  });

  // AOS 라이브러리
  AOS.init();
});

document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});
