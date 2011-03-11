// ==ClosureCompiler==
// @output_file_name superset.storage.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/*
* Superset Framework - Superset Storage functions
* 
* @requires superset.core
*
* Copyright (c) James Westgate 2010
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/


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
	

