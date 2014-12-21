var renderers = {};

module.exports = {

  addRenderer: function(type, render) {
    var genFunction = function*() {}.constructor;
    if (!type || !render || render.constructor !== genFunction) {
      throw new Error('Must provide type and render generator');
    }
    renderers[type] = render;
  },

  getRenderer: function(type) {
    return renderers[type];
  }
}