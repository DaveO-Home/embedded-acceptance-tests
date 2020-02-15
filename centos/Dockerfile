    # You can try other linux flavors - this also runs on windows(browser headless mode)
    FROM centos:7
    # This works on fedora - allows for container X11 using parent host config.
    RUN adduser tester -p tester && \
        yum update -y && \
        yum install -y git wget bzip2 && \ 
        cd /usr/local; wget http://ftp.mozilla.org/pub/firefox/releases/70.0.1/linux-x86_64/en-US/firefox-70.0.1.tar.bz2; tar xvjf firefox-70.0.1.tar.bz2 && \
        ln -s /usr/local/firefox/firefox /usr/bin/firefox && \
        yum install -y libXt && \
        curl -sL https://rpm.nodesource.com/setup_10.x | bash - && \
        yum install -y nodejs && \
        npm install gulp -g && \
        # npm install parcel -g && \
        npm install brunch -g && \
        echo $'[google-chrome] \n\
name=google-chrome \n\
baseurl=http://dl.google.com/linux/chrome/rpm/stable/$basearch \n\
enabled=1 \n\
gpgcheck=1 \n\
gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub' > /etc/yum.repos.d/google-chrome.repo && \
    yum install -y google-chrome-stable && \
    yum install -y xorg-x11-fonts-Type1 PackageKit-gtk3-module libcanberra-gtk3 && \ 
    curl https://raw.githubusercontent.com/creationix/nvm/v0.13.1/install.sh | bash && \
    rpm --import https://packages.microsoft.com/keys/microsoft.asc && \
    echo $'[vscode] \n\
name=Visual Studio Code \n\
baseurl=https://packages.microsoft.com/yumrepos/vscode \n\
enabled=1 \n\
gpgcheck=1 \n\
gpgkey=https://packages.microsoft.com/keys/microsoft.asc' > /etc/yum.repos.d/vscode.repo && \
    yum install -y code

    USER tester
    EXPOSE 3080
    
    ENV NPM_CONFIG_LOGLEVEL notice
    ENV NODE_ENV development

    # Uncomment if you want to use nvm
    # RUN cd ~; curl https://raw.githubusercontent.com/creationix/nvm/v0.13.1/install.sh | bash && \
    #   cd ~; bash -c ". .bash_profile; nvm install 10.15.3" && \
    #   cd ~; bash -c ". .bash_profile; nvm use 10.15.3; npm install gulp -g" && \
    #   cd ~; bash -c ". .bash_profile; nvm use 10.15.3; npm install parcel -g" && \
    #   cd ~; bash -c ". .bash_profile; nvm use 10.15.3; npm install brunch -g"

    # Once the docker container(test_env) is built, you can try any of the frontends 
    # with a manual install(npm install).
    # It is recommended to remove the existing node_modules directories to conserve space.
    RUN cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests.git && \
        cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-vue.git && \
        cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-react.git && \
        cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-ng.git && \
    # Change to correspond with desired repo - defaults to canjs
        cd ~/embedded-acceptance-tests; npm install && \
        cd ~/embedded-acceptance-tests/public; npm install

    WORKDIR /home/tester/embedded-acceptance-tests
