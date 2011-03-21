// ==ClosureCompiler==
// @output_file_name superset.data.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/*
* Superset Framework - superset.data
* 
* @requires superset.core
*
* Copyright (c) James Westgate 2011
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/

//-- Templating
namespace(this.fn, function() {
	
	 var elements = 'a,abbr,address,area,article,aside,audio,b,base,bb,bdo,blockquote,body,br,button,canvas,caption,cite,\
    	code,col,colgroup,command,datagrid,datalist,dd,del,details,dialog,dfn,div,dl,dt,em,embed,eventsource,fieldset,\
    	figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,\
    	link,mark,map,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,pre,progress,q,ruby,\
    	rp,rt,samp,script,section,select,small,source,span,strong,sub,sup,table,tbody,td,textarea,tfoot,th,\
    	thead,time,title,tr,ul,var,video'.split(',');

    var elementTable = {};
    var output = [];

    //Create an associative array from the elements and attributes
    for (var i = elements.length - 1; i >= 0; i--) elementTable[elements[i]] = true;
    elements = null;

    //Main parsing function
    this.build = function (il) {
        output = [];
        parseIl(il, false, false);
        return output.join('');
    };

    //Private functions
    //Parse each element in the template IL recursively
    function parseIl(il, inTag, inAttr) {
        
		var type = Object.prototype.toString.call(il);
        var result = false;

        if (type === '[object Array]') {
            for (var i = 0, length = il.length; i < length; i++) {
                parseIl(il[i]);
            }
        } 
		else if (type === '[object Function]') {
            parseIl(il());

        } 
		else if (type === '[object Object]') {
            for (var key in il) {

                //Catch special case using text
                if (key == 'text') {
                    parseIl(il[key], true, false);
                    result = true;
                }
                else {

                    //Tag or an attribute
                    if (elementTable[key]) {

                        //If we have an open tag close it
                        if (inTag) {
                            output.push('>');
                            result = true;
                        }

                        output.push('<');
                        output.push(key);
                        if (!parseIl(il[key], true, false)) output.push('>');
                        output.push(['</', key, '>'].join(''));
                    }
                    else {
                        output.push([' ', key, '="'].join(''));
                        parseIl(il[key], false, true);
                        output.push('"');
                    }
                }
            };

        } 
		else {
            if (!inAttr && inTag) {
                output.push('>');
                result = true;
            }

            //Render text inside tag or attribute
            output.push(il);
        }

        return result;
    }
});


//-- Databinding
namespace(this.fn, function() {
	
	//-- Bind data plug-in
	fn.plugin('databind', function(data, map, templ) {
	
		//Loop through elements
			fn.plugin.each(function(plugin, i) {
		
				fn.databind(this, data, map, templ);
		});
	});
	
		
	//Bind an object
	this.databind = function(element, data, map, templ){
   		
		//Check for array
		if (fn.isArray(data)) {
			for (var i=0, len=data.length; i<len; i++) fn.databind(element, data[i], map, templ);
			return;
		}
		
		//Process any template
		element = (templ === undefined) ? element = $(element) : $(templ).appendTo(element);
		
		//Loop through data and match to map
		for (var key in data) {
	   	
	   		var selector = map[key];
			var value = data[key];
			var attr = null;
			
			//Determine if an attribute is specified
			if (fn.isArray(selector)) {
				attr = selector[1];
				selector = selector[0];
			}
			
			//Process child objects
			if (typeof(value) == 'object') {
				fn.databind(element, value, selector, templ);
				continue;
			}
			
			//Get binding function from selector (first only)
			var e = (selector.length) ?  $(selector, element).first(): element;
			(attr === null) ? e.text(value): e.attr(attr, value);
		}
	}
});


//-- Stringify
// Based on Douglas Crockford's json2 library - http://www.JSON.org/json2.js

