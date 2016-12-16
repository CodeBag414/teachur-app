$(window).load(function () {
  $(".zoom-images").zoomScroller({
    animationTime: 2000,
    easing: "ease",
    initZoom: 1.15,
    zoom: 1
  });
});

$(document).ready(function () {

  $("body").addClass("js");

  $('#mc-embedded-subscribe').click(function () {
    var data = $('#mce-EMAIL').val();

    $.ajax({
      url: window.location.origin + '/api/waiting-list',
      type: 'POST',
      data: {email: data}
    }).done(function () {
      swal("Congrats!", "Your request has been sent and will be approved soon", "success");
    }).fail(function () {
      swal({
        title: "Error!",
        text: "You have already sent the request, or haven't passed the email",
        type: "error"
      });
    }).always(function () {
      $('#mce-EMAIL')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');
    });
  });

  $("a.scrollto").click(function (e) {
    e.preventDefault();
    var el = $($(this).attr("href"));

    $('html, body').animate({
      scrollTop: el.offset().top - 53
    }, 1000);
  });

  $("#select-options a").click(function (e) {
    $("#select-options li").removeClass("active");
    $(this).parent().addClass("active");
    $("body").attr("class", "");
    $("body").addClass("fus-" + $(this).attr("href").substring(1));
  });

  $("#searchForm").submit(function (e) {
    e.preventDefault();
    var searchText = $("#searchText").val();
    window.location.href = '/app#/search?searchText=' + searchText;
  });

  $(window).scroll(function () {

    if ($(this).scrollTop() > 695) {
      $(".navbar").addClass("fus-navbar-solid");
      $(".navbar-search").addClass("small-padding");
    } else {
      $(".navbar").removeClass("fus-navbar-solid");
      $(".navbar-search").removeClass("small-padding");
    }

  });

});