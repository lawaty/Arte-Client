const Store = {
  data: {},
  loaders: {},
  mutex: [],
  state: {},

  init: function () {
    this.state = new Proxy(this.state, {
      set: (obj, prop, value) => {
        obj[prop] = value
        let data = {}
        data[prop] = value
        $(document).trigger(`${prop}-change`, data)
        return true
      },
      get: (obj, prop) => {
        return obj[prop]
      }
    })

    config.APP = (config.BASE + '/app').replace(/^\/+/, '');
    config.CORE = (config.BASE + '/core').replace(/^\/+/, '');
    config.ASSETS = (config.APP + '/assets').replace(/^\/+/, '');
  },
  def: function (something, loader) {
    if (!loader instanceof Promise)
      error(`loader for ${something} is not a promise`)

    this.__loaders[something] = loader
  },
  get: function (something, force_fetch = false, options = {}) {
    /**
     * @note Never forget to clean mutex whenever you edit this function, pleeeease !
     */
    return new Promise((resolve, reject) => {
      if (this.mutex.includes(something)) {
        setTimeout(() => {
          this.get(something, force_fetch).then(resolve).catch(reject);
        }, 200)

        return;
      }

      this.mutex.push(something)

      if (this.data[something]) {
        resolve(this.data[something])
        this.mutex = this.mutex.filter(element => element !== something)
      }

      else if (this.loaders.something)
        this.loaders.something().then((data) => {
          if (data) {
            this.data[something] = data
            resolve(data)
            this.mutex = this.mutex.filter(element => element !== something)
          }
          else {
            error(`Failed to load ${something}: No data received from the loader`)
            reject()
            this.mutex = this.mutex.filter(element => element !== something)
          }
        })

      else if (force_fetch) {
        AJAX.ajax({
          url: something,
          type: "GET",
          ...options,
          complete: {
            200: (xhr) => {
              this.data[something] = xhr.responseText
              resolve(this.data[something])
            },
            0: (xhr) => {
              error(`Failed to load ${something}: ${xhr.status}`)
              reject()
            }
          },
          onLeave: (xhr) => {
            this.mutex = this.mutex.filter(element => element !== something)
          }
        })
      }
      else {
        error(`No any provided way to fetch ${something}`)
        reject()
        this.mutex = this.mutex.filter(element => element !== something)
      }
    });
  },
  /**
   * 
   * @param {string} path - path to html file
   * @param {string|object} target - string selector or jquery object
   * @returns {Promise<string>} - resolves with a html string argument
   */
  loadHTML(path, target) {
    return new Promise((resolve, reject) => {
      if (!path.endsWith('.html')) {
        error(`Received a wrong html path: ${path}`)
        reject()
        return
      }

      this.get(path, true).then((html) => {
        try {
          html = html.replaceAll(/{{(.*?)}}/g, (match, exp) => { return eval(exp) })
        }
        catch (e) {
          error(e)
          // 7asal 5er
        }
        $(target).html(html)
        resolve(html)

      }).catch(function () {
        error('failed to fetch html for ' + path)
        reject()
      })
    })
  },
  /**
   * 
   * @param {string} path - path to js file
   * @returns {Promise<undefined>} - resolves with a html string argument
   */
  loadJS(path) {
    return new Promise((resolve) => {
      if (!path.endsWith('.js')) {
        error(`Received a wrong js path: ${path}`)
        return
      }
      let reformatted
      if (path.includes('app/'))
        reformatted = path.split('app/')[1].replaceAll('/', '-').split('.')[0]
      else if (path.includes('core/'))
        reformatted = path.split('core/')[1].replaceAll('/', '-').split('.')[0]
      else
        reformatted = path.replaceAll('/', '-').split('.')[0]

      if ($(`script#${reformatted}`).length) {
        let filename = path.split('/').pop()
        $(document).trigger(`${filename}-loaded`)
        $(document).trigger(`${reformatted}-loaded`)
        resolve()
        return
      }

      this.get(path, true, { dataType: "text" }).then(js => {
        if (!$(`script#${reformatted}`).length)
          $("body").append(`<script id="${reformatted}" type="text/javascript">"use strict"
${js}

//# sourceURL=${path}
</script>`);

        resolve()
        let filename = path.split('/').pop()
        $(document).trigger(`${filename}-loaded`)
        $(document).trigger(`${reformatted}-loaded`)
      }).catch(function () {
        error("Couldn't fetch js from path " + path)
      })
    })
  },
  /**
   * Loads a component's HTML and JavaScript files dynamically into the specified target element.
   * 
   * @param {string} path - The path to the component's directory.
   * @param {string|object} target - The selector or jQuery object representing the target element 
   *                                  where the component's HTML will be injected.
   * @returns {Promise} - A Promise that resolves when the component's HTML and JavaScript files have been loaded 
   *                      successfully, or rejects if there's an error during the loading process.
   */
  loadComponent(path, target, with_css = false) {
    target = $(target)
    return new Promise((resolve) => {
      let comp = path.split('/').pop(); // Extract component name from path

      if (comp != '404')
        path = `${config.BASE}/app/${path}`.replace('//', '/');
      else
        path = `/${config.CORE}/${path}`.replace('//', '/');

      let reformatted
      if (path.includes('app/'))
        reformatted = path.split('app/')[1].replaceAll('/', '-').split('.')[0]
      else if (path.includes('core/'))
        reformatted = path.split('core/')[1].replaceAll('/', '-').split('.')[0]
      else
        reformatted = path.replaceAll('/', '-').split('.')[0]

      if (with_css && !$(`link#${reformatted}`).length)
        $("head").append(`<link rel="stylesheet" id="${reformatted}" href="${path}/${comp}.css">`);

      this.loadHTML(`${path}/${comp}.html`, target)
        .then((html) => {
          return this.loadJS(`${path}/${comp}.js`);
        })
        .then(() => {
          $(document).trigger(`${comp}-loaded`);
          $(document).trigger(`component-loaded`);
          resolve()
        })
    })
  }

}

function redirect(page, reload = false) {
  if (reload)
    window.location.href = `${config.BASE}/${page}`.replace(/^\/+/, '');
  else
    Store.state.currentPage = page
}

Store.init()