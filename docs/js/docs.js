/*
 * TODO:
 * 	This relies too much on file-based project management. It works for Villo fine, but is not ideal in general.
 * 	The "/** MODULE" comment should be able to initiate new modules on-the-fly, not just override the file name.
 * 	This isn't as flexible as it should be when it comes to modules. It's currently fixed to three levels.
 */

/*
 * NOTES:
 * 	We're using jQuery ajax functions until we can revamp villo.ajax (again).
 * 	The first attempt of fixing the ajax function was customized for Villo's APIs. Which is really okay.
 */

villo.extend(villo, {
	docs: {
		docs: {},
		options: {},
		pages: {},
		
		sourceFolder: "",
		
		markdown: new Showdown.converter(),
		
		build: function(options){
			//Set up the source folder:
			this.sourceFolder = options.sourceFolder || "";
			this.options.topTitle = options.title || "Documentation";
			//Start building this bad boy:
			this.module(options.module);
		},
		
		toProcess: 0,
		
		module: function(options){
			this.options.title = options.title || "API Reference";
			delete options.title;
			this.options.expand = options.expand || true;
			delete options.expand;
			
			var pages = options.pages || {};
			delete options.pages;
			
			for(var x in pages){
				this.toProcess++;
				this.getPage(pages[x]);
			}
			
			for(var x in options){
				this.docs[x] = {}
				//Get code, push them into the module.
				for(var y in options[x]){
					var src = this.sourceFolder + options[x][y];
					this.toProcess++;
					this.getCodeDoc(this.sourceFolder + options[x][y], x);
				}
			}
		},
		
		doneCode: function(src){
			this.toProcess--;
			//We're lenient: 
			if(this.toProcess <= 0){
				this.buildNav();
			}
		},
		
		buildNav: function(){
			
			//Generate Div:
			var divTop = $("<div></div>");
			divTop.addClass("well sidebar-nav");
			
			divTop.append($("<h2></h2>").html(this.options.topTitle));
			
			var pageArray = [];
			for(var x in this.pages){
				this.pages[x].name = x;
				if(this.pages[x].position){
					pageArray[this.pages[x].position-1] = this.pages[x];
				}else{
					pageArray.push(this.pages[x]);
				}
			}
			
			pageArray.forEach(function(item){
				divTop.append($("<a href='#" + item.name + "'>" + item.name + "</a>").append("<br />"));
			})

			
			//Generate Div:
			var div = $("<div></div>");
			div.addClass("well sidebar-nav");
			
			div.append($("<h2></h2>").html(this.options.title));
			
			//Top modules:
			for(var x in this.docs){
				//Add labels:
				div.append($("<h3></h3>").html(x));
				var nav = $("<ul></ul>");
				//nav.addClass("nav nav-list");
				for(var y in this.docs[x]){
					var sub = $("<li></li>");
					sub.html(y);
					var bel = $("<ul><ul>");
					//bel.addClass("nav nav-list");
					for(var z in this.docs[x][y]){
						var bot = $("<li></li>");
						bot.html("<a href='#" + x + "/" + y + "/" + z + "'>" + z + "</a>");
						bel.append(bot);
					}
					sub.append(bel);
					nav.append(sub);
				}
				div.append(nav);
			}
			
			//Generate Nav:
			var nav = $("<ul></ul>");
			nav.addClass("nav nav-list");
			
			//Add navigation to the sidebar:
			$("#sidebar").append(divTop);
			$("#sidebar").append(div);
			
			//Set up all the autolinks:
			this.autolink();
		},
		
		//Searches all of the code documents for
		autolink: function(){
			//Source array to link:
			var source = [];
			for(var x in this.docs){
				//Folder Names
				for(var y in this.docs[x]){
					//Files names
					for(var z in this.docs[x][y]){
						//Method names:
						source.push(z)
					}
				}
			}
			
			var keys = '(' + source.join("|") + ')';
			var re = new RegExp(keys, 'g');
			
			//Now loop through again, and autolink this time:
			for(var x in this.docs){
				//Folder Names
				for(var y in this.docs[x]){
					//Files names
					for(var z in this.docs[x][y]){
						var doc = this.docs[x][y][z];
						md = doc.markdown;
						md = md.replace(re, function( _, m1, m2 ){
							return '<a href="#' + villo.docs.getMethod(m1) + '">' + m1 + '</a>';
						});
						doc.html = this.markdown.makeHtml(md);
					}
				}
			}
			
			for(var x in this.pages){
				var page = this.pages[x];
				page.html = this.markdown.makeHtml(page.markdown);
			}
			
			//Set up search:
			this.createSearch();
		},
		
		createSearch: function(){
			
			var source = [];
			
			for(var x in this.docs){
				//Folder Names
				for(var y in this.docs[x]){
					//Files names
					for(var z in this.docs[x][y]){
						//Method names:
						source.push(z)
					}
				}
			}
			
			$('#search').typeahead({
				source: source,
				updater: villo.bind(this, function (item) {
					this.pushMethod(item);
			    	return item;
			   })
				//TODO: Search keywords?
				/*matcher: function(item){
					if(item.toLowerCase =){
						
					}
					item.toLowerCase()
					return true;
				},*/
				//TODO: Include some method information?
				/*highlighter: function(item){
					return "<div>.......</div>";
				}*/
			});
			
			$("#search").keypress(villo.bind(this, function(e){
				if(e.keyCode == 13){
					//Enter key pressed:
					/*
					 * The pushMethod function is pretty specialized to Villo.
					 * It lets us have sexy search though.
					 */
					this.pushMethod($("#search").val());
				}
			}));
			
			//And finish the build:
			this.finishBuild();
		},
		
		finishBuild: function(){
			window.onhashchange = villo.bind(this, this.hash);
			villo.docs.hash();
		},
		
		//Build a page:
		getPage: function(src){
			//Use jQuery Ajax:
			$.ajax({
				url: src,
				cache: false,
				success: villo.bind(this, function(trans) {
					//Default naming:
					var name = (villo.trim(trans.split("\n")[0]) !== "" ? villo.trim(trans.split("\n")[0]) : villo.cap(src.split("/")[src.split("/").length-1].split(".")[0]));
					
					//Override naming in the file:
					var lines = trans.split("\n");
					if(lines[0].substring(0,14) == "<!---#(Module)"){
						name = lines[0].split(".")[1].split("-")[0];
					}
					
					//Get position:
					var order;
					var splitter = parseInt(src.split("?")[src.split("?").length-1]);
					if(typeof(splitter) === "number"){
						order = splitter;
					}else{
						order = false;
					}
					
					this.pages[name] = {
						markdown: trans,
						position: order
					};
					this.doneCode(src);
				}),
				failure: villo.bind(this, function(){
					console.log("ERROR: Failed getting page " + src);
					this.doneCode(src);
				})
			});
		},
		
		//Build a code module:
		getCodeDoc: function(src, theModule){
			$.ajax({
				url: src,
				//We need this so that we can get the latest code all the time:
				cache: false,	
				success: villo.bind(this, function(trans) {
					
					//The documentation gets dumped into here:
					var docs = [];
					
					//Split for new lines:
					var lines = trans.split("\n");
					//This variable tells us if we're currently building documentation:
					var documenting = false;
					//The current working (temporary) document:
					var doc = "";
					//This is used for defining the code module in the file:
					var module = false;
					//Grab the name based on the file. This can be overridden in the module.
					var name = villo.cap(src.split("/")[src.split("/").length-1].split(".")[0]);
					
					//Iterate through the lines:
					lines.forEach(villo.bind(this, function(value){
						//In the process of creating documentation:
						if(documenting === true){
							//Check to see if we should stop documenting:
							if(villo.trim(value) === "*/"){
								//No longer documenting:
								documenting = false;
								//Push to the holding variable:
								docs.push(doc);
								//Clear out temporary document:
								doc = "";
							}else{
								var useValue;
								//This strips out the first tab/four spaces from the line:
								if(value.substring(0,1) === "	"){
									//Grab content after tab character:
									useValue = value.substring(1);
								}else if(value.substring(0,1) === " "){
									//Grab content after four spaces:
									useValue = value.substring(4);
								}else{
									useValue = value;
								}
								//Add it to the working doc:
								doc += useValue + "\n";
							}
						}else if(module === true){
							if(villo.trim(value) === "*/"){
								//No longer in a module:
								module = false;
							}else{
								var useValue;
								//This strips out the first tab/four spaces from the line:
								if(value.substring(0,1) === "	"){
									//Grab content after tab character:
									useValue = value.substring(1);
								}else if(value.substring(0,1) === " "){
									//Grab content after four spaces:
									useValue = value.substring(4);
								}else{
									useValue = value;
								}
								
								//This has intentionally been left pretty open so that it can be expanded on:
								var options = useValue.split(", ");
								options.forEach(function(ops){
									var subs = ops.split(":");
									if(subs[0] === "name"){
										name = subs[1];
									}
								});
							}
						}else{
							//Check to see if we should start documenting:
							if(villo.trim(value) === "/**"){
								documenting = true;
							}else if(villo.trim(value) === "/** MODULE"){
								module = true;
							}
						}
					}));
					
					var parsed = {};
					
					docs.forEach(villo.bind(this, function(value){
						var methodName = villo.trim(value.split("\n")[0]);
						parsed[methodName] = {
							markdown: value
						};
					}));
					
					name = villo.trim(name);
					
					//Assign the module:
					this.docs[theModule][name] = parsed;
					
					this.doneCode(src);
				}),
				failure: villo.bind(this, function(){
					console.log("ERROR: Failed getting code " + src);
					this.doneCode(src);
				})
			});
		},
		
		//Powers pushMethod:
		getMethod: function(methodName){
			//This is a custom method that will determine the correct URL for a given method name.
			//Highly specialized to Villo, but it works.
			var top, mid, bot;
			var shouldBreak = false;
			for(var x in this.docs){
				//Folder Names
				top = x;
				for(var y in this.docs[x]){
					//Files names
					mid = y;
					for(var z in this.docs[x][y]){
						//Method names:
						if(methodName.toLowerCase() === z.toLowerCase()){
							bot = z;
							shouldBreak = true;
							break;
						}
					}
					if(shouldBreak === true){
						break;
					}
				}
				if(shouldBreak === true){
					break;
				}
			}
			if(shouldBreak === true){
				return top + "/" + mid + "/" + bot;
			}else{
				return false;
			}
		},
		pushMethod: function(methodName){
			var method = this.getMethod(methodName);
			if(method !== false){
				window.location.hash = method;
			}
		},
		
		//Manages the hash urls:
		hash: function(){
			
			//404 Error:
			var err404 = function(){
				$("#content").html("<h1>Page Not Found</h1> It appears that the page you're looking for cannot be found. Please check the url and try again.");
			};
			
			var hash = location.hash.substring(1);
			if(villo.trim(hash) !== ""){
				//TODO: 404
				var hashArr = hash.split("/");
				if(hashArr.length === 3){
					if(this.docs[hashArr[0]][hashArr[1]][hashArr[2]]){
						var doc = this.docs[hashArr[0]][hashArr[1]][hashArr[2]];
						$("#content").html(doc.html);
						
						var strip = function(og){
							return og.replace(/(<([^>]+)>)/ig, "");
						}
						
						//Strip HTML tags from code elements: 
						$("code").each(function(index){
							var newText = strip($(this).text());
							$(this).text(newText);
						});
						
						$("p > code").addClass("prettyprint");
						$("pre > code").addClass("prettyprint linenums");
						prettyPrint();
					}else{
						err404();
					}
				}else{
					if(this.pages[hash]){
						var page = this.pages[hash];
						$("#content").html(page.html);
					}else{
						err404();
					}
				}
			}else{
				var page;
				for(var first in this.pages){
					page = this.pages[first];
					break;
				}
				$("#content").html(page.html);
			}
			window.scrollTo(0, 0);
		}
	}
});




/*
 * forEach polyfill:
 */


// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if ( !Array.prototype.forEach ) {

  Array.prototype.forEach = function( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( "this is null or not defined" );
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( {}.toString.call(callback) != "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if ( thisArg ) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if ( k in O ) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}