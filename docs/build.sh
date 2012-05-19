MD=$(pwd)
./jodoc ../source/core/*.js ../source/utils/*.js pages/LICENSE.mdown pages/ABOUT.mdown pages/DEVELOPERGUIDE.mdown --output html --toc pages/TOC.mdown --template pages/template.html --markdown $MD/Markdown.pl 
