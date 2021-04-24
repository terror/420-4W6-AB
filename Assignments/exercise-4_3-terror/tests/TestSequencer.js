const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class TestSequencer extends Sequencer {
	sort(tests) {
		const orderPath = [
			path.join(__dirname, './http.test.js'),
			path.join(__dirname, './browser.test.js'),
		];

		return tests.sort((testA, testB) => {
			const indexA = orderPath.indexOf(testA.path);
			const indexB = orderPath.indexOf(testB.path);

			if (indexA === indexB) return 0; // do not swap when tests both not specify in order.

			if (indexA === -1) return 1;
			if (indexB === -1) return -1;

			return indexA < indexB ? -1 : 1;
		});
	}
}

module.exports = TestSequencer;
