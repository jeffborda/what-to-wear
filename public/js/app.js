'use strict';

$(() => {

  $('.hamburger-nav').on('click', ()=> {

    // $('.menu').fadeToggle('slow').toggleClass('menu-hide');

    $('.menu').animate({
      height: 'toggle'
    });

  });

});
