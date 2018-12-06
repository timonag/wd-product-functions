const { expect } = require('chai');
const { processProductUpdate } = require('../index');

describe('DW product function should', function() {
	describe('throw an error on', function(){
		it('empty event', function(){
			expect(() => processProductUpdate(null)).to.throw(Error, 'Event data is not valid. Either "data" buffer or "attributes" hash must be specified.');
		});
		it('both empty data and attributes properties', function(){
			expect(() => processProductUpdate({})).to.throw(Error, 'Event data is not valid. Either "data" buffer or "attributes" hash must be specified.');
		});
		it('data property contains invalid JSON', function(){
			const data = Buffer.from("this is a test").toString('base64').slice(2);
			expect(() => processProductUpdate({ data })).to.throw(SyntaxError);
		});
	});
	describe('return correct object', function(){
		it('from parsed data property', function(){
			const source = {
				test: '2',
				test2: null,
				test3: undefined,
				test4: 120,
			};
			const data = Buffer.from(JSON.stringify(source)).toString('base64');
			// Keys with undefined values do not persist stringify
			delete source.test3;
			expect(processProductUpdate({ data })).to.deep.include(source).and.to.not.have.keys('test3');
		});
		it('from attribute property', function(){
			const attributes = {
				test: '2',
				test2: null,
				test3: undefined,
				test4: 120,
			};
			expect(processProductUpdate({ attributes })).to.deep.equal(attributes);
		});
	});
});
