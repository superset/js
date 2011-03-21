module('superset core');


test('fn.namespace', function () {
	
	var space1 = fn.namespace('alpha');
	ok(window.alpha != null, 'alpha namespace created');
	ok(window.alpha == space1, 'alpha namespace returned');

	var space2 = fn.namespace('alpha.beta');
	ok(window.alpha.beta != null, 'beta namespace created');
	ok(window.alpha.beta == space2, 'beta namespace returned');

	var space3 = fn.namespace('alpha.beta.charlie');
	ok(window.alpha.beta.charlie != null, 'charlie namespace created');
	ok(window.alpha.beta.charlie == space3, 'charlie namespace returned');

	var space4 = fn.namespace('delta.echo');
	ok(window.delta != null, 'delta namespace created');
	ok(window.delta.echo != null, 'echo namespace created');
	ok(window.delta.echo == space4, 'echo namespace returned');
	
	var space5 = fn.namespace(window.alpha);
	ok(window.alpha == space5, 'alpha object namespace returned');
	
});

test('fn.type', function(name) {
	
	var Person = fn.type(function(name){
		this.name = name;
	});
	
	var Employee = fn.type(Person, function(name){
		Person.call(this, name);
		this.salary = 123;
		this.getBonus = function() {
			return 500;
		};
	});
	
	var Director = fn.type(Employee, function(name){
		Employee.call(this, name);
		this.options = 1000;
		this.getBonus = function() {
			return this.base.getBonus() * 10;
		};
	});
	
	
	//Create test objects
	var person = new Person('John');
	var employee = new Employee('Jack');
	var director = new Director('James');
	
	//Test types
	ok(person instanceof Person, 'person is Person');
	ok(employee instanceof Person, 'employee is Person');
	ok(employee instanceof Employee, 'employee is Employee');
	
	//Test constructors and properties
	ok(person.name == 'John', 'person is called John');
	ok(employee.name == 'Jack', 'employee is called Jack');
	ok(employee.salary == 123, 'employee salary is 123');
	ok(person.salary == null, 'person has no salary');
	
	//Test inheritance
	ok(director instanceof Person, 'director is Person');
	ok(director instanceof Employee, 'director is Employee');
	ok(director instanceof Director, 'director is Director');
	ok(director.options == 1000, 'director has share options');
	ok(director.salary == 123, 'director salary is 123');
	ok(person.name == 'John', 'director is called James');
	
	//Test overrides
	ok(person.base == null, 'person has null base');
	ok(employee.base != null, 'employee has a base');
	ok(director.base != null, 'director has a base');
	ok(typeof person.getBonus == 'undefined', 'person bonus is undefined');
	ok(employee.getBonus() == 500, 'employee bonus is 500.00');
	ok(director.getBonus() == 5000, 'director bonus is 5000.00');
	ok(director.base.getBonus() == 500, 'director original bonus is 500.00');

	
	var Car = fn.type(function() {
		this.speed = 120;
		this.price = 19999;
	});
	
	var Electric = fn.type(Car, function() {
		Car.call(this);
		this.getEmissions = function() {return '40 g/km'};
		this.rebate = 5000;
		this.range = 90;
	});
	
	var Petrol = fn.type(Car, function() {
		Car.call(this);
		this.mpg = 32;
		this.getEmissions = function() {return '172 g/km'}; //Override sibling
	});
	
	var Hybrid = fn.type(Petrol, Electric, function() {
		Petrol.call(this);
		Electric.call(this);
		this.range = 300; //Replace electric range
		this.type = 'extender';
		this.getEmissions = function() {return '90 g/km'}; //Override both
	});
	
	var MildHybrid = fn.type(Hybrid, function() {
		Hybrid.call(this);
		this.fail = true;
	})
	
	
	//Test multiple inheritance
	var tesla = new Electric();
	var ferrari = new Petrol();
	var prius = new Hybrid();
	var crz = new MildHybrid();
	
	//Test types
	ok(tesla instanceof Car, 'tesla is Car');
	ok(ferrari instanceof Car, 'ferrari is Car');
	ok(prius instanceof Car, 'prius is Car');
	ok(tesla instanceof Electric, 'tesla is Electric');
	ok(ferrari instanceof Petrol, 'ferrari is Petrol');
	ok(prius instanceof Hybrid, 'prius is Hybrid');
	
	ok(tesla.speed == 120, 'tesla speed 120');
	ok(tesla.rebate == 5000, 'tesla rebate 5000');
	ok(tesla.range == 90, 'tesla range 900');
	ok(tesla.getEmissions() == '40 g/km', 'tesla emissions 40 g/km');
	
	ok(ferrari.speed == 120, 'ferrari speed 120');
	ok(ferrari.mpg == 32, 'ferrari mpg 32');
	ok(ferrari.getEmissions() == '172 g/km', 'ferrari emissions 172 g/km g/km');
	
	ok(prius.speed == 120, 'prius speed 120');
	ok(prius.range == 300, 'prius range 300');
	ok(prius.type == 'extender', 'prius type extender');
	ok(prius.getEmissions() == '90 g/km', 'prius emissions 90 g/km');
	ok(prius.rebate == 5000, 'prius rebate 5000');
	ok(prius.mpg == 32, 'prius mpg 32');
	
	ok(crz.speed == 120, 'crz speed 120');
	ok(crz.range == 300, 'crz range 300');
	ok(crz.type == 'extender', 'crz type extender');
	ok(crz.getEmissions() == '90 g/km', 'crz emissions 90 g/km');
	ok(crz.rebate == 5000, 'crz rebate 5000');
	ok(crz.mpg == 32, 'crz mpg 32');
	ok(crz.fail == true, 'crz mpg 32');
	
});

