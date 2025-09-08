/* eslint-disable no-undef */
var $window = $(window);

$(document).on('ready', function () {
  // FAQ 아코디언 기능
  $(document).on('click', '.faq-list li a.question', function (e) {
    e.preventDefault();

    const $currentLi = $(this).closest('li');
    const $currentAnswer = $currentLi.find('.answer');

    $currentLi.toggleClass('active');
    $currentAnswer.stop(true, true).slideToggle(300);
  });

  // Section6 Sticky Images 클릭 기능
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

// CHOSEN 글자 애니메이션 초기화 함수
const initChosenAnimation = () => {
  const titleElements = document.querySelectorAll('.section1-1 .main-title');

  if (titleElements.length === 0) return;

  // GSAP을 사용한 순차 애니메이션 (반동 효과 포함)
  gsap.to(titleElements, {
    y: 0,
    duration: 1.35,
    ease: 'elastic.out(1, 0.3)', // 반동 효과
    stagger: 0.1,
    delay: 0.1, // 페이지 로드 후 0.5초 후 시작
  });
};

// Diamond pulse 애니메이션 초기화 함수
const initDiamondAnimation = () => {
  const diamondElements = document.querySelectorAll('.section1-1 .diamond, .section1-2 .diamond');

  if (diamondElements.length === 0) return;

  // 각 diamond에 pulse + rotation 애니메이션 적용
  diamondElements.forEach((diamond, index) => {
    gsap.to(diamond, {
      scale: 1.2,
      rotation: 10,
      duration: 0.6,
      ease: 'power2.inOut',
      yoyo: true, // 되돌아오기
      repeat: -1, // 무한 반복
      delay: index * 0.3, // 각각 다른 시점에 시작
    });
  });
};

const visualMotion = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.app-section.section1',
      // start: () => `top top+=${headerH}`, // 헤더만큼 아래에서 핀 시작
      start: 'top top',
      end: '+=50%', // 스크롤 구간 길이 (체감에 맞게 120~200% 사이로 조절)
      scrub: 0.8, // 스크럽(부드럽게 이어짐)
      pin: true, // 고정
      pinSpacing: window.innerWidth >= 720 ? true : false, // pin 동안 아래 컨텐츠 밀어내기 (필요 없으면 false)
      // pinSpacing: false,
      // anticipatePin: 1, // 핀 직전 점프 방지
      // invalidateOnRefresh: true, // 리사이즈/로딩 후 재계산
      // onLeave: () => {
      //   gsap.set('.section1-1', { autoAlpha: 0, display: 'none' });
      //   gsap.set('.section1-2', { autoAlpha: 1 });
      // },
      // onLeaveBack: () => {
      //   gsap.set('.section1-1', { autoAlpha: 1, display: '' });
      //   gsap.set('.section1-2', { autoAlpha: 0 });
      // },
    },
  });

  // 진행 중 애니메이션(스크럽과 연동)
  tl.to('.section-trans-bg.bg2', { yPercent: 0, ease: 'none' }, 0);

  tl.add('cross', 0.75)
    .to('.section1-1', { autoAlpha: 0, duration: 0.25, ease: 'none' }, 'cross')
    .set('.section1-1', { display: 'none', pointerEvents: 'none' })
    .to('.section1-2', { autoAlpha: 1, duration: 0.3, ease: 'none' }, '>-0.1');
};

window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
  ScrollTrigger.refresh();
});

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 초기 상태 세팅 (flash 방지)
  gsap.set('.section-trans-bg.bg2', { yPercent: 100, willChange: 'transform' });

  // CHOSEN 글자 애니메이션 초기화
  initChosenAnimation();

  // Diamond pulse 애니메이션 초기화
  initDiamondAnimation();

  setTimeout(() => {
    visualMotion();
  }, 500);

  // Section3 Swiper 초기화
  const section3Swiper = new Swiper('.section3 .slider-wrapper', {
    slidesPerView: 'auto',
    spaceBetween: 104,
    slidesOffsetAfter: 500,
    speed: 600,
    autoHeight: true,
    navigation: false,
    mousewheel: {
      thresholdDelta: 50, // 한 번에 한 장 느낌 (30~80 사이로 취향 조절)
      releaseOnEdges: true, // 끝에선 페이지 스크롤로 넘어가게
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

  // Section5 Swiper 초기화
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
      thresholdDelta: 50, // 한 번에 한 장 느낌 (30~80 사이로 취향 조절)
      releaseOnEdges: true, // 끝에선 페이지 스크롤로 넘어가게
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
});
