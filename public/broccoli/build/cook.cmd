@echo off

set NODE_ENV=development
set USE_HMR=false;
set USE_KARMA=true;

if (%1) == (hmr) (
    npm run bw
)

if (%1) == (tdd) (
    set USE_TDD=true
    npm run bt
)

if (%1) == (watch) (
    set USE_TDD=
    set USE_HMR=true
    set USE_KARMA=
    npm run bw
)

