

function callbackTester (a, b, callback) {
    return callback(arguments[0],arguments[1]);
}

console.log(callbackTester(4, 6, (a,b) => {
          return(a*b);
}));
