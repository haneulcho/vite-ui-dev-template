/* eslint-disable no-undef */
var $window = $(window);

// -------------------------
// Helpers / Constants
// -------------------------
const SELECTOR = {
  section1: '.app-section.section1',
  section1Titles: '.section1 .main-title',
  section1Diamonds: '.section1 .diamond',
  section3Wrapper: '.section3 .overflow-section-wrapper',
  section3Contents: '.section3 .overflow-section',
};

const rafThrottle = fn => {
  let isRunning = false;
  return function throttled() {
    if (isRunning) return;
    isRunning = true;
    const ctx = this;
    const args = arguments;
    requestAnimationFrame(function () {
      fn.apply(ctx, args);
      isRunning = false;
    });
  };
};

let isScrollTriggerLoaded = false;
let hasUserScrolled = false; // 실제 사용자 스크롤 여부

const getScrollTop = () => window.pageYOffset || document.documentElement.scrollTop || 0;
const isNarrow = () => $window.width() <= 1000;
const isTablet = () => $window.width() > 768;

const chosenTitleMotion = () => {
  const titleElements = document.querySelectorAll(SELECTOR.section1Titles);

  if (titleElements.length === 0) return;

  gsap.to(titleElements, {
    y: 0,
    autoAlpha: 1,
    duration: 1.45,
    ease: 'elastic.out(1, 0.3)',
    stagger: 0.12,
    delay: 0.1,
  });

  setTimeout(() => {
    $(SELECTOR.section1Diamonds).addClass('active');
  }, 900);
};

const shortsMotion = () => {
  const section1 = document.querySelector('.app-section.section1');
  if (!section1) return;

  const section1Height = section1.offsetHeight;

  gsap.timeline({
    scrollTrigger: {
      trigger: '.app-section.section1',
      start: `top+=${section1Height * 0.3}`,
      end: 'bottom',
      pinSpacing: false,
      pin: true,
      anticipatePin: 1,
      pinType: 'fixed',
      pinnedContainer: '.chosen',
    },
  });
};

const visualMotion = () => {
  const section1 = document.querySelector(SELECTOR.section1);
  if (!section1) return;

  // 여기서 수치 조정
  // 모바일 30%, PC 25% 지나면 가비<->아동 전환
  const computeTriggerPoint = () => section1.offsetHeight * (isNarrow() ? 0.3 : 0.22);
  let triggerPoint = computeTriggerPoint();

  const onResize = rafThrottle(() => {
    const isHeaderLoaded = $('#header').length > 0;
    if (!isHeaderLoaded) return;

    triggerPoint = computeTriggerPoint();
  });

  const onScroll = rafThrottle(() => {
    // header가 로드되었는지 확인 (jQuery 객체 자체는 truthy이므로 length 검사)
    const isHeaderLoaded = $('#header').length > 0;
    const isPinSpacerLoaded = $('.pin-spacer').length > 0;

    if (!isHeaderLoaded) return;

    if (!isScrollTriggerLoaded && $('.section1').hasClass('active')) {
      isScrollTriggerLoaded = true;
      setTimeout(() => {
        shortsMotion();
      }, 300);
    }

    if (!hasUserScrolled) return; // 사용자 스크롤 전에는 동작하지 않음

    const scrollTop = getScrollTop();
    const $section1 = $(SELECTOR.section1);
    if (scrollTop >= triggerPoint) {
      // if (!isPinSpacerLoaded) return;
      if (!$section1.hasClass('active')) {
        $section1.addClass('active');
      }
    } else {
      // if (!isPinSpacerLoaded) return;
      $section1.removeClass('active');
    }
  });

  // 최초 스크롤 감지 (한 번만)
  window.addEventListener(
    'scroll',
    () => {
      hasUserScrolled = true;
    },
    { once: true, passive: true }
  );

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  // 초기 1회 평가
  // onScroll은 실제 사용자 스크롤 이후에만 동작
};

