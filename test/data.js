//This is a qunit module
module('superset data');

using('superset.data');

test('fn.template', function () {

    //Simple tag
    var il = { div: '' };
    var out = fn.template.build(il);
    ok(out == '<div></div>', 'Simple Tag');

    //Simple tag with attribute
    il = { div: { style: 'z-order: 0'} };
    out = fn.template.build(il);
    ok(out == '<div style="z-order: 0"></div>', 'Simple tag with attribute: ' + out);

    //Simple tag with class attribute
    il = { div: { 'class': 'bacon'} };
    out = fn.template.build(il);
    ok(out == '<div class="bacon"></div>', 'Simple tag with class attribute: ' + out);

    //Simple nested tag
    il = { div: { p: 'Hello world'} };
    out = fn.template.build(il);
    ok(out == '<div><p>Hello world</p></div>', 'Simple nested tag: ' + out);;

    //Simple nested tag with style
    il = { div: { p: { style: 'color: red', text: 'Hello world'}}};
    out = fn.template.build(il);
    ok(out == '<div><p style="color: red">Hello world</p></div>', 'Simple nested tag with style: ' + out);

    //Complex nested Tag
    il = { div: { style: 'z-order: 1', p: 'Hello world'} };
    out = fn.template.build(il);
    ok(out == '<div style="z-order: 1"><p>Hello world</p></div>', 'Complex nested Tag: ' + out);
});


test('binddata plug-in', function () {

	stop();
	
	$(document).ready(function() {
		
		//-- Simple binddata plug-in test
		
		$('body').append('<div id="test1" class=""><p id="title"></p><p id="content"></p></div>');
		
		var data = {title: 'test', content: 'lorem ipsum'};
		var map = {title: 'p', content: 'p:eq(1)'}; 
			
		$('#test1').binddata(data, map);
	
		ok($('#test1 p:eq(0)').text() == 'test', 'p is test');
		ok($('#test1 p:eq(1)').text() == 'lorem ipsum', 'p is lorem ipsum');
		
		//-- Example 2 bid complex data
		
		$('body').append('<div id="test2"><p id="title"></p><p id="content"></p></div>');
		
		data = {text: {title: 'test', content: 'lorem ipsum'}};
		map = {text: {title: 'p', content: 'p:eq(1)'}}; 
			
		$('#test2').binddata(data, map);
		
		ok($('#test2 p:eq(0)').text() == 'test', 'p is test');
		ok($('#test2 p:eq(1)').text() == 'lorem ipsum', 'p is lorem ipsum');

		
		//-- Example 3 bindform
		$('body').append('<div id="test3"><form id="form1" action=""><input type="text" id="txtName"/><input type="text" id="txtAge"/></form></div>');
		data = {name: 'John', age: 27, post:'action.htm'};
		map = {name: ['#txtName', 'value'], age: ['#txtAge', 'value'], post: ['', 'action']};
			
		$('#test3').binddata(data, map);
		
		ok($('#test3 #txtName').attr('value') == 'John', 'name is John');
		ok($('#test3 #txtAge').attr('value') == '27', 'age is 27');
		ok($('#test3 #txtName').attr('value') == 'John', 'name is John');

		
		//-- Example 4 bindselect
		
		$('body').append('<div id="test4"><form id="form2" action="#"><select id="drpGender"></select></form></div>');
				
		var templ = '<option value=""></option>';
		data = [{id: 0, desc: 'male'}, {id: 1, desc: 'female'}];
		map = {id: ['', 'value'], desc: ''};

		$('#test4 select').binddata(data, map, templ);
			
		ok($('#test4 option:eq(0)').attr('value') == '0', 'value is 0');
		ok($('#test4 option:eq(1)').attr('value') == '1', 'value is 1');
		ok($('#test4 option:eq(0)').text() == 'male', 'text is male');
		ok($('#test4 option:eq(1)').text() == 'female', 'text is female');

		
		//-- Example 5 bindtable
			
		$('body').append('<div id="test5"><table><tbody/></table></div>');
		
		templ = '<tr><td></td><td></td><td></td></tr>';
		data = [{id: 1, name: 'john', age:27}, {id: 2, name: 'bob', age:30}];
		map = {id: 'td', name: 'td:eq(1)', age: 'td:eq(2)'};
			
		$('#test5 tbody').binddata(data, map, templ);
		
		ok($('#test5 tr:eq(0) td:eq(0)').text() == '1', 'td is 1');
		ok($('#test5 tr:eq(0) td:eq(1)').text() == 'john', 'td is john');
		ok($('#test5 tr:eq(0) td:eq(2)').text() == '27', 'td is 27');
		
		ok($('#test5 tr:eq(1) td:eq(0)').text() == '2', 'td is 2');
		ok($('#test5 tr:eq(1) td:eq(1)').text() == 'bob', 'td is bob');
		ok($('#test5 tr:eq(1) td:eq(2)').text() == '30', 'td is 30');
			
		//-- Clean up
		$('#test1, #test2, #test3, #test4, #test5').remove();
		
		start();
	})
});

test('fn.stringify', function() {

	var il = { div: '' };
    var out = fn.stringify(il);
    ok(out == '{"div":""}', 'Simple Div: ' + out);

    //Simple tag with attribute
    il = { div: { style: 'z-order: 0'} };
    out = fn.stringify(il);
    ok(out == '{"div":{"style":"z-order: 0"}}', 'Simple tag with attribute: ' + out);

    //Simple tag with class attribute
    il = { div: { 'class': 'bacon'} };
    out =  fn.stringify(il);
    ok(out == '{"div":{"class":"bacon"}}', 'Simple tag with class attribute: ' + out);

    //Simple nested tag
    il = { div: { p: 'Hello world'} };
    out =  fn.stringify(il);
    ok(out == '{"div":{"p":"Hello world"}}', 'Simple nested tag: ' + out);

    //Simple nested tag with style
    il = { div: { p: { style: 'color: red', text: 'Hello world'}}};
    out = fn.stringify(il);
    ok(out == '{"div":{"p":{"style":"color: red","text":"Hello world"}}}', 'Simple nested tag with style: ' + out);

    //Complex nested Tag
    il = { div: { style: 'z-order: 1', p: 'Hello world'} };
    out = fn.stringify(il);
    ok(out == '{"div":{"style":"z-order: 1","p":"Hello world"}}', 'Complex nested Tag: ' + out);;
	
});


