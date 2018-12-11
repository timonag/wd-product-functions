const { expect } = require('chai');
const moment = require('moment');
const { _api } = require('../index');
const { _prepareProductDraft } = _api;
const { simpleProduct } = require('./data');

describe('Internal API', function() {
	describe('prepare product draft function should', function() {
		const bufferedSimpleProduct = Buffer.from(JSON.stringify(simpleProduct)).toString('base64');
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
		describe('handle message timestamp', function() {
			it('older than defined', function() {
				const timestamp = moment().subtract(40, 'seconds').toISOString();
				expect(() => _prepareProductDraft({ data: bufferedSimpleProduct }, { timestamp, eventId: '11gqifec4ou' })).to.not.throw();
			});
		});
		describe('return correct object', function(){
			it('from parsed data property', function(){
				expect(_prepareProductDraft({ data: bufferedSimpleProduct })).to.deep.include(simpleProduct);
			});
		});
	});
});
