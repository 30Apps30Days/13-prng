'use strict';

function noop() {}

function bindEvents(thisArg, events) {
   Object.keys(events).forEach(function (selector) {
        Object.keys(events[selector]).forEach(function (event) {
            var handler = events[selector][event].bind(thisArg);
            if('document' === selector) {
                document.addEventListener(event, handler, false);
            } else if ('window' === selector) {
                window.addEventListener(event, handler, false);
            } else {
                document.querySelectorAll(selector).forEach(function (dom) {
                    dom.addEventListener(event, handler, false);
                });
            }
        });
    }); // all events bound
}

function f(name, params) {
  params = Array.prototype.slice.call(arguments, 1, arguments.length);
  return name + '(' + params.join(', ') + ')';
}

var IS_CORDOVA = !!window.cordova;

var app = {
  // options
  DATA_KEY: 'org.metaist.prng.data',
  store: null,
  options: {
    debug: true,
    min: 1,
    max: 10
  },

  // internal
  num: null,

  // DOM
  $num: null,
  $txt_min: null,
  $txt_max: null,

  init: function () {
    bindEvents(this, {
      'document': {'deviceready': this.ready},
      'form input': {'change': this.change},
      'main': {'click': this.next}
    });

    if(!IS_CORDOVA) {
      this.options.debug && console.log('NOT cordova');
      bindEvents(this, {'window': {'load': this.ready}});
    }

    return this;
  },

  ready: function () {
    // Store DOM nodes
    this.$num = document.querySelector('#num');
    this.$num_min = document.querySelector('#num_min');
    this.$num_max = document.querySelector('#num_max');

    // Grab preferences
    if(IS_CORDOVA) {
      this.store = plugins.appPreferences;
      this.store.fetch(this.DATA_KEY).then(function (data) {
        Object.assign(this.options, data || {});
        this.$num_min.parentElement.MaterialTextfield.change(this.options.min);
        this.$num_max.parentElement.MaterialTextfield.change(this.options.max);
        this.render();
      }.bind(this));
    }

    return this.next();
  },

  change: function () {
    this.options.debug && console.log('.change()');
    this.options.min = this.$num_min.value;
    this.options.max = this.$num_max.value;

    if (IS_CORDOVA) {
      this.store.store(noop, noop, this.DATA_KEY, this.options);
    }//end if: options stored
    return this.next();
  },

  next: function () {
    this.options.debug && console.log('.next()');
    var min = Math.ceil(this.options.min);
    var max = Math.floor(this.options.max);
    this.num = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.render();
  },

  render: function () {
    this.options.debug && console.log('.render()');
    this.$num.innerText = this.num;
    return this;
  }
};

app.init();
