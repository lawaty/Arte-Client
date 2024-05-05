function error(msg, type) {
  if (!msg) error("message is required", "RequiredArgumentNotFound");

  let error = new Error(msg);
  error.name = type ?? "Error";

  try {
    throw error;
  } catch (error) {
    console.warn(error.stack);
    return null;
  }
}

// Date and Time
// =============

/**
 * Ndate extends the built-in Date object to add some utility methods.
 *
 * @class
 */
class Ndate extends Date {
  /**
   * A subclass of the built-in Date class with additional functionality.
   * @class
   */

  /**
 * Adds a given number of days to the current date and returns the updated date object.
 *
 * @param {number} num_of_days - The number of days to add.
 * @returns {Ndate} The updated date object.
 */
  addHours(num_of_hours) {
    this.setTime(this.getTime() + num_of_hours * 60 * 60 * 1000);
    return this;
  }

  /**
   * Adds a given number of days to the current date and returns the updated date object.
   *
   * @param {number} num_of_days - The number of days to add.
   * @returns {Ndate} The updated date object.
   */
  addDays(num_of_days) {
    this.setDate(this.getDate() + num_of_days);
    return this;
  }

  /**
   * Adds a given number of weeks to the current date and returns the updated date object.
   *
   * @param {number} num_of_weeks - The number of weeks to add.
   * @returns {Ndate} The updated date object.
   */
  addWeeks(num_of_weeks) {
    this.setDate(this.getDate() + num_of_weeks * 7);
    return this;
  }

  /**
   * Adds a given number of months to the current date and returns the updated date object.
   *
   * @param {number} num_of_months - The number of months to add.
   * @returns {Ndate} The updated date object.
   */
  addMonths(num_of_months) {
    this.setMonth(this.getMonth() + num_of_months);
    this.setDate(1);
    return this;
  }

  /**
   * Returns a string representation of the date in ISO format (YYYY-MM-DD).
   *
   * @returns {string} The date in ISO format.
   */
  toString(with_time = false) {
    const offset = this.getTimezoneOffset();
    let temp = new Ndate(this.getTime() - offset * 60 * 1000);
    let result = temp.toISOString().split("T")[0];

    if (with_time)
      result += ` ${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`
    return result;
  }

  /**
   * Calculates the difference between the current date and the given date and returns an NInterval object representing the duration of the difference.
   *
   * @param {Ndate} date - The date to calculate the difference from.
   * @returns {NInterval} An NInterval object representing the duration of the difference.
   */
  diff(date) {
    return new NInterval({ millis: Math.abs(date - this) });
  }

  /**
   * Returns the index of the first day of the month (0-6) of the current date.
   *
   * @returns {number} The index of the first day of the month.
   */
  firstDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth(), 1).getDay();
  }

  /**
   * Returns the last day of the month of the current date.
   *
   * @returns {number} The last day of the month.
   */
  lastDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth() + 1, 0).getDate();
  }

  /**
   * Checks if the given date is the same as the current date.
   *
   * @param {Ndate} date - The date to compare to.
   * @returns {boolean} True if the dates are the same, false otherwise.
   */
  sameDate(date) {
    return (
      date.getFullYear() == this.getFullYear() &&
      date.getMonth() == this.getMonth() &&
      date.getDate() == this.getDate()
    );
  }

  /**
   * Returns the name of the month for the current date.
   *
   * @returns {string} The name of the month.
   */
  getMonthName() {
    const month = this.toLocaleString("default", { month: "long" });
    return month;
  }
}

const SEC_PER_MIN = 60;

const MS_PER_SEC = 1000;
const MS_PER_MIN = MS_PER_SEC * 60;
const MS_PER_HOUR = MS_PER_MIN * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

const MINS_PER_HOUR = 60;
const SEC_PER_HOUR = MINS_PER_HOUR * 60;

/**
 * A class that represents a duration of time, with properties for the duration in milliseconds, seconds,
 * minutes, hours, and days, and methods to format the duration as a clock string and construct a new
 * `NInterval` from a clock string.
 *
 * @class NInterval
 */
