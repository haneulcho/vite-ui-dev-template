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
});

$window.on('resize', function () {});