// section3 가로 스크롤 기능
const initSection3HorizontalScroll = () => {
  const section3 = document.querySelector(SELECTOR.section3Wrapper);
  const overflowSliderContents = document.querySelector(SELECTOR.section3Contents);

  if (!section3 || !overflowSliderContents) return;

  let isScrolling = false; // reserved (미사용) - 미래 확장 대비
  let scrollPosition = 0;
  let maxScrollLeft = 0;
  let isHorizontalScrollActive = false;

  // 최대 스크롤 가능한 거리 계산
  const calculateMaxScroll = () => {
    const containerWidth = section3.offsetWidth;
    const contentWidth = overflowSliderContents.scrollWidth;
    maxScrollLeft = Math.max(0, contentWidth - containerWidth);
  };

  // 초기 최대 스크롤 거리 계산
  calculateMaxScroll();

  // 윈도우 리사이즈 시 최대 스크롤 거리 재계산
  window.addEventListener('resize', calculateMaxScroll, { passive: true });

  // 마우스 휠 이벤트
  section3.addEventListener(
    'wheel',
    e => {
      const deltaY = e.deltaY;
      const deltaX = e.deltaX;
      // FIXME: 여기 수정
      const scrollSpeedX = 30; // 가로 스크롤 속도 조절 (높을수록 빠르게)
      const scrollSpeedY = 60; // 세로 스크롤 속도 조절 (높을수록 빠르게)

      let scrollDirection = 0;

      // 가로 스크롤 우선 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaX !== 0) {
        // deltaX > 0: 오른쪽으로 스크롤 = 왼쪽으로 이동
        // deltaX < 0: 왼쪽으로 스크롤 = 오른쪽으로 이동
        scrollDirection = deltaX > 0 ? scrollSpeedX : -scrollSpeedX;
      } else {
        // 세로 스크롤을 가로 스크롤로 변환
        // deltaY > 0: 아래로 스크롤 = 왼쪽으로 이동
        // deltaY < 0: 위로 스크롤 = 오른쪽으로 이동
        scrollDirection = deltaY > 0 ? scrollSpeedY : -scrollSpeedY;
      }

      // 스크롤이 끝에 도달했고 오른쪽으로 스크롤하려고 할 때
      if (scrollPosition >= maxScrollLeft && scrollDirection > 0) {
        // 가로 스크롤 완료, 아래로 세로 스크롤 허용
        isHorizontalScrollActive = false;
        return; // early return으로 가로 스크롤 로직 차단
      }

      // 스크롤이 처음에 도달했고 왼쪽으로 스크롤하려고 할 때
      if (scrollPosition <= 0 && scrollDirection < 0) {
        // 가로 스크롤이 처음 위치, 위로 스크롤 허용
        isHorizontalScrollActive = false;
        return; // early return으로 가로 스크롤 로직 차단
      }

      // 가로 스크롤이 활성화된 경우에만 preventDefault 실행
      if (isHorizontalScrollActive || maxScrollLeft > 0) {
        e.preventDefault();
      }

      if (isScrolling) return;

      const newScrollPosition = scrollPosition + scrollDirection;

      // 스크롤 범위 제한
      const clampedPosition = Math.max(0, Math.min(newScrollPosition, maxScrollLeft));

      // 스크롤 위치가 변경되었을 때만 실행
      if (clampedPosition !== scrollPosition) {
        scrollPosition = clampedPosition;
        isHorizontalScrollActive = true;

        // translateX로 왼쪽으로 이동 (음수 값)
        overflowSliderContents.style.transform = `translateX(-${scrollPosition}px)`;
      }
    },
    { passive: false }
  );

  // 터치 이벤트 추가
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchScrolling = false;

  section3.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isTouchScrolling = false;
  });

  section3.addEventListener(
    'touchmove',
    e => {
      if (!touchStartX || !touchStartY) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;

      const deltaX = touchStartX - touchCurrentX;
      const deltaY = touchStartY - touchCurrentY;

      // 가로 스와이프가 세로 스와이프보다 클 때만 가로 스크롤 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault(); // 가로 스와이프일 때만 preventDefault

        if (!isTouchScrolling) {
          isTouchScrolling = true;
          isHorizontalScrollActive = true;
        }

        const swipeSpeed = 0.4; // 터치 스와이프 속도 조절 (더 자연스럽게)
        const newScrollPosition = scrollPosition + deltaX * swipeSpeed;

        // 스크롤 범위 제한
        const clampedPosition = Math.max(0, Math.min(newScrollPosition, maxScrollLeft));

        if (clampedPosition !== scrollPosition) {
          scrollPosition = clampedPosition;
          overflowSliderContents.style.transform = `translateX(-${scrollPosition}px)`;
        }
      }
    },
    { passive: false }
  );

  section3.addEventListener('touchend', () => {
    touchStartX = 0;
    touchStartY = 0;
    isTouchScrolling = false;

    // 터치가 끝나면 잠시 후 가로 스크롤 비활성화
    setTimeout(() => {
      isHorizontalScrollActive = false;
    }, 300);
  });

  // 마우스 진입/이탈 이벤트
  section3.addEventListener('mouseenter', () => {
    if (maxScrollLeft > 0) {
      isHorizontalScrollActive = true;
    }
  });

  section3.addEventListener('mouseleave', () => {
    // 마우스가 벗어나면 잠시 후 세로 스크롤 허용
    setTimeout(() => {
      isHorizontalScrollActive = false;
    }, 200);
  });

  // 전역 스크롤 이벤트에서 가로 스크롤 중일 때만 세로 스크롤 방지
  window.addEventListener(
    'wheel',
    e => {
      // section3에 마우스가 있고, 가로 스크롤이 활성화되어 있을 때만 preventDefault
      if (section3.matches(':hover') && isHorizontalScrollActive) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
};

const initSwiperSlider = () => {
  const section3Swiper = new Swiper('.section3 .slider-wrapper', {
    slidesPerView: 'auto',
    spaceBetween: 104,
    slidesOffsetAfter: 500,
    speed: 600,
    autoHeight: true,
    navigation: false,
    mousewheel: {
      thresholdDelta: 50,
      releaseOnEdges: true,
      eventsTarget: '.section3',
    },
    keyboard: { enabled: true, onlyInViewport: true },
    pagination: {
      el: '.section3 .swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      720: {
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 30,
        slidesOffsetAfter: 0,
      },
      768: {
        spaceBetween: 30,
        slidesOffsetAfter: 340,
      },
      1024: {
        spaceBetween: 50,
        slidesOffsetAfter: 240,
      },
      1500: {
        spaceBetween: 80,
        slidesOffsetAfter: 340,
      },
    },
  });

  const section5Swiper = new Swiper('.section5 .slider-wrapper', {
    slidesPerView: 'auto',
    slidesOffsetBefore: 370,
    slidesOffsetAfter: 120,
    spaceBetween: 5,
    loop: false,
    speed: 800,
    autoHeight: true,
    pagination: false,
    navigation: false,
    mousewheel: {
      thresholdDelta: 50,
      releaseOnEdges: true,
      eventsTarget: '.section3',
    },
    breakpoints: {
      1024: {
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 30,
      },
      1400: {
        slidesOffsetBefore: 200,
        slidesOffsetAfter: 120,
      },
      1600: {
        slidesOffsetBefore: 270,
        slidesOffsetAfter: 120,
      },
      1800: {
        slidesOffsetBefore: 310,
        slidesOffsetAfter: 120,
      },
    },
  });
};

$(document).on('ready', function () {
  $(document).on('click', '.faq-list li a.question', function (e) {
    e.preventDefault();

    const $currentLi = $(this).closest('li');
    const $currentAnswer = $currentLi.find('.answer');

    $currentLi.toggleClass('active');
    $currentAnswer.stop(true, true).slideToggle(300);
  });

  $(document).on('click', '.sticky-images .photo-link', function (e) {
    e.preventDefault();

    const $currentLi = $(this).closest('li');
    const $allLis = $('.sticky-images ul > li');
    const currentIndex = $allLis.index($currentLi);
    const nextIndex = (currentIndex + 1) % $allLis.length;
    const $nextLi = $allLis.eq(nextIndex);

    $allLis.removeClass('active');
    $nextLi.addClass('active');
  });

  AOS.init();
});

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initSwiperSlider();

  setTimeout(() => {
    chosenTitleMotion();
  }, 300);

  setTimeout(() => {
    visualMotion();
    initSection3HorizontalScroll();
  }, 1500);
});