class NInterval {
  /**
   * Creates a new `NInterval` instance from an object with one of the following properties:
   * - `millis`: the duration in milliseconds
   * - `secs`: the duration in seconds
   * - `mins`: the duration in minutes
   *
   * @constructor
   * @param {Object} object - The object used to initialize the `NInterval` instance
   * @throws {Error} If the `object` parameter does not have a valid property
   */
  constructor(object) {
    if (object.hasOwnProperty("millis")) this.millis = object.millis;
    else if (object.hasOwnProperty("secs"))
      this.millis = object.secs * MS_PER_SEC;
    else if (object.hasOwnProperty("mins"))
      this.millis = object.mins * MS_PER_MIN;
    else throw new Error("Weird Input to NInterval: found" + object);

    this.total_millis = this.millis;

    this.days = parseInt(this.millis / MS_PER_DAY);
    this.millis -= this.days * MS_PER_DAY;

    this.hrs = parseInt(this.millis / MS_PER_HOUR);
    this.millis -= this.hrs * MS_PER_HOUR;

    this.mins = parseInt(this.millis / MS_PER_MIN);
    this.millis -= this.mins * MS_PER_MIN;

    this.secs = parseInt(this.millis / MS_PER_SEC);

    this.millis -= this.secs * MS_PER_SEC;
  }

  /**
   * Returns a formatted clock string representing the duration of this `NInterval` instance.
   * The string has the format "HH:MM:SS", where "HH" is the number of hours, "MM" is the number of minutes,
   * and "SS" is the number of seconds.
   *
   * @method formatClock
   * @returns {string} A formatted clock string representing the duration of this `NInterval` instance
   */
  formatClock() {
    let hours = this.hrs < 10 ? "0" + this.hrs : this.hrs;
    let minutes = this.mins < 10 ? "0" + this.mins : this.mins;
    let seconds = this.secs < 10 ? "0" + this.secs : this.secs;

    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Creates a new `NInterval` instance from a clock string with the format "HH:MM:SS",
   * where "HH" is the number of hours, "MM" is the number of minutes, and "SS" is the number of seconds.
   *
   * @static
   * @method fromClock
   * @param {string} clock - A clock string with the format "HH:MM:SS"
   * @returns {NInterval | null} A new `NInterval` instance representing the duration of the clock string
   */
  static fromClock(clock) {
    let regex = Regex.TIME;
    if (!regex.test(clock)) error("Invalid Clock Format");

    let seconds =
      parseInt(clock.split(":")[0]) * SEC_PER_HOUR +
      parseInt(clock.split(":")[1]) * SEC_PER_MIN +
      parseInt(clock.split(":")[2]);
    return new NInterval({ secs: seconds });
  }

  /**
   * Returns the total time in the specified unit.
   *
   * @param {string} unit - The unit to calculate the total time for. Valid values are "hrs", "mins", and "secs".
   * @returns {number} The total time in the specified unit, or -1 if the unit is invalid.
   */
  total(unit) {
    switch (unit) {
      case "hrs":
        return parseInt(this.hrs);
      case "mins":
        return parseInt(this.mins + this.hrs * 60);
      case "secs":
        return parseInt(this.secs + this.mins * 60 + this.hrs * 3600);
      default:
        return -1;
    }
  }
}
/* ---------------------------------------------------------------------- */

// Regex MACROS
// ============

/**
 * An object containing regular expressions for common validation purposes.
 * @typedef {Object} Regex
 * @property {RegExp} INT - Regular expression to validate an integer.
 * @property {RegExp} SINT - Regular expression to validate a signed integer.
 * @property {RegExp} ZERO_ONE - Regular expression to validate a zero or one value.
 * @property {RegExp} MONTH - Regular expression to validate a month (1-12).
 * @property {RegExp} DATE - Regular expression to validate a date in the format YYYY-MM-DD.
 * @property {RegExp} TIME - Regular expression to validate a time in the format HH:MM.
 * @property {RegExp} DATE_TIME - Regular expression to validate a date and time in the format YYYY-MM-DD HH:MM.
 * @property {RegExp} DATE_TIME_SEC - Regular expression to validate a date and time with seconds in the format YYYY-MM-DD HH:MM:SS.
 * @property {RegExp} DAY_TIME - Regular expression to validate a day and time in the format "Day HH:MM", where Day is one of Sun, Mon, Tue, Wed, Thu, Fri, Sat.
 * @property {RegExp} JWT - Regular expression to validate a JWT token.
 * @property {RegExp} LOGIN - Regular expression to validate a login string with Arabic script, letters, numbers, hyphens, and spaces.
 * @property {RegExp} EMAIL - Regular expression to validate an email address.
 * @property {RegExp} NAME - Regular expression to validate a name with Arabic script, letters, spaces.
 * @property {RegExp} PHONE - Regular expression to validate a phone number.
 * @property {RegExp} GRADE - Regular expression to validate a grade (1-12).
 * @property {RegExp} GENERIC - Regular expression to validate any string with Arabic script, letters, numbers, hyphens, parentheses, spaces.
 * @property {RegExp} ANY - Regular expression to validate any string.
 */
const Regex = {
  INT: /^[0-9]*$/,
  SINT: /^-?[0-9]*$/,
  ZERO_ONE: /^[0-1]$/,

  MONTH: /^([1-9]|1[0-2])$/,
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  TIME: /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DATE_TIME: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}$/,
  DATE_TIME_SEC: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DAY_TIME: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [0-9]{2}:[0-9]{2}$/,

