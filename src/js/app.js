var $window = $(window);

$(document).on('ready', function () {
  // FAQ 아코디언 기능
  // 여러 개의 질문이 동시에 열릴 수 있도록 slideToggle 사용
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

    // 모든 li에서 클래스 제거
    $allLis.removeClass('active');
    // 다음 이미지에 active 클래스 추가 (CSS delay로 자연스럽게 나타남)
    $nextLi.addClass('active');
  });
});

$window.on('resize', function () {});
