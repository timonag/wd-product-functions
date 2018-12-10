const { expect } = require('chai');
const { _api } = require('../index');
const { _prepareProductDraft } = _api;
const { simpleProduct } = require('./data');

describe('Internal API', function() {
	describe('prepare product draft function should', function() {
		it('be defined', function(){
			expect(_api).to.have.property('_prepareProductDraft');
			expect(_api._prepareProductDraft).to.be.an.instanceof(Function);
		});
		describe('throw an error on', function(){
			it('empty event', function(){
				expect(() => _prepareProductDraft(null)).to.throw(Error, 'Event object is not valid. "data" buffer must be specified.');
			});
			it('empty data property', function(){
				expect(() => _prepareProductDraft({})).to.throw(Error, 'Event object is not valid. "data" buffer must be specified.');
			});
			it('data property contains invalid JSON', function(){
				const data = Buffer.from("this is a test").toString('base64').slice(2);
				expect(() => _prepareProductDraft({ data })).to.throw(SyntaxError);
			});
		});
		describe('return correct object', function(){
			it('from parsed data property', function(){
				const data = Buffer.from(JSON.stringify(simpleProduct)).toString('base64');
				expect(_prepareProductDraft({ data })).to.deep.include(simpleProduct);
			});
		});
	});
});