  JWT: /^[\w-]*\.[\w-]*\.[\w-]*$/,
  LOGIN: /^[\p{Script=Arabic}\w\-. ]*$/gu,
  EMAIL: /^[\w_\-.]+@[\w]+\.[\w]*$/,
  NAME: /^[\p{Script=Arabic}\w ]*$/gu,
  PHONE: /^\+?[0-9]+$/,
  EG_PHONE: /^01[0-2]\d+$/,
  GRADE: /^([1-9]|1[0-2])$/,
  GENERIC: /^[\p{Script=Arabic}\u0020-\u002F\u005C\u005F\w_\-\)\(.+\s]*$/gu,
  ANY: /^.*$/,
};

/* ---------------------------------------------------------------------- */

// LocalStorage Wrapper
// ====================

const local = {
  /**
   * Retrieves a value from localStorage given its key.
   *
   * @memberof local
   * @function get
   * @param {string} key - The key of the value to retrieve.
   * @returns {string|false} - The value associated with the key, or false if the key doesn't exist.
   */
  get: function (key) {
    key = this.encrypt(`${config.APP}-${key}`);
    let result = localStorage.getItem(key);
    if (result !== null) return this.decrypt(result);
    return false;
  },
  /**
   * Retrieves all encrypted items from localStorage.
   *
   * @memberof local
   * @function getAll
   * @returns {Array} - An object contains all localStorage items
   */
  getAll: function (keys = []) {
    let items = {};
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      key = this.decrypt(key).split(config.APP + '-')[1]
      if (key && (!keys.length || keys.includes(key)))
        items[key] = this.get(key)
    }
    return items;
  },

  /**
   * Stores a key-value pair in localStorage.
   *
   * @memberof local
   * @function set
   * @param {string} key - The key of the value to store.
   * @param {string} value - The value to store.
   */
  set: function (key, value) {
    key = this.encrypt(`${config.APP}-${key}`);
    localStorage.setItem(key, this.encrypt(value));
  },

  /**
   * Removes a value from localStorage given its key.
   *
   * @memberof local
   * @function remove
   * @param {string} key - The key of the value to remove.
   */
  remove: function (key) {
    key = this.encrypt(`${config.APP}-${key}`);
    localStorage.removeItem(key);
  },

  setCookie: function (key, value, encrypt = false, path = "/") {
    if (encrypt) {
      key = this.encrypt(`${config.APP}-${key}`);
      value = this.encrypt(value);
    } else key = `${key}`;

    document.cookie = `${key}=${value}; path=${path}`;
  },

  getCookie: function (key, encrypt = false) {
    if (encrypt) key = this.encrypt(`${config.APP}-${key}`);
    else key = `${key}`;

    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.startsWith(key + "=")) {
        if (encrypt) return this.decrypt(cookie.substring(key.length + 1));
        else return cookie.substring(key.length + 1);
      }
    }
    return null;
  },

  removeCookie: function (key, encrypt = false) {
    if (encrypt) key = this.encrypt(`${config.APP}-${key}`);
    else key = `${key}`;
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  // encryption
  encrypt: function (text) {
    text = encodeURIComponent(text);
    var key = CryptoJS.enc.Utf8.parse(`Some_Key`); // Replace with your secret key
    var encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString().replace(/=+$/, "");
  },

  // decryption
  decrypt: function (ciphertext) {
    var key = CryptoJS.enc.Utf8.parse(`Some_Key`); // Replace with your secret key
    var decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decodeURIComponent(decrypted.toString(CryptoJS.enc.Utf8));
  },
};

