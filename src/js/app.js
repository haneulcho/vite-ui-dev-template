/* eslint-disable no-undef */
var $window = $(window);

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

$window.on('resize', function () {});

const chosenTitleMotion = () => {
  const titleElements = document.querySelectorAll('.section1-1 .main-title');

  if (titleElements.length === 0) return;

  gsap.to(titleElements, {
    y: 0,
    duration: 1.35,
    ease: 'elastic.out(1, 0.3)',
    stagger: 0.1,
    delay: 0.1,
  });

  setTimeout(() => {
    $('.section1 .diamond').addClass('active');
  }, 900);
};

const visualMotion = () => {
  // portrait이고 innerWidth가 540 미만일 때 pin, pinSpacing을 false로 처리
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const isSmallWidth = window.innerWidth < 540;

  // const tl = gsap.timeline({
  //   scrollTrigger: {
  //     trigger: '.app-section.section1',
  //     start: 'top top',
  //     end: isPortrait ? 'top+=250% bottom+=130%' : '+=110%',
  //     pinSpacing: isPortrait && isSmallWidth ? true : window.innerWidth >= 1024 ? true : false,
  //     scrub: 1,
  //     pin: true,
  //     anticipatePin: 1,
  //     invalidateOnRefresh: true,
  //   },
  // });

  // tl.to('.section-trans-bg.bg2', { yPercent: 0, ease: 'none' }, 0);

  // tl.add('cross', 0.75)
  //   .to('.section1-1', { autoAlpha: 0, duration: 0.25, ease: 'none' }, 'cross')
  //   .set('.section1-1', { display: 'none', pointerEvents: 'none' })
  //   .to('.section1-2', { autoAlpha: 1, duration: 0.3, ease: 'none' }, '>-0.15');

  const section1 = document.querySelector('.app-section.section1');

  if (section1) {
    window.addEventListener('scroll', () => {
      const isHeaderLoaded = $('#header');

      if (!isHeaderLoaded) return;

      const section1Height = section1.offsetHeight;
      const triggerRatio = $window.width() <= 1000 ? 0.085 : 0.12;
      const triggerPoint = section1Height * triggerRatio;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop >= triggerPoint) {
        if (!$('.app-section.section1').hasClass('active')) {
          $('.app-section.section1').addClass('active');
        }
      } else {
        $('.app-section.section1').removeClass('active');
      }
    });
  }
};

const shortsMotion = () => {
  const isSmallWidth = window.innerWidth < 1200;

  if (!isSmallWidth) {
    gsap.set('.section2-trans-shorts', { yPercent: 100, willChange: 'transform' });

    const t2 = gsap.timeline({
      scrollTrigger: {
        trigger: '.app-section.section2',
        start: 'center center',
        end: '+=80%',
        pinSpacing: true,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    t2.to('.section2-trans-shorts', { yPercent: 0, ease: 'none' }, 0);
  }
};

// window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
//   ScrollTrigger.refresh();
// });

document.addEventListener('DOMContentLoaded', () => {
  // gsap.registerPlugin(ScrollTrigger);

  chosenTitleMotion();

  setTimeout(() => {
    visualMotion();
    // shortsMotion();
  }, 500);

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

  // section3 가로 스크롤 기능
  const initSection3HorizontalScroll = () => {
    const section3 = document.querySelector('.section3 .overflow-slider-wrapper');
    const overflowSliderContents = document.querySelector('.overflow-slider-contents');

    if (!section3 || !overflowSliderContents) return;

    let isScrolling = false;
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
    window.addEventListener('resize', calculateMaxScroll);

    // 마우스 휠 이벤트
    section3.addEventListener('wheel', e => {
      const deltaY = e.deltaY;
      const deltaX = e.deltaX;
      const scrollSpeedX = 30; // 스크롤 속도 조절
      const scrollSpeedY = 50; // 스크롤 속도 조절

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
    });

    // 터치 이벤트 추가
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchScrolling = false;

    section3.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isTouchScrolling = false;
    });

    section3.addEventListener('touchmove', e => {
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
    });

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

  // DOM 로드 후 초기화
  initSection3HorizontalScroll();
});
