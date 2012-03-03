
@echo off
if exist build.bat goto start
goto wrongdir


:start
cd .\core
copy core.js + analytics.js + bridge.js + chat.js + clipboard.js + friends.js + gift.js + init.js + leaders.js + messages.js + profile.js + settings.js + states.js + storage.js + user.js ..\villo_core.js

cd ..\utils
copy ajax.js + app.js + do.js + e.js + extend.js + log.js + slashes.js + sync.js + dependencies.js + end.js ..\villo_utils.js

cd ..

copy villo_core.js + villo_utils.js villo_fat.js
del villo_core.js
del villo_utils.js

goto nomin
#if exist jsmin.exe goto minify
#echo "jsmin not found, skipping minification."
#goto nomin

#optional minifying step:
:minify
echo "Minifying villo_fat.js -> villo.js"
jsmin < villo_fat.js > villo.js
del villo_fat.js
goto end

:nomin
copy villo_fat.js villo.js
del villo_fat.js
goto end


:wrongdir
echo "OOPS: Run this batch file from the Villo source directory, i.e. cd Villo first."
goto end


:end 
echo "Done building villo.js"