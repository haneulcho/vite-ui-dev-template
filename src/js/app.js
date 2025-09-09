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

  // section1 height의 10%를 지났을 때 console.log 찍기
  if (section1) {
    // TweenMax 타임라인으로 묶어서 순차적으로 실행
    // gsap.set('.section-trans-bg.bg2', { yPercent: 100, willChange: 'transform' });

    window.addEventListener('scroll', () => {
      const isHeaderLoaded = $('#header');

      if (!isHeaderLoaded) return;

      const section1Height = section1.offsetHeight;
      const triggerRatio = $window.width() <= 1000 ? 0.085 : 0.13;
      const triggerPoint = section1Height * triggerRatio;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop >= triggerPoint) {
        console.log('section1 height의 10%를 지났습니다!');

        if (!$('.app-section.section1').hasClass('active')) {
          $('.app-section.section1').addClass('active');
        }

        // var tl = new TimelineMax();
        // tl.to('.section-trans-bg.bg2', 1, { yPercent: 0, ease: Power0.easeNone }, 0)
        //   .to('.section1-1', 0.25, { autoAlpha: 0, ease: Power0.easeNone }, 0.75)
        //   .set('.section1-1', { opacity: 0, pointerEvents: 'none' }, 1)
        //   .to('.section1-2', 0.3, { autoAlpha: 1, ease: Power0.easeNone }, '>-0.1');
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

  visualMotion();
  chosenTitleMotion();

  setTimeout(() => {
    // shortsMotion();
  }, 1000);

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
});
