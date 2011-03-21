// ==ClosureCompiler==
// @output_file_name leaf.template.tools.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/*
* Leaf Framework - leaf template tools for the creation of template IL
* 
* @requires jQuery, leaf.core, leaf.template
*
* Copyright (c) James Westgate 2010
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/

leaf.namespace('leaf.template',  function() { 

    //Main parsing function
    this.create = function(html) {

        var graph = {};
        var root = $(html);
        
        walk(root, graph);
        
        function walk(e, node) {

            //Element	1
            //Attribute	2
            //Text		3
            //Comment	8
            //Document	9

            if (e.nodeType == 1 || e.nodeType == 2) {
            	var subnode = {};
                node[e.nodeName] = subnode;
                
                $(e).children().each(function () {
                    walk(this, subnode);
                });
            }
            
            if (e.nodeType == 3) node[e.nodeName] = e.nodeValue;
        }
    };
});




