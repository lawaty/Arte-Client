const loader = {
  active: [],
  length: 0,
  UPDT_DELAY: 1500,
  container: "#loaders",
  silent: true,

  __sanitize: function (operation) {
    if (operation.includes(":"))
      error(`loader text have not to contain any colons: found in '${operation}'`)

    return operation.toLowerCase().trim().replaceAll(' ', '_').replaceAll(':', '');
  },

  __display: function (operation) {
    return operation.replaceAll('_', ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  },

  start: function (operation) {
    operation = this.__sanitize(operation);

    if (this.active[operation] !== undefined) {
      if (!this.silent) {
        error(`Cannot start operation '${operation}': Already Loading`);
      }
      return;
    }

    this.active[operation] = new Ndate();
    this.length++

    $(this.container).show();

    $(this.container).append(`
      <div class="loader-container" style="display: none" id="loading-${operation}">
        <div class="spin"></div>
        <p id="loader-text" class="loader-text">${this.__display(operation)}</p>
      </div>
    `);
    $(`#loading-${operation}`).fadeIn();
  },

  stop: function (operation) {
    operation = this.__sanitize(operation);

    if (this.active[operation] === undefined && !this.silent) {
      error(`Cannot stop loading operation '${operation}': Already Not Loading`);
    }

    let now = new Ndate();
    let time_elapsed = now.diff(this.active[operation]);
    if (time_elapsed.total_millis < this.UPDT_DELAY) {
      setTimeout(loader.stop.bind(this, operation), (this.UPDT_DELAY - time_elapsed.total_millis));
      return;
    }

    $(`#loading-${operation}`).fadeOut(600);

    delete this.active[operation];
    this.length--

    if (!this.length)
      setTimeout(function () { $(this.container).hide() }, 1000)
  }
};
