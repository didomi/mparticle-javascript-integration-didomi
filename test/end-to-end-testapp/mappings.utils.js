function generateMappingString(mapping) {
  return '[' + [
      mapping.map(function(prop) {
          return [
              '{' +
              '&quot;jsmap&quot;:' + prop.jsmap,
              '&quot;map&quot;:' + '&quot;' + prop.map + '&quot;',
              '&quot;maptype&quot;:' + '&quot;' + prop.maptype + '&quot;',
              '&quot;value&quot;:' + '&quot;' + prop.value + '&quot;'+ '}'
          ].join(',');
      }).join(',')
  ].join() + ']';
}

module.exports = {
  generateMappingString,
};
