const pkg = require('../package.json');
console.log(`export const PKG_NAME = "${pkg.name}";`);
console.log(`export const PKG_VERSION = "${pkg.version}";`);
console.error(`package.json 
    name: ${pkg.name}    
    version: ${pkg.version}
`);