namespace(this.fn, function() {
		
	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.
    this.stringify = function(value){
    	return stringify('', {'': value});
	};
	
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    
    //Table of character substitutions
	var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
	
	//Set prototypes
    if (typeof Date.prototype.toJSON !== 'function') {

    	//Format integers to have at least two digits.
		var f = function(n) {
        	return n < 10 ? '0' + n : n;
    	};

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }
	
	//If the string contains no control characters, no quote characters, and no backslash characters, then we can safely slap some quotes around it.
	//Otherwise we must also replace the offending characters with safe escape sequences.
    function quote(string) {

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }
    
    //Produce a string from holder[key].
    function stringify(key, holder) {

        var i; //The loop counter.
        var k; //The member key.
        var v; //The member value.
        var length;
        var partial;
        var value = holder[key];

		//If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') value = value.toJSON(key);

		//What happens next depends on the value's type.
        switch (typeof value) {
        
        case 'string':
            
            return quote(value);

        //JSON numbers must be finite. Encode non-finite numbers as null.
        case 'number':
            
            return isFinite(value) ? String(value) : 'null';

		//If the value is a boolean or null, convert it to a string. Note:
		//typeof null does not produce 'null'. The case is included here in
		//the remote chance that this gets fixed someday.
        case 'boolean':
        case 'null':

            return String(value);

		//If the type is 'object', we might be dealing with an object or an array or null.
        case 'object':

			//Due to a specification blunder in ECMAScript, typeof null is 'object', so watch out for that case.
            if (!value) return 'null';

			//Make an array to hold the partial results of stringifying this object value.
            partial = [];

			//Is the value an array?
            if (Object.prototype.toString.apply(value) === '[object Array]') {

				//The value is an array. Stringify every element. Use null as a placeholder for non-JSON values.
                length = value.length;
                for (i = 0; i < length; i++) {
                    partial[i] = stringify(i, value) || 'null';
                }

				// Join all of the elements together, separated with commas, and wrap them in brackets.
                v = partial.length === 0 ? '[]' : '[' + partial.join(',') + ']';
                          
                return v;
            }

			//Iterate through all of the keys in the object.
            for (k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    v = stringify(k, value);
                    if (v) partial.push(quote(k) + ':' + v);
                }
            }

			//Join all of the member texts together, separated with commas, and wrap them in braces.
            v = partial.length === 0 ? '{}' : '{' + partial.join(',') + '}';
            return v;
        }
    }
});

// Based on store.js by Marcus Westin http://github.com/marcuswestin/store.js
namespace('fn.storage', function() {
	
	var doc = window.document;
	var localStorageName = 'localStorage';

	var storage;

	this.supported = true;

    //Place in local storage if browser supports it
    if (localStorageName in window && window[localStorageName]) {

        storage = window[localStorageName];
        
		this.set = function (key, val) {
			if (typeof val === 'object') val = fn.stringify(val);
			storage[key] = val;
		};
		
		this.get = function (key) {
			return storage[key];
		};

		this.remove = function (key) {
			delete storage[key];
		};
        this.clear = function() {
        	storage.clear();
        };
    } 
    
	//Older browsers using behaviour
    //See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx , http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
	else if (doc.documentElement.addBehavior) {

        this.set = function(key, val) {
            if (!storage) createStorage();
			if (typeof val === 'object') val = fn.stringify(val);
            
			storage.setAttribute(key, val);
            storage.save(localStorageName);
        };

        this.get = function(key) {
            if (!storage) createStorage();
            return storage.getAttribute(key);
        };
		
        this.remove = function(key) {
            if (!storage) createStorage();
            storage.removeAttribute(key);
            storage.save(localStorageName);
        };

        this.clear = function() {
            if (!storage) createStorage();
            
			var attributes = storage.XMLDocument.documentElement.attributes;
			storage.load(localStorageName);
            
			for (var i = 0, attr; attr = attributes[i]; i++) {
                storage.removeAttribute(attr.name);
            }
            
			storage.save(localStorageName);
        };

        function createStorage() {
            storage = doc.body.appendChild(doc.createElement('div'));
            storage.style.display = 'none';
            storage.addBehavior('#default#userData');
            storage.load(localStorageName);
        };
    } 

	//Default catch all implementation
	else {
        this.supported = false;
    }
	
	if (this.supported) {
		
		this.getObject = function (key) {
			return jQuery.parseJSON(this.get(key));
		};
	}
});


//-- Cookie code

// Based on the cookie project by Klaus Hartl/klaus.hartl@stilbuero.de
// eg  fn.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
namespace(this.fn, function() {
	
	this.cookie = function(name, value, options) {
		
	    if (typeof value != 'undefined') { // name and value given, set cookie
	        
			options = options || {};
			
	        if (value === null) {
	            value = '';
	            options.expires = -1;
	        }
			
	        var expires = '';
	        
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
	            
				var date = options.expires;
	            
				if (typeof date === 'number') {
	                date = new Date();
	                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
	            } 
	            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
	        }
			
	        document.cookie = [name, '=', encodeURIComponent(value), expires, 
				options.path ? '; path=' + options.path : '', 
				options.domain ? '; domain=' + options.domain : '', 
				options.secure ? '; secure' : ''].join('');
	    } 
		else { // only name given, get cookie
	        
			var cookieValue = null;
	        
			if (document.cookie && document.cookie != '') {
	            var cookies = document.cookie.split(';');
	            for (var i = 0, len=cookies.length; i < len; i++) {
	                var cookie = fn.trim(cookies[i]);
	                
					// Does this cookie string begin with the name we want?
	                if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                    break;
	                }
	            }
	        }
	        return cookieValue;
	    }
	};
});



