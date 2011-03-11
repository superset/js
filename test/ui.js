//This is a qunit module
module('superset ui');

using('superset.ui.js');

test('superset.ui.widget', function () {

   var widget = new fn.ui.Widget();
   
   ok(widget.name() == 'widget', 'widget name is ' + widget.name());
   ok(widget.toString() == 'fn.ui.widget', 'widget toString ' + widget.toString());
   ok(widget.className() == 'fn-ui-widget', 'widget className ' + widget.className());
   ok(widget.className('over') == 'fn-ui-widget-over', 'widget className ' + widget.className('over'));
   
   var button = new fn.ui.Button();
   
   ok(button.name() == 'button', 'button name is ' + button.name());
   ok(button.toString() == 'fn.ui.button', 'button toString ' + button.toString());
   ok(button.className() == 'fn-ui-button', 'button className ' + button.className());
   ok(button.className('over') == 'fn-ui-button-over', 'button className ' + button.className('over'));
   ok(button.baseName() == 'fn-ui-widget', 'button baseName ' + button.baseName());
});





