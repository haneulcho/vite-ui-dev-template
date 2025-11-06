
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
      const wrapper = sec01El.querySelector('.swiper-wrapper');
      if (wrapper) {
        // 기존 슬라이드 복제하여 무한 루프 효과 강화 (화면이 클 때를 대비)
        const originalSlides = wrapper.querySelectorAll('.swiper-slide');
        const slideCount = originalSlides.length;

        // 화면이 클 때를 대비해 슬라이드를 3-4번 복제 (총 12-16개)
        // 이미 복제되지 않은 경우에만 복제
        if (slideCount <= 12) {
          const cloneCount = Math.max(3, Math.ceil(window.innerWidth / 400)); // 화면 크기에 따라 복제 개수 조정
          for (let i = 0; i < cloneCount; i++) {
            originalSlides.forEach((slide) => {
              const clone = slide.cloneNode(true);
              wrapper.appendChild(clone);
            });
          }
        }
      }

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
        loopAdditionalSlides: 4, // 루프를 위한 추가 슬라이드 수
      });
    }

    // 섹션2는 화면 진입 시에만 초기화
    const sec02Section = document.querySelector('.section2');
    if (sec02Section) {
      let sec02Inited = false;
      const initSec02 = () => {
        if (sec02Inited) return;
        const sec02El = document.querySelector('.swiperSec02');
        if (!sec02El) return;
        sec02Inited = true;
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
      };

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              initSec02();
              obs.disconnect();
            }
          });
        }, { root: null, threshold: 0.25 });
        observer.observe(sec02Section);
      } else {
        // 폴백: 스크롤 체크
        const onScrollCheck = withRaf(() => {
          const rect = sec02Section.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
          if (inView) {
            initSec02();
            window.removeEventListener('scroll', onScrollCheck);
          }
        });
        window.addEventListener('scroll', onScrollCheck, { passive: true });
        onScrollCheck();
      }
    }


    // 섹션4는 화면 진입 시에만 초기화
    const sec04Section = document.querySelector('.section4');
    if (sec04Section) {
      let sec04Inited = false;
      const initSec04 = () => {
        if (sec04Inited) return;
        const sec04El = document.querySelector('.swiperSec04');
        if (!sec04El) return;
        sec04Inited = true;
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
      };

      if ('IntersectionObserver' in window) {
        const observer04 = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              initSec04();
              obs.disconnect();
            }
          });
        }, { root: null, threshold: 0.2 });
        observer04.observe(sec04Section);
      } else {
        const onScrollCheck04 = withRaf(() => {
          const rect = sec04Section.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
          if (inView) {
            initSec04();
            window.removeEventListener('scroll', onScrollCheck04);
          }
        });
        window.addEventListener('scroll', onScrollCheck04, { passive: true });
        onScrollCheck04();
      }
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
      const speed = Number($item.attr('data-speed')) || 1;
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

  // 섹션2 파랄랙스 속도: 모바일 10, 데스크톱 5
  const setParallaxSpeedForViewport = () => {
    const target = document.querySelector('.section2 .imgItem02.parallax');
    if (!target) return;
    const desired = isMobile() ? 10 : 5;
    const current = Number(target.getAttribute('data-speed'));
    if (current !== desired) {
      target.setAttribute('data-speed', String(desired));
    }
  };

  const handleResize = withRaf(() => {
    // 섹션2 파랄랙스 속도 모바일/PC에 맞게 동기화
    setParallaxSpeedForViewport();
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
    setParallaxSpeedForViewport();
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

