// TIMEOUT LOOPS:
//     - https://www.wired.com/2010/02/advanced_javascript_tutorial_-_lesson_3/#How_to_Cancel_a_setTimeout

// WRONG INDICATOR SELECTED
// ABSTRACT REPEATED CSS BACKGROUNDS INTO VARIABLE OR FUNCTION
// RESEARCH ON HOW TO TIDY UP THE CODE INTO NAMESPACES

var photos = ["images/placeholder.jpg"];    // photo by LS CHU http://www.designskilz.com/awesome-photography-inspiration-34/
// https://www.yahoo.com/sy/uu/api/res/1.2/xbZCV3z1AkGiJ5SVioyBjg--/Zmk9c3RyaW07aD0xOTg7cHlvZmY9MDtxPTgwO3c9MzgwO3NtPTE7YXBwaWQ9eXRhY2h5b24-/https://s.yimg.com/av/moneyball/ads/1485953184339-7524.jpg.cf.jpg
var pos = 0;
var awaitingAnimation = 0;
var editing = false;
var timeout;

var rotateCarousel = function() {
    timeout = setTimeout(function() {

        if ( $('.photo').eq(0).is(':animated') ) {
            awaitingAnimation = "#right";
        } else {
            slideRight();
        }

        rotateCarousel();
    }, 3000)
}

var stopRotation = function() {
    clearTimeout(timeout);
}

var index = function(offset = 0) {
  var i = (pos + offset) % photos.length ;
  return i >= 0 ? i : photos.length + i;
}

var formatSlide = function(position) {
    var $slide = $('<li class="photo"></li>')
                 .css({ 'background': 'url("' + photos[index()] + '") no-repeat center',
                        'background-size': 'cover',
                        'marginLeft': position * 500 - 500  // +1: 0px; -1: -1000px;
                      });

    switch(position) {
        case +1: $('#slider').append($slide); break;
        case -1: $('#slider').prepend($slide); break;
        default:
            $('.photo').css({ 'background': 'url("' + photos[0] + '") no-repeat center',
                              'background-size': 'cover',
                              'marginLeft': position
                           });
    }
    //direction === +1 ? $('#slider').append($slide) : $('#slider').prepend($slide);
}

var slide = function(direction, start, end, toRemove, speed) {
    formatSlide(direction);

    $('.photo').eq(0).animate({ 'marginLeft': end }, speed, function() {
      $('.photo').eq(toRemove).remove();

      if (awaitingAnimation !== 0) {
         $(awaitingAnimation).trigger('click');          //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          awaitingAnimation = 0;
      }
    });

    highlightIndicator();
}

var slideRight = function() {
    pos += 1;
    slide(+1, '0', '-1000px', 0, 1000);
}

var slideLeft = function() {
    pos -= 1;
    slide(-1, '-1000px', '0', 1, 1000);
}

var jumpTo = function(slide) {
    var oldPos = index();
    pos = slide.index();

    pos > oldPos ? slideRight() : slideLeft();
    highlightIndicator();
}

var changeText = function(element) {
    var hidden = $('#editbar').is(':hidden');

    if (hidden) {
        element.html('Save');
    } else {
        element.html('edit slideshow / esc');
    }

    element.toggleClass('edit save')
}

var toggleEditBar = function() {
    var $editbar = $('#editbar').css('display');

    if ($editbar === 'none') {                          // ie: opening
        editing = true;
        //stopRotation();
    } else {                                            //ie: closing
        photos = $('#editbar ul').sortable('toArray');
        editing = false;

        if (photos.length === 0) {
            photos.push("images/placeholder.jpg");
        }

        if (photos.length === 1) {
            $('#control').hide();
        } else {
            updateIndicatorQty(photos);
            $('#control').show();
        }

        $('input[type=text]').val("");
        $('#input p').remove();
        //rotateCarousel();
    }

    $('#editbar').slideToggle();
    slideRight();
}

var validate = function(path) {
    $('#input p').remove();
    addToSlideshow(path);

    var image = $('img[src="' + path + '"]');

    image.on('error', function() {
        $('#input').append('<p>Path not found</p>');
        $(this).parent().remove();
    });
}

var addToSlideshow = function(path) {
    var $newSlide = $('<li id="' + path + '"><img src="' + path + '" alt="Path not found."></li>')
    $('#editbar ul').append($newSlide);
}

var updateIndicatorQty = function(photos) {
    var $indicators = $('#indicators');

    $indicators.empty();

    for (i = 0; i < photos.length; i++) {
        $indicators.append('<li><div class="indicator"></div></li>');
    }
}

var highlightIndicator = function() {
    $indicators = $('#indicators div');
    $indicators.removeClass('highlight').addClass('indicator');
    $indicators.eq(index()).removeClass('indicator').addClass('highlight');
}



////////////////////////////////////////////////////////////////////////////////
var placeholder = photos[0];

$('.photo').css({ 'background': 'url("' + placeholder + '") no-repeat center',
                  'background-size': 'cover'
                });

addToSlideshow(placeholder);

$('#editbar ul').sortable();

$('#trash').droppable({
   drop: function(e, ui) {
      ui.draggable.remove();
  }
});

//-----------------------------------

$('#right').on("click", function() {
    if ( $('.photo').eq(0).is(':animated') )
        awaitingAnimation = '#right';
    else
        slideRight();
});

$('#left').on("click", function() {
    if ( $('.photo').eq(0).is(':animated') )
        awaitingAnimation = '#left';
    else
        slideLeft();
});

$('#indicators').on('mouseenter', function() {
    $('#viewSlide').slideDown('fast');
});

$('#indicators').on('mouseleave', function() {
    $('#viewSlide').slideUp('fast');
});

$('#indicators').on('mouseenter', 'li', function() {
    $('#viewSlide').css({ 'background': 'url("' + photos[$(this).index()] + '") no-repeat center',
                         'background-size': 'cover'
                       });
});

$('#indicators').on('click', 'li', function() {
    jumpTo($(this));
});

$('#frame').on('mouseenter', function() {
    stopRotation();
})

$('#frame').on('mouseleave', function() {
    if (!editing && photos.length > 1)
        rotateCarousel();
})

$('.edit').on('click', function() {
    if ( $('.photo').eq(0).is(':animated') ) {
        awaitingAnimation = ".edit";
    } else {
        changeText($(this))
        toggleEditBar();
    }

});

$('body').on('keypress', function(e) {
    if (e.keyCode === 27) {
        changeText($('.edit, .save'));
        toggleEditBar();
    }
});

$('input[type=text]').on('keypress', function(e) {
    var path = $(this).val();
    if (e.which === 13) {
        validate(path)
    }
});

$('input[type=submit]').on('click', function() {
    var path = $('input[type=text]').val();
    validate(path);
});

$('#editbar ul').on('dblclick', 'li', function() {
    var path = $(this).val();
    $(this).remove();
});

$('#remove').on('click', function() {
    $('#editbar ul').empty();
});
