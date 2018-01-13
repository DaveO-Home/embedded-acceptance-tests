@echo off

if (%1) == (hmr) (

    set NODE_ENV=development
    set USE_HMR=true;
    set USE_KARMA=false;

)

cd .. 
node fuse.js
cd build
