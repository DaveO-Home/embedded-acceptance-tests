    # You can try other linux flavors - this also runs on windows(browser headless mode)
    FROM fedora:latest
    # This works on fedora - allows for container X11 using parent host config.
    RUN adduser tester -p tester

    RUN dnf update -y
    RUN dnf install -y git firefox

    RUN dnf install -y fedora-workstation-repositories 'dnf-command(config-manager)' 
    RUN dnf config-manager --set-enabled google-chrome 
    RUN dnf install -y google-chrome-stable

    RUN dnf install -y nodejs xorg-x11-fonts-Type1 PackageKit-gtk3-module libcanberra-gtk3 bzip2

    RUN npm install gulp -g
    RUN npm install brunch -g
    RUN npm install parcel -g
    RUN npm install broccoli-cli -g

    USER tester
    EXPOSE 3080
    WORKDIR /home/tester/embedded-acceptance-tests
    ENV NPM_CONFIG_LOGLEVEL info
    ENV NODE_ENV development
    ENV HOME /home/tester

    # Once the docker container(test_env) is built, you can try any of the frontends 
    # with a manual install(npm install).
    # It is recommended to remove the existing node_modules directories to conserve space.
    RUN git clone git://github.com/DaveO-Home/embedded-acceptance-tests.git 
    RUN git clone git://github.com/DaveO-Home/embedded-acceptance-tests-vue.git 
    RUN git clone git://github.com/DaveO-Home/embedded-acceptance-tests-react.git 
    RUN git clone git://github.com/DaveO-Home/embedded-acceptance-tests-ng.git

    # Change to correspond with desired repo - defaults to canjs
    RUN cd ./embedded-acceptance-tests; npm install 
    RUN cd ./embedded-acceptance-tests/public; npm install
    # Uncomment if you want to run the broccoli tests
    # RUN cd ./embedded-acceptance-tests/public/broccoli/build; npm install 

