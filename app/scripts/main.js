$(document).ready(function() {

  // change to something better
  if($('#creator').length) {
    document.ontouchmove = function(e) {e.preventDefault()};
  }


  var breakpoint = {};

  var creatorDesignElementsHeight = 0;

  var $creatorDesignElements = $('.creator-design-elements'),
    $creatorActions = $('.creator-actions'),
    $creatorActionsHeader = $('.creator-actions__header'),
    $creatorActionsFooter = $('.creator-actions__footer');

  breakpoint.refreshValue = function () {
    this.value = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '');
  };

  $('.creator-design-elements__list').slick({
    slidesPerRow: 4,
    slidesToShow: 4,
    slidesToScroll: 4,
    infinite: false,
    edgeFriction: 0.6,
    speed: 160
  });

  var actionsHeight = 0;


  $(window).on("resize",function(){

    breakpoint.refreshValue();

    if(breakpoint.value != "phone") {
      $('.creator-design-elements__list').slick('unslick');
    } else {
      actionsHeight = window.innerHeight - $creatorActions.height();
      $('.creator-product').css('height',actionsHeight);
    }

    //console.log(actionsHeight);

  }).resize();



  /*
   SIDENAV
   */

  $('.side-nav__item a').hover(function() {
    var menuItem = $(this); //.addClass('is-active');
    var menu = $(menuItem.data('trigger')).toggleClass('is-visible');
    /*if(menu.hasClass('is-visible')) {
      menu.mouseout(function() {
        console.log('test');
        menuItem.removeClass('is-active');
      });
    }*/
  });


  /*
   DIALOG
   */

  var dlgtriggers = document.querySelectorAll('[data-dialog]');


  if(dlgtriggers) {
    [].forEach.call(dlgtriggers, function(dlgtrigger) {

      somedialog = document.getElementById(dlgtrigger.getAttribute('data-dialog')),
        dlg = new DialogFx(somedialog);

      dlgtrigger.addEventListener('click', dlg.toggle.bind(dlg));
    });
  }


  /*
    SAVE FORM (pleeassseee make this better)
   */

  $('#creator-save').click(function(e) {
    e.preventDefault();
    $('.creator-actions__save').addClass('is-open');
    $('#cancel').click(function (e) {
      $('.creator-actions__save').removeClass('is-open');
    });
  });

  /*
   TOOLBAR (pleeassseee make this better)
   */

  var popout = false,
      open = false;

  $('.creator-toolbar__item').click(function(e) {
    e.preventDefault();
    if(open) {
      open.removeClass('is-active');
    }
    open = $(this).addClass('is-active');
    if(!popout) {
      $('.creator-design').addClass('has-popout');
    }
    $(open.data('open')).toggleClass('is-active');
  });

  /*
    INTERACTIONS DESIGN ELEMENTS
   */

  interact('.draggable').draggable({
    'manualStart' : true,
    'restrict': {
      restriction: '#drop-container'
    },
    inertia: {
      resistance: 30,
      minSpeed: 200,
      endSpeed: 100
    },
    'onmove' : function (event) {

      var target = event.target;

      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);

    },
    'onend' : function (event) {

      //console.log('Draggable: ', event);

    }
  }).on('move', function (event) {

    var interaction = event.interaction;

    // if the pointer was moved while being held down
    // and an interaction hasn't started yet
    if (interaction.pointerIsDown && !interaction.interacting() && event.currentTarget.classList.contains('drag-element-source')) {

      var original = event.currentTarget,
          position = original.getBoundingClientRect();

      // create a clone of the currentTarget element
      var clone = event.currentTarget.cloneNode(true);

      // Remove CSS class using JS only (not jQuery or jQLite) - http://stackoverflow.com/a/2155786/4972844
      clone.className = clone.className.replace(/\bdrag-element-source\b/,'');

      // Position the clone correctly
      $(clone).css({
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: original.offsetWidth,
        height: original.offsetHeight
      }).addClass('drag-element-clone')
        .append('<div class="resize-handle resize-handle--top-left"></div>');

      document.getElementById('creator').appendChild(clone);

      interaction.start({ name: 'drag' }, event.interactable, clone);

    } else {

      interaction.start({ name: 'drag' }, event.interactable, event.currentTarget);

    }

  }).resizable({
      preserveAspectRatio: true,
      edges: {
        left: '.resize-handle--top-left',
        right: false,
        bottom: false,
        top: false
      }
  }).on('resizemove', function (event) {
      var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width  = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    });


// enable draggables to be dropped into this
  interact('#drop-container').dropzone({
    // only accept elements matching this CSS selector
    accept: '.draggable',
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.75,

    // listen for drop related events:
    ondropactivate: function (event) {

      // add active dropzone feedback
      event.target.classList.add('drop-active');

    },
    ondragenter: function (event) {

      var draggableElement = event.relatedTarget;
      var dropzoneElement = event.target;

      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target');
      draggableElement.classList.add('can-drop');

    },
    ondragleave: function (event) {

      // remove the drop feedback style
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');

    },
    ondrop: function (event) {

      console.log('Drop Zone: ', event);
      console.log('Dropped Element: ', event.relatedTarget);

      event.relatedTarget.classList.remove('can-drop');
      event.relatedTarget.classList.add('dropped');

    },
    ondropdeactivate: function (event) {

      // remove active dropzone feedback
      event.target.classList.remove('drop-active');
      event.target.classList.remove('drop-target');

    }
  });

  $('.form--contact').submit(function(e) {
    e.preventDefault();
    var form = $(this);
    $.ajax({
      url: "https://formspree.io/bert@metatalk.be",
      headers : {
        Accept : "application/json"
      },
      method: "POST",
      data: {
        name: form.find('#name').val(),
        email: form.find('#email').val(),
        company: form.find('#company').val()
      },
      dataType: "json"
    }).done(function() {
      fbq('track', 'Lead');
      form.parent().find('h2').text('Yihaaa!');
      form.html('<p class="message message--success">We got your message! Expect a reply from us very soon.</p>');
    }).always(function(e) {
      console.log(e);
    });

  });



});