const ArteRouter = {
  loaded: {},
  routes: [],
  init: function () {
    this.routes = config.routes ?? []
    this.listen()

    Store.state.currentPage = this.readURI()
  },
  listen: function () {
    // Route whenever currentPage changes
    $(document).on('currentPage-change', (event, data) => {
      this.updateURI(data.currentPage);
      this.route()
    })

    // Handle navigation
    $(document).on('click', 'a', function (event) {
      event.preventDefault();

      var route = $(this).attr('href');
      if (Store.state.currentPage && route == Store.state.currentPage)
        return;

      if (event.ctrlKey || event.metaKey)
        window.open(route, '_blank');
      else
        Store.state.currentPage = route;
    });

    // Handle back/forward buttons
    $(window).on('popstate', () => {
      Store.state.currentPage = this.readURI()
    });
  },

  route: function (route) {
    if (!route)
      route = Store.state.currentPage

    route = route.replace(/^\/+|\/+$/g, '');

    let path = route
    let pattern = this.__match(route)
    if (pattern !== null) {
      path = this.routes[pattern]
      this.__extractParams(pattern, route)
    }
    else
      path = "404"

    Store.loadComponent(path, "#content")
  },

  __match: function (route) {
    for (const pattern in this.routes) {
      const regex = new RegExp("^" + pattern.replace(/:\w+/g, "(\\w+)") + "$");
      if (regex.test(route))
        return pattern;
    }
    return null; // No match found
  },

  __extractParams: function (pattern, route) {
    let sections = pattern.split('/')
    for (let i in sections) {
      if (sections[i].startsWith(':')) {
        let prop = sections[i].split(':')[1]
        let value = route.split('/')[i]
        Store.state[prop] = value
      }
    }
  },

  readURI: function () {
    return window.location.pathname.split(config.BASE)[1].replace(/^\/+|\/+$/g, '');
  },

  updateURI: function (uri) {
    window.history.pushState(null, null, `/${config.BASE}/${uri}`);
  }
}

ArteRouter.init()