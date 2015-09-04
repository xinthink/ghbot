
// Add some is-Type methods:
// `isArguments`, `isFunction`, `isString`, `isNumber`, `isDate`, `isRegExp`, `isError`.
['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'].forEach(function (name) {
  exports['is' + name] = function (obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
});

function setProp(k, v, obj) {
  obj[k] = v;
  return obj;
}

function setProps(update, obj) {
  for (var k in update) {
    obj[k] = update[k];
  }
  return obj;
}

exports.setProp = setProp;
exports.setProps = setProps;
