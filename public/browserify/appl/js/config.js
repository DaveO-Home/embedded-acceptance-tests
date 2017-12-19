//Browserify/Karma/Font-Awesome gets a 404 retrieving the fonts, just ignoring them for Karma tests
if(window.__karma__) {
    require('../css/appKarma.css');
}
else {
    require('../css/app.css');
}

