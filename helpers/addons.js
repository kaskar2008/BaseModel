export function camelize (string) {
  if (_isNumerical(string)) {
    return string;
  }
  string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
  // Ensure 1st char is always lowercase
  return string.substr(0, 1).toLowerCase() + string.substr(1);
};

export function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pascalize (string) {
  var camelized = camelize(string);
  // Ensure 1st char is always uppercase
  return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
};

export function fromDot (obj, p) {
  if (!p) return obj
  return p.split('.').reduce((o,i) => typeof o === 'object'? o[i] : o, obj)
}

export function  _isNumerical (obj) {
  obj = obj - 0;
  return obj === obj;
};

export function separateWords (string, options) {
  options = options || {};
  var separator = options.separator || '_';
  var split = options.split || /(?=[A-Z])/;
  return string.split(split).join(separator);
};

export function decamelize (string, options) {
  return separateWords(string, options).toLowerCase();
};
