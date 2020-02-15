# Embedded Acceptance Testing with Karma and Jasmine

The basic idea is to build a production application ensuring consistent and stable code using JavaScript, CSS and bootstrap linting and automated unit and e2e testing. This will be in part, assisted by the development tools, detailed in the [Development Overview](#development) and bundle sections.

[Production Build](#production-build)

[Test Build](#test-build)

[Development Overview](#development)

## Bundle Tools

> 1. [Browserify](#i-browserify)
> 1. [Brunch](#ii-brunch)
> 1. [Fusebox](#iii-fusebox)
> 1. [Parcel](#iv-parcel)
> 1. [Rollup](#v-rollup)
> 1. [Steal](#vi-stealjs)
> 1. [Webpack](#vii-webpack)
> 1. [Broccoli](#viii-broccoli)

[Installation](#installation)

[Docker](#ix-dockerfile)

**Dodex**: Added for testing and demo. <https://github.com/DaveO-Home/dodex>

## Other Framworks

  1. **Vue** - <https://github.com/DaveO-Home/embedded-acceptance-tests-vue>
  1. **Angular** - <https://github.com/DaveO-Home/embedded-acceptance-tests-ng>
  1. **React** - <https://github.com/DaveO-Home/embedded-acceptance-tests-react>

## Installation

**Desktop:**

  clone the repository or download the .zip

**Install Assumptions:**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

  1. OS Linux or Windows(Tested on Windows10)
  2. Node and npm
  3. Gulp4 is default - If your global Gulp is version 3, you can  execute `npx gulp` from the build directories.
  4. Google Chrome
  5. Firefox

**Server:**

  `cd` to top level directory `<install>/acceptance-tests`

```bash
  npm install
```

  This will install a small Node/Express setup to view the results of a production build.

  `cd <install>/acceptance-tests/public`

```bash
  npm install
```

  To install all required dependencies. Also install the global cli packages for Brunch, `npm install brunch -g`, Broccoli, `npm install broccoli -g` and Parcel, `npm install parcel-bundler -g`.

**Client:**

Test builds will generate bundles in 'dist_test' and production in the 'dist' directory at the root level, 'public'.

## Production Build

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

To generate a build "cd to `public/<bundler>/build` and type `gulp` or `gulp prod`, e.g.

```bash
  cd public/fusebox/build
  gulp
```

If the tests succeed then the build should complete.

To run the production application:

  1. `cd <install>/acceptance_tests`
  1. `npm start`  -  This should start a Node Server with port 3080.
  1. Start a browser and enter `localhost:3080/dist/<bundler>/appl/testapp.html`
  1. For Brunch the Production Url is `localhost:3080/dist/brunch/testapp.html` or `localhost:3080/dist/brunch`
  1. For Parcel the Production Url is `localhost:3080/dist/parcel/testapp.html`

You can repeat the procedure with "webpack", "browserify", "stealjs" or "rollup", "brunch", "parcel" or "brocolli". Output from the build can be logged by setting the environment variable `USE_LOGFILE=true`.

Normally you can also run the test bundles(dist_test) from the node express server. However, when switching between development karma testing and running the test(dist_test) application, some resources are not found because of the "base/dist_test" URL. To fix this, run `gulp rebuild` from the `<bundler>/build` directory.

__Note__; There was a Production build problem with __Rollup__, ES6, can-component and two-way binding.  The problem was fixed by re-coding the tools page selection element with a Bootstrap Dropdown Component.  Therefore, the toolstest.js specs were also modified.

## Test Build

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

The test build simply runs the tests in headless mode. The default browsers are ChromeHeadless and FirefoxHeadless.  To change the default you can set an environment variable; e.g.

```bash
  export USE_BROWSERS=ChromeHeadless,Opera
```

to remove FirefoxHeadless from the browser list and add Opera.  You can also set this environment variable for a production build.

To run the tests "cd to `public/<bundler>/build` and type `gulp test`, e.g.

```bash
  cd public/webpack/build
  gulp test
```

A test result might look like;

```text
  Suite for Unit Tests
    ✔ Verify that browser supports Promises
    ✔ ES6 Support
    ✔ blockStrip to remove Canjs block of code
  Unit Tests - Suite 2
    ✔ Is Karma active
    ✔ Verify NaN
  Popper Defined - required for Bootstrap
    ✔ is JQuery defined
    ✔ is Popper defined
  Application Unit test suite - AppTest
    ✔ Is Welcome Page Loaded
    ✔ Is Tools Table Loaded
    Test Router: table/tools
      ✔ controller set: table
      ✔ action set: tools
      ✔ dispatch called: table
    ✔ Is Pdf Loaded
    Test Router: pdf/test
      ✔ controller set: pdf
      ✔ action set: test
      ✔ dispatch called: pdf
    Load new tools page
      ✔ setup and change event executed.
      ✔ new page loaded on change.
    Contact Form Validation
      ✔ Contact form - verify required fields
      ✔ Contact form - validate populated fields, email mismatch.
      ✔ Contact form - validate email with valid email address.
      ✔ Contact form - validate form submission.
    Popup Login Form
      ✔ Login form - verify modal with login loaded
      ✔ Login form - verify cancel and removed from DOM
    Dodex Operation Validation
      ✔ Dodex - loaded and toggle on icon mousedown
      ✔ Dodex - Check that card A is current and flipped on mousedown
      ✔ Dodex - Check that card B is current and flipped on mousedown
      ✔ Dodex - Flip cards A & B back to original positions
      ✔ Dodex - Flip multiple cards on tab mousedown
      ✔ Dodex - Add additional app/personal cards
      ✔ Dodex - Load Login Popup from card1(A)
    Dodex Input Operation Validation
      ✔ Dodex Input - popup on mouse double click
      ✔ Dodex Input - Verify that form elements exist
      ✔ Dodex Input - verify that uploaded file is processed
      ✔ Dodex Input - close popup on button click

Finished in 13.883 secs / 9.677 secs @ 13:26:11 GMT-0800 (PST)

SUMMARY:
✔ 72 tests completed
```

## Development

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

__Note__; When modifying project assets(.stache, .html, etc.) you can execute `gulp copy` from the `public/<bundler>/build` directory to preview changes. This is not required for __StealJs__.

__A word on developing tests__; You can write and execute tests quicker by using the rebuild process of a given bundler and running the `acceptance` gulp task after the auto-rebuild, e.g. with __Rollup__ you can;

* `cd public/rollup/build`
* `gulp watch`
* Develop or modify a test.
* In another window execute `gulp acceptance` from the `build` directory to view the modified or new test results.

__Also Note__; All of the development tasks(`hmr, server, watch`) etc, can be run from one window using the `gulp development` task.

### I. **Browserify**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Development Server Window*** -

* `cd public/browserify/build`
* `gulp server`

   Browsersync will start a browser tab(default Chrome) with `localhost:3080/dist_test/browserify/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload.

2\. ***Hot Module Reload(HMR) Window*** -

* `cd public/browserify/build`
* `gulp hmr`

   The `watchify` plugin will remain active to rebuild the bundle on code change.

3\. ***Test Driven Development(tdd) Window*** -

* `cd public/browserify/build`
* `gulp tdd`

   Tests will rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.  Note, you do not need `hmr` active for `tdd`. Also, `tdd` can be run with a headless browser.

### II. **Brunch**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Watch, Recompile and Reload Window*** -

* `cd public/brunch/build`
* `gulp watch`

At this point you can start a browser and enter `localhost:3080/`. Any changes to the source code(*.js files and other assets such as *.html) should be reflected in the browser auto reload.

__Note__; The test url is `localhost:3080` since Brunch by default uses 'config.paths.public' as the server context. Also, the reload may fail at times, I've noticed that making a second code mod re-rights the ship.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/brunch/build`
* `gulp tdd`

  While the Brunch watcher is running, tests are re-run when code are changed.
  
  __Note__; tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

3\. ***Special Considerations***
  
* Brunch plugin eslint-brunch uses eslint 3. The demo uses version 4.  The `gulp`(production build) command uses a gulp linter, so javascript linting is executed. However, if you wish to use the  eslint-brunch plugin, do the following;
* `cd <install>/public/node_modules/eslint-brunch`
* `npm install eslint@latest`
* `cd <install>/public` and edit the `brunch-config.js` file and uncomment the eslint section.

    __Note:__ Don't forget to install Brunch using `npm install brunch -g`.

### III. **Fusebox**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Hot Module Reload(HMR) Server Window*** -

* `cd public/fusebox/build`
* `gulp hmr` or `fuse hmr`

   At this point you can start a browser and enter `localhost:3080/fusebox/appl/testapp_dev.html` or `localhost:3080/dist_test/fusebox/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/fusebox/build`
* `gulp tdd`

   The HMR Server must be running if you want tests to rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`. A warning is issued under `tdd`(404: /dist_test/fusebox/resources) since `hmr` requires a non-karma build, this can be ignored.

   __Note__; You can upgrade Fuse-Box to version 3 without changes to the configuration, however, you must be using Nodejs 8+. Verified fuse-box 3.2.2.

### IV. **Parcel**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Watch, Recompile and Reload Window*** -

* `cd public/parcel/build`
* `gulp watch`

At this point you can start a browser and enter `localhost:3080/dist_test/parcel/testapp_dev.html` (configured to auto open browser tab). Any changes to the source code(*.js and *.css files) should be reflected in the browser auto reload.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/parcel/build`
* `gulp tdd`

  While the Parcel watcher is running, tests are re-run when code are changed.
  
* Using `export USE_BUNDLER=false` - When using `gulp watch & gulp tdd` together, you can set USE_BUNDLER to false to startup TDD without building first, `gulp watch` does the test build.  Also, by settting `USE_BUNDLER=false` before `gulp`(production build), only testing and linting will execute.

  __Note__; tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

### V. **Rollup**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Development Server Window*** -

* `cd public/rollup/build`
* `gulp watch`

   The Rollup Development Server, Watch(auto-rebuild) and Page Reload functions are started together.  Simply use one of the following URLs in any browser; `localhost:3080/rollup/appl/testapp_dev.html` or `localhost:3080/dist_test/rollup/appl/testapp_dev.html`.

  Currently Rollup an ES6 bundler has an issue with  can-view-stache and can-component. The dropdown component on the table view page was changed to a Bootstrap component. The event handling is done with can-control. See app.js and table.js. With a modification to the toolstest.js module tests are satisfied and the production build should finish.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/rollup/build`
* `gulp tdd`

   Tests will rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

### VI. **Stealjs**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Development Server Window*** -

* `cd public/stealjs/build`
* `gulp server`

2\. ***Live-Reload(HMR) Window*** -

* `cd public/stealjs/build`
* `gulp hmr`

   At this point you can start a browser and enter `localhost:3080/stealjs/appl/testapp_dev.html`(please note that dist_test is not in the URL).  Any changes to the source code(*.js files) should be reflected in the browser auto reload.  The `gulp hmr` by default builds a vendor bundle for faster reload.  When you are not modifying the node_modules directory, subsequent executions of `gulp hmr` do not need the vendor bundle build. You can disable by setting an environment variable, `export USE_VENDOR_BUILD=false`.

   Stealjs does not require a dist_test build. It runs development directly from the source(nice!). However, when starting `hmr` a vendor bundle is produced at public/dev-bundle.js for `hmr` performance. The bundle is accessed from the `testapp_dev.html` page, via a `deps-bundle` attribute.

   Finally, because there are five bundlers using the package.json file, a main is not specified.  Stealjs `hmr` dependency bundler needs to know the application entry point.  Since main is not available it looks for `index.js` in the root directory. So a soft link was made to `index.js`.  If not included in the git clone or zip download, you must execute the link, e.g.

* `cd application-tests/public`
* `ln -s stealjs/appl/js/index.js index.js`

3\. ***Test Driven Development(tdd) Window*** -

* `cd public/steal/build`
* `gulp tdd`

   Tests will rerun as source code(*.js) is changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

### VII. **Webpack**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

1\. ***Development HMR Server Window*** -

* `cd public/webpack/build`
* `gulp hmr`

2\. ***Hot Module Reload(Watch) Window*** -

* `cd public/webpack/build`
* `gulp watch`

   At this point you can start a browser and enter `localhost:3080/dist_test/webpack/appl/testapp_dev.html`.  Any changes to the source code(*.js files) should be reflected in the browser auto reload. Running the application from the source directory should also work, e.g., `localhost:3080/webpack/appl/testapp_dev.html`.

3\. ***Test Driven Development(tdd) Window*** -

* `cd public/webpack/build`
* `gulp tdd`

   Tests will rerun as source code(*.js) are changed. Note, tests can be added or removed as code is developed. Both Chrome and Firefox are the default browsers. This can be overridden with an environment variable, `export USE_BROWSERS=Opera`.

__\*\*\*__ Webpack defaults to v4.x.

### VIII. **Broccoli**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

**Warning**: Broccoli has it's own webpack@3.12.0 package.json in the `broccoli/build` directory. Run `npm install` in this directory to run the Broccoli acceptance test tasks.

Broccoli is not a bundler but uses plugins to interface with other software, specifically, Webpack, Rollup and Browserify to build the javascript bundle and content. These bundler plugins are all outdated. The Webpack plugin works best since it seems to behave with the builtin watcher process. At least I learned how to spell broccoli. Broccoli is good at deploying static content and in the end uses little configuration and has a fast deploy.

1\. **Watch Window** -

* `cd public/broccoli/build`
* `gulp watch`

At this point you can start a browser and enter `localhost:3080/appl/testapp_dev.html`. The watcher will recompile when application code are modified, however there is no auto-reload.  You have to manually reload the page. Also, the watcher recompiles into cache so Test Driven Development(`gulp tdd`) does not re-execute on code modifications since it watches the actual bundle.

2\. ***Test Driven Development(tdd) Window*** -

* `cd public/broccoli/build`
* `gulp tdd`

  __Note__; Tests will __not__ be rerun as code are modified. You can still run `gulp test` and `gulp`(for production) with expected results.

### IX. **Dockerfile**

[Top](#embedded-acceptance-testing-with-karma-and-jasmine)

You can build a complete test/develpment environment on a Docker vm with the supplied Dockerfile.

**Linux as Parent Host**(assumes docker is installed and daemon is running)-

In the top parent directory, usually `..../embedded-acceptance-tests/` execute the following commands;

1\. ```docker build -t embedded fedora``` or ```docker build -t embedded centos```

2\. ```docker run -ti --privileged  -p 3080:3080 -e DISPLAY=$DISPLAY  -v /tmp/.X11-unix:/tmp/.X11-unix --name test_env embedded bash```

You should be logged into the test container(test_env). There will be 4 embedded-acceptance-tests* directories. Change into to default directory defined in the Dockerfile, for example canjs(embedded-acceptance-tests/public). All of the node dependencies should be installed, so ```cd``` to a desired bundler build directory, i.e. ```stealjs/build``` and follow the above instructions on testing, development and production builds.

3\. When existing the vm after the ```docker run``` command, the container may be stopped. To restart execute ```docker start test_env``` and then ```docker exec -it --privileged --user tester -e DISPLAY=$DISPLAY -w /home/tester test_env bash```.  You can also use ```--user root``` to execute admin work.

**Windows as Parent Host**-

For Pro and Enterpise OS's, follow the Docker instructions on installation.  For the Home OS version you can use the legacy **Docker Desktop** client. It is best to have a Pro or Enterpise Windows OS to use a WSL(Windows bash) install. Use following commands with Windows;

1\. ```docker build -t embedded fedora``` or ```docker build -t embedded centos```

2\. ```docker run -ti --privileged  -p 3080:3080 --name test_env embedded bash```

3\. ```docker exec -it --privileged --user tester -w /home/tester test_env bash```

The web port 3080 is exposed to the parent host, so once an application is sucessfully bundled and the node server(```npm start``` in directory embedded-acceptance-tests) is started, a host browser can view the application using say ```localhost:3080/dist/fusebox/appl/testapp.html```.

__Note__; Without a complete Pro/Enterprise docker installation, the ```test_env``` container can only run with Headless browsers. Therfore you should execute ```export USE_BROWSERS=ChromeHeadless,FirefoxHeadless``` before testing, development and building.
