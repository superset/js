// ==ClosureCompiler==
// @output_file_name superset.core.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/*
* Superset Framework - superset.core
*
* Copyright (c) James Westgate 2011
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/

//-- Namespace bootstrap

(function() {
		
	this.fn = {
		
		namespace: function(path, fn) {
			
			var current = window;
			
			//Only parse string paths 
			if (typeof path != 'string') {
				current = path;
			}
			else {
				var spaces = path.split('.');
				
				//Set up the namespace objects
				for (var i = 0, length = spaces.length; i < length; i++) {
					
					if (current[spaces[i]] == null) current[spaces[i]] = {};
					current = current[spaces[i]];
				}
			}
			
			//Now call the function
			if (fn != null) fn.call(current);
			return current;
		}
	};
	
	window.namespace = fn.namespace;	
	
})();


//-- Core Functions

fn.namespace(this.fn, function() {
	
    
    //-- Exceptions	
	
	this.coreException = function(msg) {
		throw new Error(['Superset Framework core exception: ', msg].join(''));
	};
	this.noArgumentsException = function() {
		this.coreException('The function accepts no arguments.');
	};
	
	this.propertyException = function() {
		this.coreException('At least one argument was expected.');
	};
	
	
	//-- Type checking
	this.isType = function(value, type) {
		if (value === null) return false;
		return ('[object ' + type + ']' === Object.prototype.toString.call(value).toLowerCase());
	}
	
		
	//-- Script/ Module loading
		
	//Get the current script name
	var head = document.getElementsByTagName('head')[0];
	var scripts = document.getElementsByTagName('script');
	
	//Set the script path to the path of the current script ie this one
	var scriptPath = scripts[scripts.length - 1].src;
	var scriptFolder = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
	var scriptExt = (/min.js$/.test(scriptPath)) ? '.min.js' : '.js';

	//Steve Souders - http://www.stevesouders.com/blog/2010/12/06/evolution-of-script-loading/
	//Dustin Diaz - http://www.dustindiaz.com/scriptjs/	
	window.using = this.using = function() {
					
		if (!arguments.length) return;
			
		var callback = null;			
		var scripts = 0;
		var count = 0;
		var regext = /.js$/;
		
		//Loop through arguments
		for (var i=0, len=arguments.length; i<len; i++) {
		
			var arg = arguments[i];
			
			//Load args up to the callback, rest ignored
			if (fn.isType(arg, 'function')) {
				callback = arg;
				scripts = i;
				break;
			}
			
			var script = document.createElement('script');
			script.type = 'text/javascript';
			
			script.onload = script.onreadystatechange = function () {
				if (script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') return false;
			  
			  	script.onload = script.onreadystatechange = null;
			  	count++;
				if (callback != null && count === scripts) callback();
			 	
			};
			script.async = true;
						
			//Set source. Add preconfigured extension if required
			script.src = [scriptFolder, '/',  arg, (regext.test(scriptPath)) ? '' : scriptExt].join('');
			head.appendChild(script);
		}
	};
	
	
    //-- Object / type functions

	//Based on Crockford's classless prototypal inheritance and
	//http://www.barelyfitz.com/blog/archives/2006/03/07/230/	
	window.create = this.create = function(o, c) {
		function F() {}
        F.prototype = o;
        var f = new F();
		if (c) for (var n in c) f[n] = c[n]; 
 		return f;
	}
	
	//Type definition
	//http://www.ruzee.com/blog/2008/12/javascript-inheritance-via-prototypes-and-closures
	window.type = this.type = function() {
		
		//Define constructor and call init if available
		var f = function() {
			if (this.init) this.init.apply(this, arguments);
		};
		
		var proto, len = arguments.length;
		
		//Define prototype
		//Last argument is always assumed to define prototype
		if (len) {
			
			var arg;
			for (var i=0; i < len-1; i++) {
				arg = arguments[i];				
				proto = (proto) ? fn.create(proto, new arg()) : new arg();
			}
			
			//Set prototype
			if (proto) {
				f.prototype = proto;
				f.prototype.constructor = f;
			}
			
			arguments[len-1].apply(f.prototype);
		}
		
		return f;
	};
});


//-- Map / Reduce
namespace(this.fn, function() {
	
    //Define variables for map/reduce
    var stack = []; //Contain an array of functions for each dimension
    var pointer = -1; //Dimension of stack to use
    var result = null; //Reduce result

    //Default settings for execute
    var defaults = {
    		
        execute: {
            async: true,
            interval: 20
        }
    };
	
	window.reset = this.reset = function() {
		stack = []; 
    	pointer = -1;
    	result = null;
	}
    
    //Replace each value in array provided with result of the function
    window.map = this.map = function (a, f) {

        pointer++;

        //Define stack array for this level and add function to stack
        if (stack.length <= pointer) stack[pointer] = [];
        stack[pointer].push({ f: function (i) { a[i] = f(i, a[i]); }, i: 0, a: a });

        pointer--;
    };

    //Update a single result by applying a function to each value in the array
    window.reduce = this.reduce = function (a, init, f) {

        pointer++;

        //Make sure reduce higher than map cannot be called
        if (pointer <= stack.length) {

            //Initialise and place function on stack
            result = init;
            stack[pointer].push({ f: function (i) { result = f(i, a[i], result); }, i: 0, a: a });
        }

        pointer--;
    };

    //Execute the functions added to the stack
    window.execute = this.execute = function (options, callback) {

		result = null;

        options = fn.extend({}, defaults.execute, options);
        if (!fn.isFunction(callback)) callback = function () { };

        var executeStack = function () {

            //Check if there are functions in a higher stack
            if (pointer < stack.length - 1 && stack[pointer + 1].length) pointer++;

            //Execute the function in the current stack dimension and increment array index
            var obj = stack[pointer][0];
            obj.f(obj.i);
            obj.i++;

            //Remove function from stack if completed
            if (obj.i == obj.a.length) {
                stack[pointer].shift();
                if (!stack[pointer].length) {
					stack.splice(pointer, pointer + 1);
					if (!stack[pointer] || !stack[pointer].length) pointer--;
				}
				
            }
        };

        //Execute the functions asynchronously on a timer, or synchronously
        if (options.async) {
            var timer = setTimeout(function () {
                
				//Execute for 20 ms at a time
				var timeout = new Date().getTime() + options.interval;
				
				while (new Date().getTime() <= timeout) {
				
					//If end of stack then quit
					if (!stack.length) {
						callback(result);
						clearInterval(timer);
						fn.reset();
						return;
					}
					
					executeStack();
				};
                
                //Recall this anonymous function in 20 ms
                timer = setTimeout(arguments.callee, options.interval);
				
            }, options.interval);
        }
        else {

            while (stack.length) executeStack();
            callback(result);
			fn.reset();
        }
    };
})


//jQuery bindings
fn.namespace(this.fn, function() {	
	
	if (!jQuery) this.coreException('jQuery library not found.')
		
	//Wrapper functions
	this.isFunction = jQuery.isFunction;
	this.isArray = jQuery.isArray;
	this.extend  = jQuery.extend;
	this.trim = jQuery.trim;
	
	
	//-- Plug-in helper
	var plugin;
	
	//Create a plug-in
	window.plugin = this.plugin = function(name, f) {
		
		plugin = {};
		plugin.name = name;	
		plugin.defaults = {};
		plugin.options = {};
		
		plugin.merge = function(values) {
			
			fn.extend(plugin.options, plugin.defaults, values);
		};
	
		//Extend jQuery with the function passed in
		jQuery.fn[plugin.name] = function() {
			
			plugin.selector = this;
			
			f.apply(plugin, arguments);
		}	
	}
	
	//Assign code to each selected element for the current plug-in
	this.plugin.each = function(f) {
			
		//Check that .each is called from within .plugin
		if (plugin == null) throw this.coreException('.each function must be contained within a plugin function.');
		if (!fn.isFunction(f)) return plugin.selector;
		
		return plugin.selector.each(function(i){
			f.call(this, plugin, i);
		});
	}
	
	
});	
	