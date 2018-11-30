var tests = [];

for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/base\/stealjs\/tests\/steal_unit.*\.js$/.test(file)) {
            tests.push(file.substr(6));
        }
    }
}

tests[tests.length] = function () {
    window.__karma__.start();
};

window.tests = function() {
    steal.apply(null, tests, "");
}