/* ---------------------------------------------------------------------- */

class AJAX {
  /**
   * Class for customizing AJAX communications by setting default callback functions for ajax requests for improving consistency, centralization, and simplicity.
   * All default callbacks can be simply overriden by specifying new ones on calling AJAX.ajax({...}) just as $.ajax({...})
   */
  static default_handlers = {
    0: function () {
      alert('something went wrong')
    }
  }

  static onLeave = function (xhr) {
    // Silence is Gold
  }

  static beforeSend(xhr) {
    /**
     * Function that is called before sending ajax requests by default
     */
  }

  static complete(xhr, callbacks, url, data) {
    /**
     * Function that is called after ajax requests are completed by default (called for both success and error status)
     */

    try {
      xhr.parsed = JSON.parse(xhr.responseText);
    } catch (error) {
      xhr.parsed = [];
    }
    xhr.url = url
    xhr.data = data

    if (typeof callbacks == "object") {
      let handlers = { ...AJAX.default_handlers }

      for (let status in callbacks)
        handlers[status] = callbacks[status]

      if (xhr.status in handlers)
        handlers[xhr.status](xhr)
      else
        handlers[0](xhr)
    }
    else error('invalid ajax callback')

    if (typeof callbacks.onLeave == 'function')
      callbacks.onLeave(xhr)
    else
      AJAX.onLeave(xhr)
  }

  static ajax(options) {
    /**
     * options must contain url, type, and data functions
     */
    if (options.data instanceof FormData) {
      options.contentType = false;
      options.processData = false;
    }

    if (options.beforeSend === undefined)
      options.beforeSend = AJAX.beforeSend;

    if (options.onLeave !== undefined)
      options.complete = {...options.complete, onLeave: options.onLeave}

    if (options.complete !== undefined) {
      let complete = { ...options.complete }

      options.complete = function (xhr, status) {
        AJAX.complete(xhr, complete, options.url, options.data);
      };
    }

    return $.ajax(options);
  }
}

// Form Types
class Form {
  /**
   * class for basic form flow (validation, data extraction, and ajax requesting)
   */
  constructor(form) {
    /**
     * Form Initialization.
     */
    this.form = form;
    this.form_title = $(form).attr("id");
    if (this.form_title === undefined)
      error("id not found for " + this.form + " form");

    this.initialize();
  }

  get(name) {
    return $(this.form).find(`[name=${name}]`).val();
  }

  set(name, value) {
    $(this.form).find(`[name=${name}]`).val(value);
  }

  initialize() {
    this.validators = new Validators(this.form);
    this.sender = new Sender(this.form);

    this.submitBtn = $("[submit=" + $(this.form).attr("id") + "]");
    if (!this.submitBtn.length)
      console.log("submit btn not found for " + this.title + " form");
    $(this.submitBtn).attr("type", "button");
    $(this.submitBtn).click(this.run.bind(this));
  }

  setCallback(callback) {
    this.sender.callback = callback;
  }

  payload() {
    return new FormData(this.form[0]);
  }

  run() {
    /**
     * run the form
     */
    if (this.validators.validateAll()) {
      let form_data = this.payload();
      this.sender.send(form_data);
    }
  }
}

// Utilities
class Sender {
  /**
   * Class for form-api communication
   */
  constructor(form) {
    this.form = form;
    this.form_title = $(form).attr("id");
    this.endpoint = `${API}/${$(form).attr("endpoint")}`;
    if (this.endpoint === undefined)
      console.log("api destination not found for " + this.form_title + " form");
    this.type = $(form).attr("request_type") !== undefined ? 
      $(form).attr("request_type") : "GET";
  }

  send(data) {
    let completeCallback
    if (typeof this.callback == 'function')
      completeCallback = function (xhr) {
        if (typeof this.callback == "function") this.callback(xhr);
      }.bind(this)
    else
      completeCallback = this.callback;

    AJAX.ajax({
      url: this.endpoint,
      type: this.type,
      data: data,
      complete: completeCallback
    });
  }
}