test('fn.plugin', function() {
	
	var result = false;
	var result2 = false;
	var result3 = false;
	var result4 = -1;
	
	//Simple plugin test
	fn.plugin('unittest', function(options) {
		result = true;
		result2 = options.test;
		
		fn.plugin.each(function(options, i) {
			result3 = true;
			result4 = i;
		})
	})
	
	$('body').unittest({test: true});
	
	ok(result, 'plugin function is called');
	ok(result2, 'plugin options argument provided');
	ok(result3, 'plugin each called');
	ok(result4 > -1, 'plugin increment argument passed');
	
	result = false;
	
	//Merge options test
	fn.plugin('unittest2', function(options) {
		
		this.defaults.test = false;
		this.merge(options);
		result = this.options.test;
	})
	
	$('body').unittest2({test: true});
	ok(result, 'option merged');
	
	//Colorize test
	fn.plugin('colorize', function(options) {
		
		this.defaults.color = '#fff';
		this.merge(options);
		
		fn.plugin.each(function(colorize, i) {
			$(this).css('background-color', colorize.options.color);
		})
	})
	
	$('p').colorize({color: '#c00'});
})


test('fn.map, fn.reduce, fn.execute', function() {

    // -- Test Map / reduce --
    var values = new Array(9);

    //Add functions to place the values 1 to 9 in an array
    fn.map(values, function (index, value) {
        return index + 1;
    });

    //Add functions to sum the values from 0 to 9
    fn.reduce(values, 0, function (index, value, total) {
        return (total + value);
    });

    fn.execute({async: false}, function (result) {
        ok(result == 45, 'Simple reduced result is ' + result);
    });
    
    
    //-- Test 2, calculate no. of primes in first 50000 no's --
    //Create an array of booleans representing prime = false

	
    var bound = 10000;
    var composites = new Array(bound);

    //Set all to prime (false) to start
    fn.map(composites, function(index, value) {
        return false;
    });

    //Calculate the sqr root of the upper bound
    var upperBoundSquareRoot = Math.floor(Math.sqrt(bound), 0);

    //For each item, calculate the non primes
    fn.map(composites, function(index, value) {

        if (index < 2 || index > upperBoundSquareRoot) return value;

        //If the array item is a prime then map all non primes
        if (value == false) {

            var k = index * index;

            fn.map(composites, function(index2, value2) {

                if (index2 == k) {

                    k += index;
                    return true;
                }
                return value2;
            });
        }
        return value;
    });

    //Count only the primes
    fn.reduce(composites, 0, function(index, value, result) {

        if (index >= 2 && value == false) result++;
        return result;
    });

	//Stop the unit tests
    stop();
	
    fn.execute({ async: false}, function (result) {
        
		ok(result == 1229, 'Prime total reduced result is ' + result);
		
		//continue the test  
        start();
    });

	
	//-- Test 3 - test single map	
	var matchSentence =  /[^.!?]+/g; //Regex to split text into sentences
	var matchWord = /[a-zA-Z0-9_]+/g; //Regex to split sentences into words
	var text = 'This is a sentence and this is a test.';
	var dictionary = {};
	
	//Split into sentences by using the supplied regex
    var sentences = text.match(matchSentence); //Any character that delimits a sentence
	var words;
	
	//Trim each sentence and break into words
	fn.map(sentences, function(index, sentence) {
		
		var sentence = fn.trim(sentence);
		words = sentence.match(matchWord);
        
    	//Loop through all words and count the times they appear
    	fn.map(words, function(index2, word){
			
			word = word.toLowerCase();
			
			if (dictionary[word] == null) dictionary[word] = 0;
			dictionary[word]++;
			
			return word;				
		});
		
		return sentence;
	});
	
	//Stop the unit tests
    stop();
	
	fn.execute({ async: false}, function (result) {
		
		//Get the keys in the index
		var keys = [], i=0;
		for (keys[i++] in dictionary);
		
		ok(keys.length > 0, 'Keys added to index: ' + keys.length);
		ok(dictionary['this'] == 2, 'Word count for "this" is 2');
		ok(dictionary['sentence'] == 1, 'Word count for "sentence" is 2');
		ok(dictionary['balloon'] == null, 'Word "balloon" not found.')
		
		        
		//continue the test  
        start();
    });

});




