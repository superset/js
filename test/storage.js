//This is a qunit module
module('superset storage');

using('superset.storage');

test('fn.storage', function () {

	//Test store set/get
	var result = false;
	fn.storage.set('test', true);
	result = fn.storage.get('test');
	
	ok(result, 'Simple set/get')
	
	//Test object setobject/getobject
	var obj = {val1: true, val2: true};
	fn.storage.set('test2', obj);
	var result2 = fn.storage.getObject('test2');
	
	ok(result2.val1 && result2.val2, 'Object stored using set/get')

});

test('fn.cookie', function () {

	ok(fn.cookie != null, 'fn.cookie exists');
	
	fn.cookie('leaf', 'test');
	ok(fn.cookie('leaf') == 'test', 'Write read cookie');
	
	fn.cookie('leaf', null);
	ok(fn.cookie('leaf') == null, 'Cookie deleted');
	
	ok(fn.cookie('unknown')== null, 'Cookie unknown');
});