class Validator {
  /**
   * Single input validator
   * Error Codes:
   *  0: Healthy
   *  1: Missing Required Field
   *  2: Min Limit Violated
   *  3: Max Limit Violated
   *  4: Regex Pattern Not Matching
   */

  constructor(input) {
    /**
     * Validator Initialization
     */
    /**
     * Validator Factory
     */
    if (!$(input)[0].hasAttribute("name"))
      error(`Validation Creation Error: input has no attribute name inside form ${$(this.input).parents("form").attr("id")}`);
    this.input = input;

    if ($(input)[0].hasAttribute('display'))
      this.fieldName = $(input).attr('display')
    else if ($(input)[0].hasAttribute('name'))
      this.fieldName = $(input).attr('name')
    else if ($(input)[0].hasAttribute('id'))
      this.fieldName = $(input).attr('id')

    this.min = $(this.input).attr("min");
    this.max = $(this.input).attr("max");
  }

  getVal() {
    switch ($(this.input).prop("tagName")) {
      case "TEXTAREA":
      case "INPUT":
        return $(this.input).val().trim();
      default:
        return $(this.input).val();
    }
  }

  setVal(value) {
    $(this.input).val(value);
  }

  run() {
    /**
     * Validation
     * Error Codes:
     *  0: Healthy
     *  1: Missing Required Field
     *  2: Min Limit Violated
     *  3: Max Limit Violated
     *  4: Validation Criteria Violated
     */

    let input = this.getVal();

    if ((input.length || $(this.input)[0].hasAttribute("must")) && $(this.input)[0].hasAttribute("validation")) {
      let validation = $(this.input).attr('validation')

      if (typeof window[validation] == 'function') {
        if (!window[validation](this))
          return 4;
      }

      // Custom Regex Validation
      else if (validation in Regex) {
        let regex = Regex[validation];
        regex.lastIndex = 0;
        if (!regex.test(input)) return 4; // Regex Criteria Violated
      }

      else {
        throw `Invalid Validation Criteria: ${validation} in ${$(this.input).parents("form").attr("id")}`
      }

      input = this.getVal() // read again in case the validation changed the input value
    }

    if ($(this.input)[0].hasAttribute("must") && !input) return 1; // Required field not filled

    if (this.min && input.length < this.min) return 2; // Min Limit Code

    if (this.max && input.length > this.max) {
      $(this.input).val(input.substr(0, this.max));
      return 3; // Max limit Code
    }

    return 0; // Fine Error Code
  }
}

class Validators {
  /**
   * Validators Pool
   * Used for multi-field containers validation
   */
  constructor(container) {
    /**
     * Initialization
     */
    this.initializeValidators(container);
    this.msgContainer = $("[alert=" + $(container).attr("id") + "]");
    if (!this.msgContainer.length)
      error($(container).attr("id") + " alert container not found");
  }

  initializeValidators(container) {
    /**
     * Constructing validators
     */
    this.validators = [];
    function newValidator(i, input) {
      let validator = new Validator(input);
      if (validator) {
        this.validators.push(validator);

        $(input).on(
          "input",
          function () {
            this.showErr(validator, validator.run());
          }.bind(this, validator)
        );
      }
    }
    $(container).find("[must], [Min], [Max], [validation]").each(newValidator.bind(this));
  }

  validateAll() {
    /**
     * All Fields Must Be Healthy
     */
    for (let validator of this.validators) {
      let err = validator.run();
      this.showErr(validator, err);
      if (err) return false;
    }
    return true;
  }

  showErr(validator, err) {
    /**
     * Display Error
     */
    if (!err) {
      $(this.msgContainer).html(``)
      return;
    }

    let text = `Invalid ${validator.fieldName}: `;
    if (validator.msg)
      text += validator.msg
    else {
      switch (err) {
        case 1:
          text += "Required";
          break;
        case 2:
          // text += "أقل عدد للأحرف مسموح به " + validator.min;
          text += "Minimum Length: " + validator.min;
          break;
        case 3:
          text += "Maximum Length: " + validator.max;
          break;
        case 4:
          text +=
            "Character or Format";
          break;
        default:
          text += "Input not allowed";
      }
    }

    $(this.msgContainer).html(text);
  }
}