// @ts-nocheck
const app = require('../src/app');

// Function to print all registered routes
function printRoutes(stack, prefix = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // This is a route
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      console.log(`${method} ${prefix}${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // This is a sub-router
      if (middleware.regexp) {
        const path = middleware.regexp.source
          .replace(/\\/g, '')
          .replace(/^\^|\$$/g, '')
          .replace('\\/', '/');
        printRoutes(middleware.handle.stack, prefix + path);
      }
    }
  });
}

console.log('Registered routes:');
printRoutes(app._router.stack);