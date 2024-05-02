const Store = {
  data: {},
  loaders: {},
  state: {},

  init: function() {
    this.state = new Proxy(this.state, {
      set: (obj, prop, value) => {
        obj[prop] = value
        let data = {}
        data[prop] = value
        $(document).trigger(`${prop}-change`, data)
      },
      get: (obj, prop) => {
        return obj[prop]
      }
    })
  },
  def: function (something, loader) {
    if (!loader instanceof Promise)
      error(`loader for ${something} is not a promise`)

    this.__loaders[something] = loader
  },
  get: function (something, force_fetch = false) {
    return new Promise(function (resolve, reject) {
      if (this.data[something])
        resolve(this.data[something])
      else if (this.loaders.something)
        this.loaders.something().then((data) => {
          if (data) {
            this.data[something] = data
            resolve(data)
          }
          else {
            error(`Failed to load ${something}: No data received from the loader`)
            reject()
          }
        })
      else if (force_fetch) {
        AJAX.ajax({
          url: something,
          type: "GET",
          complete: {
            200: (xhr) => {
              this.data[something] = xhr.responseText
              resolve(this.data[something])
            },
            0: (xhr) => {
              error(`Failed to load ${something}: ${xhr.status}`)
              reject()
            }
          }
        })
      }
      else {
        reject()
      }
    }.bind(this));
  },

  loadComponent(path, target) {
    // loading css
    if(path.includes("/"))
      comp = path.split('/')[path.split('/').length - 1]
    else
      comp = path

    let reformatted = path.replaceAll('/', '-')
    if (!$(`link#${reformatted}-css`).length)
      $("head").append(
        `<link rel="stylesheet" id="${reformatted}-css" href="/${config.BASE}/${path}/${comp}.css">`
      );

    // loading html
    Store.get(`/${config.BASE}/${path}/${comp}.html`, true).then((html) => {
      $(target).html(html)

      if (!$(`script#${reformatted}-js`).length)
        fetch(`/${config.BASE}/${path}/${comp}.js`).then(res => {
          res.text().then(js => {
            $("body").append(`
            <script id="${reformatted}-js" type="text/javascript">
              ${js}

              //# sourceURL=${path}/${comp}.js
            </script>`);

          }).then(function () {
            $(document).trigger(`${comp}-loaded`) 
          })
        })
      else
        $(document).trigger(`${comp}-loaded`)
    })
  }
}

Store.init()