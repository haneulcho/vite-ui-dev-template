
(() => {
  'use strict';

  // -------------------------
  // Utils
  // -------------------------
  const $doc = $(document);
  const $win = $(window);

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // rAF 기반 스로틀
  const withRaf = (fn) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          fn(...args);
          ticking = false;
        });
        ticking = true;
      }
    };
  };

  // -------------------------
  // Swiper
  // -------------------------
  const initSwiperSlider = () => {
    // 존재할 때만 안전하게 생성
    const sec01El = document.querySelector('.swiperSec01');
    if (sec01El) {
      // marquee 스타일 흐름
      new Swiper(sec01El, {
        loop: true,
        slidesPerView: 'auto',
        spaceBetween: 16,
        allowTouchMove: false,
        speed: 8000,
        freeMode: {
          // 필요 시 true로 바꿔 균일 흐름 강화 가능
          enabled: false,
          momentum: false,
        },
        autoplay: {
          delay: 0,
          disableOnInteraction: false,
        },
        watchSlidesProgress: true,
        preloadImages: true,
      });
    }

    const sec02El = document.querySelector('.swiperSec02');
    if (sec02El) {
      new Swiper(sec02El, {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 1000,
        autoplay: { delay: 3000 },
        navigation: {
          nextEl: '.swiperSec02-next',
          prevEl: '.swiperSec02-prev',
        },
        pagination: {
          el: '.swiperSec02-pagination',
          clickable: true,
        },
        grabCursor: true,
        effect: "creative",
        creativeEffect: {
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        },
      });
    }

    const sec04El = document.querySelector('.swiperSec04');
    if (sec04El) {
      new Swiper(sec04El, {
        loop: false,
        slidesPerView: 1,
        spaceBetween: 24,
        speed: 1000,
        autoHeight: false,
        autoplay: { delay: 5000 },
        pagination: {
          el: '.swiperSec04-pagination',
          clickable: true,
        },
      });
    }

    const sec07El = document.querySelector('.swiperSec07');
    if (sec07El) {
      new Swiper(sec07El, {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 24,
        speed: 2000,
        // effect: "fade",
        // fadeEffect: {
        //   crossFade: true,
        // },
        autoplay: { delay: 3000 },
        pagination: {
          el: '.swiperSec07-pagination',
          clickable: true,
        },
      });
    }
  };

  // -------------------------
  // FAQ Toggle (jQuery 유지)
  // -------------------------
  const bindFaqToggle = () => {
    $doc.on('click', '.faq-list li a.question', (e) => {
      e.preventDefault();
      const $li = $(e.currentTarget).closest('li');
      const $answer = $li.find('.answer');
      $li.toggleClass('active');
      $answer.stop(true, true).slideToggle(300);
    });
  };

  // -------------------------
  // Parallax
  // -------------------------
  const updateParallax = (scrollTop, mobile) => {
    $('.parallax').each(function () {
      const $item = $(this);
      const speed = Number($item.data('speed')) || 1;
      const y = scrollTop / speed;

      // 현재 로직은 모바일/데스크톱 동일 동작
      if (mobile) {
        $item.css({ left: '', bottom: y });
      } else {
        $item.css({ left: '', bottom: y });
      }
    });
  };

  const handleScrollEvents = withRaf(() => {
    const scrollTop = $win.scrollTop();
    updateParallax(scrollTop, isMobile());
  });

  // -------------------------
  // Responsive Image Switch
  // -------------------------
  const switchImages = () => {
    $('.responsive').each(function () {
      const $img = $(this);
      const src = $img.attr('src') ?? '';
      const isMo = src.endsWith('-mo.png') || src.endsWith('-mo.jpg');

      if (window.innerWidth <= 720) {
        if (!isMo) {
          const next = src.replace('.png', '-mo.png').replace('.jpg', '-mo.jpg');
          $img.attr('src', next);
        }
      } else {
        const next = src.replace('-mo.png', '.png').replace('-mo.jpg', '.jpg');
        if (next !== src) $img.attr('src', next);
      }
    });
  };

  const handleResize = withRaf(() => {
    switchImages();
    handleScrollEvents(); // 레이아웃 변동 시 패럴럭스 위치도 갱신
  });

  // -------------------------
  // Boot
  // -------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // 외부 라이브러리 안전 호출
    window.AOS?.init?.();

    // 초기 스타일
    const wrap = document.getElementById('wrap');
    if (wrap) wrap.style.overflow = 'inherit';

    // 초기화
    initSwiperSlider();
    handleScrollEvents();

    // 이벤트: 패시브 + rAF 스로틀
    window.addEventListener('scroll', handleScrollEvents, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // FAQ 토글 바인딩
    bindFaqToggle();

    // 약간의 지연 후 이미지 스위치(초기 렌더 보정)
    setTimeout(switchImages, 300);
  });
})();

