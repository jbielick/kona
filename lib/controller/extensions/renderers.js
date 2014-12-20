var renderers = {};

module.exports = {

  addRenderer: function(type, render) {
    renderers[type] = render;
  },

  getRenderer: function(type) {
    return renderers[type];
  }
}