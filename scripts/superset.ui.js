// ==ClosureCompiler==
// @output_file_name superset.ui.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/* NOTE: Superset UI is currently unsupported and undocumented. It may change substantially. */

/*
* Superset Framework - superset.ui
*
* @requires jQuery, superset.core, superset.data
*
* Copyright (c) James Westgate 2011
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/


using('superset.data');


//-- jQuery UI widget plug-in

plugin('widget', function(widget, options){
	
	this.merge(options);
	widget.init();
	    	
	var self = this.selector;
	
	//Add the underlying base css class (-widget) and current class
	self.addClass(widget.baseName());
	self.addClass(widget.className());
		
	//Add classes for each event behaviour
	var behaviours = widget.behaviours().start;

	for (var i = 0, len = behaviours.length; i < len; i++) {	    		
		(function(i) {
			self.live(behaviours[i].key, function() {
				self.filter(this).addClass(behaviours[i].css);
			});
		})(i);
	}
	
	//Remove classes for each event behaviour
	behaviours = widget.behaviours().end;

	for (var i = 0, len = behaviours.length; i < len; i++) {	    				
		(function(i) {
    		self.live(behaviours[i].key, function() {
    			self.filter(this).removeClass(behaviours[i].css);
    		});
		})(i);
	}
	
	//Bind any events
	var events = widget.events();
	
	for (var i = 0, len = events.length; i < len; i++) {
		(function(i) {
    		self.live(events[i].key, function(e){
				return events[i].fn(e);
			});
		})(i);
	}
	
    return self;
})


//-- Superset ui namespace

namespace('fn.ui', function(){
	
	//Support partial function calling
	//http://ejohn.org/blog/partial-functions-in-javascript/
	Function.prototype.partial = function()	{
		var fn = this, args = Array.prototype.slice.call(arguments);
		
		var result =  function() {
	  		var arg = 0;
	  		for (var i = 0; i < args.length && arg < arguments.length; i++ )
	    		if ( args[i] === undefined ) args[i] = arguments[arg++];
	      	
	  		return fn.apply(this, args);
		};
		
		result.partialOf = function() {
			return fn;
		};
		return result;
	};

	//-- Base Widget
	this.Widget = fn.type(function() {
		
		var _name = 'widget';
		var _startbehaviours = [];
		var _endbehaviours = [];
		var _events = [];
		
		
		this.init = function() {
			
		};
		
		//Add an event to the list of events
		this.addEvent = function(name, fn) {
			_events.push({key: name, fn: fn});
		};
		
		//Add a start and end behaviour
		var validBehaviours = ['mousedown', 'mouseup', 'mouseenter', 'mouseleave'];
		
		this.addBehaviour = function(start, end, css) {
			css = css.toString();
			
			//Only add valid behaviour
			if (validBehaviours.indexOf(start) > -1) _startbehaviours.push({key: start, css: css});
			if (validBehaviours.indexOf(end) > -1) _endbehaviours.push({key: end, css: css});
		};
		
		//Return all events that have been registered
		this.events = function() {
			if (arguments.length) fn.noArgumentsException();
			return _events;
		};
		
		//Return all behaviours that have been registered
		this.behaviours = function() {
			if (arguments.length) fn.noArgumentsException();
			return {start: _startbehaviours, end: _endbehaviours};
		};
		
		//Stores the name of the widget to be use in css behaviours etc
		this.name = function() {
			if (arguments.length) _name = arguments[0];
			return _name;
		};
				
		//Returns a string representation of the widget
		this.toString = function() {
			return ['fn', 'ui', this.name()].join('.');
		};
		
		//Returns a css compatible name and behaviour from a behaviour name
		this.className = function() {
			var array = ['fn', 'ui', this.name()];
			if (arguments.length) array.push(arguments[0]);
			return array.join('-');
		};
		
		//Returns the base class name
		this.baseName = function() {
			if (arguments.length) fn.noArgumentsException();
			return ['fn', 'ui', 'widget'].join('-');
		};
	});
	
	
	//-- Button Widget
	this.Button = fn.type(this.Widget, function() {
		fn.ui.Widget.call(this);
		this.name('button');
		
		//Setup behaviours
		this.onhover = this.addBehaviour('mouseenter', 'mouseleave', this.className('over'));
		this.onclick = this.addBehaviour('mousedown', 'mouseup', this.className('down'));
		
		//Setup events
		this.click = this.addEvent.partial('click', undefined);		
	});
});

