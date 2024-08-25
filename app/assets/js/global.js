"use strict"

AJAX.default_handlers[400] = (xhr) => {
  Swal.fire({
    icon: "error",
    text: xhr.responseText
  })
}

AJAX.default_handlers[0] = (xhr) => {
  Swal.fire({
    icon: "error",
    text: "Something Went Wrong"
  })
}

AJAX.default_handlers[401] = (xhr) => {
  Swal.fire({
    icon: "warning",
    text: "Session Expired, Login again, please"
  }).then(() => {
    local.remove('user')
    redirect('login')
    return ;
  })
}

const user = local.get('user') ? JSON.parse(local.get('user')) : undefined

// ------ template pluginCustomization.js
$(document).on('component-loaded', () => {
  // nice select 
  $('select').niceSelect();

  //Preloader
  setTimeout(function () {
    $('#preloader').fadeOut();
  }, 1000);
})