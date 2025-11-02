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

$(document).on('ready', function () {});

document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});
