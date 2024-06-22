module.exports = async function(source, map, data) {
  const fs = require('fs');
  const loadUtils = require("loader-utils");
  const CoffeeScript = require("coffeescript");
  const options = this.getOptions();
  let that = this;
  let cb = this.async();
  let args = null;
  if (this.resourceQuery) {
    args = loadUtils.parseQuery(this.resourceQuery);
  }
  let scriptPathSegment = 'src/scripts';
  let markupPathSegment = 'src/markup';
  let scriptRootPath = this.rootContext + '/' + scriptPathSegment;
  let fileSegment = this.resourcePath.replace(new RegExp(
    '^' + scriptRootPath + '/',
  ), '');
  fileSegment = fileSegment.replace(new RegExp(
    '\.vue\.(js|coffee)$'
  ), '');
  let markupResourcePath = this.rootContext
    + '/'
    + markupPathSegment
    + '/'
    + fileSegment
    + '.vue.pug';
  if (!this.resourceQuery) {
    let result = '<script>\n';
    result += source;
    result += '</script>\n';
    if (fs.existsSync(markupResourcePath)) {
      result += '<template>\n';
      result += '</template>\n';
      cb(null, result);
    } else {
      cb(null, result);
    }
  }
  if (
    args
    && args.type == 'script'
  ) {
    let result = '<script>\n';
    result += source;
    result += '</script>\n';
    cb(null, result);
  }
  if (
    args
    && args.type == 'template'
    && fs.existsSync(markupResourcePath)
  ) {
    try {
      this.importModule(
        markupResourcePath,
        {},
        function(err, moduleResult) {
          if (err) {
            return callback(err);
          }
          let result = '<template>\n';
          result += moduleResult() + '\n';
          result += '</template>\n';
          cb(null, result);
        }
      );
    } catch (err) {
      cb(err);
    }
  }
};
