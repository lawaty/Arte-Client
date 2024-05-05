$(document).on('membership-loaded', () => {
  if (Store.state.currentPage == 'login')
    Store.loadComponent('membership/login', "#form")
  else if (Store.state.currentPage == 'register')
    Store.loadComponent('membership/register', "#form")
  else
    error("unexpeced state: " + Store.state.currentPage)
})