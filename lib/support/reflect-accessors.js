
module.exports = function reflectAccessors(target, source, properties) {
  if (!Array.isArray(properties)) {
    properties = [properties];
  }
  properties.forEach(function(prop) {
    Object.defineProperty(target, prop, {
      get: function() {
        return source[prop];
      },
      set: function(value) {
        return source[prop] = value;
      }
    });
  });
};