const Request = require('../src/router/Request');

test('Request class has the correct variables and functions.', () => {
	const request = new Request();

	// Variables
	expect(Reflect.has(request, 'controllerName')).toBe(true);
	expect(Reflect.has(request, 'requestMethod')).toBe(true);
	expect(Reflect.has(request, 'parameters')).toBe(true);

	// Functions
	expect(Reflect.has(request, 'constructor')).toBe(true);
	expect(Reflect.has(request, 'getControllerName')).toBe(true);
	expect(Reflect.has(request, 'getRequestMethod')).toBe(true);
	expect(Reflect.has(request, 'getParameters')).toBe(true);
});

/**
 * Google "JS default parameters" to find out how a function can set initial
 * values for its parameters if none were passed in by the caller.
 */
test('Request class sets default request parameters.', () => {
	const request = new Request();

	expect(request.getControllerName()).toBe('');
	expect(request.getRequestMethod()).toBe('GET');
	expect(request.getParameters()).toMatchObject({});
});

/**
 * A bit of crazy syntax here! This test will be run many times. Each time
 * it runs, it will work with a new set of data that is provided by the table
 * outlined in the "each". Every column in the "each" corresponds to the function
 * input parameters (line 48). For example, the first time the test runs,
 * requestMethod will be GET. The fifth time the test runs, requestMethod will be POST.
 */
test.each`
	requestMethod | path            | bodyParameters                          | parsedController  | parsedParameters
	${'GET'}      | ${'/'}          | ${{}}                                   | ${''}             | ${{ body: {}, header: {} }}
	${'GET'}      | ${'/digimon'}   | ${{}}                                   | ${'digimon'}      | ${{ body: {}, header: {} }}
	${'GET'}      | ${'/pokemon'}   | ${{}}                                   | ${'pokemon'}      | ${{ body: {}, header: {} }}
	${'GET'}      | ${'/pokemon/1'} | ${{}}                                   | ${'pokemon'}      | ${{ body: {}, header: ['1'] }}
	${'POST'}     | ${'/pokemon'}   | ${{ name: 'Bulbasaur', type: 'Grass' }} | ${'pokemon'}      | ${{ body: { name: 'Bulbasaur', type: 'Grass' }, header: [] }}
	${'PUT'}      | ${'/pokemon/1'} | ${{ name: 'Bulbasaur', type: 'Grass' }} | ${'pokemon'}      | ${{ body: { name: 'Bulbasaur', type: 'Grass' }, header: ['1'] }}
	${'DELETE'}   | ${'/pokemon/1'} | ${{}}                                   | ${'pokemon'}      | ${{ body: {}, header: ['1'] }}
`('Request class can parse $requestMethod $path.',
	({
		requestMethod, path, bodyParameters, parsedController, parsedParameters,
	}) => {
		const request = new Request(requestMethod, path, bodyParameters);

		expect(request.getControllerName()).toBe(parsedController);
		expect(request.getRequestMethod()).toBe(requestMethod);
		expect(request.getParameters()).toMatchObject(parsedParameters);
	});
