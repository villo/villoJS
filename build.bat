
@echo off
if exist build.bat goto start
goto wrongdir


:start
cd .\core
copy core.js + analytics.js + bridge.js + chat.js + clipboard.js + feeds.js + friends.js + gift.js + init.js + leaders.js + messages.js + presence.js + profile.js + settings.js + states.js + storage.js + user.js ..\villo_core.js

cd ..\utils
copy ajax.js + app.js + do.js + e.js + extend.js + hooks.js + log.js + lang.js + sync.js + dependencies.js + end.js ..\villo_utils.js

cd ..

copy villo_core.js + villo_utils.js villo.js
del villo_core.js
del villo_utils.js


#if exist jsmin.exe goto minify
#echo "jsmin not found, skipping minification."
goto nomin

#optional minifying step:
:minify
echo "Minifying villo.js -> villo.min.js"
jsmin <villo.js >villo.min.js "Copyright (c) 2012 Villo Services"
copy villo.min.js + .\utils\dependencies.js villo.min.js
goto end

:nomin
goto end


:wrongdir
echo "OOPS: Run this batch file from the VilloJS source directory, i.e. cd villojs first."
goto end


:end 
echo "Done building villo.js"