VilloJS
=======

VilloJS is the official JavaScript framework for Villo.

Using VilloJS
-------------

The best way to get started with VilloJS is to take a look at the [Villo Developer Site](http://dev.villo.me), which houses all of the resources you need to make Villo-Enabled applications.

Contributing
------------

If you would like to contribute to VilloJS, just follow these super easy steps:

1. Fork this repository.
2. Make the changes that you want.
3. Submit a pull request with the chnages made to the files in the source directory. DO NOT submit a pull request with the rebuilt villo.js and villo.min.js files.

If your pull request conflicts with pending changes, we'll do our best to manually merge them.
In order for your pull request to be merged, the Unit Tests example (found in "examples/Unit Test") should run without any errors. You will need to rebuild villo.js with the build script to run your changes in the Unit Test example.

Building
--------

VilloJS is already built and minified for your convienience. However, if you wish to rebuild villo.js and villo.min.js from the source files, you can do so by following the steps below.

1. Ensure that you have Node.js installed.
2. Open the "build" directory.
3. Run build.sh (mac/linux) or build.bat (windows).

That's it. The build script will create villo.js and villo.min.js in the main villo directory.

Version 1.0 Todo 
----------------

The following should be completed by the 1.0 release.

- Document feeds.
- Finish villo.Game (beta).
	- Finish game example, and write a simple "getting started with villo.Game" guide.
- Analytics (server-side).
	- Documentation on methods.
	- Small write-up on what is tracked, how it's tracked, how to enable/disable.
- Finish full unit test suite.
	
Roadmap
-------

These features are currently planned to be added to future version of VilloJS, though they are all subject to change.

- Feeds History After
- Feature Keys
- VQL
	- NodeJS
- villo.spine
	- HTTP Rest API for developers.
- villo.dom?
	- villo.animation?
- Remove $LABJS dependency.
- Villo Push?
- Better Cross-Platform
- Standardized Settings with web UI?
- Chat Plus?
- Swap everything over to villo.feature?
- Build out villo.Game.
- Bring back gift (rebrand as shop).
- Clean up villo.resource method.
- Redo Ajax to work outside of the villo API context.
