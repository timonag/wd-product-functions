const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const moment = require('moment');
const nock = require('nock');
const sinon = require('sinon');

const { BadRequest } = require('@commercetools/sdk-middleware-http');
const { processProductUpdate } = require('../index');
const { simpleProduct, simpleProductResponse, simpleProductDuplicateResponse, http500Request } = require('./data');

describe('Function', function(){
	afterEach(function() {
		sinon.restore();
	});

	describe('returns', function(){
		const bufferedSimpleProduct = Buffer.from(JSON.stringify(simpleProduct)).toString('base64');
		it('nothing when processing a message older than specified', function(){
			// Setup console.log stub
			const logStub = sinon.stub(console, 'log');
			logStub.withArgs(sinon.match('Dropping event 11gqifec4ou')).returns(undefined);
			logStub.callThrough();

			const timestamp = moment().subtract(40, 'seconds').toISOString();
			expect(processProductUpdate({ data: bufferedSimpleProduct }, { timestamp, eventId: '11gqifec4ou' })).to.be.undefined;
			expect(logStub.calledOnce).to.be.true;
			expect(logStub.firstCall.lastArg).to.include('Dropping event 11gqifec4ou with age');

			// Restore console.log stub
			console.log.restore();
		});
		it('code 201 on correct calls', async function(){
			await expect(processProductUpdate({ data: bufferedSimpleProduct })).to.eventually.deep.equal({
				body: simpleProductResponse,
				statusCode: 201,
			});
		});
		it('code 400 when trying to create existing product', async function(){
			// Setup console.error stub
			const errorStub = sinon.stub(console, 'error');
			errorStub.withArgs(sinon.match.has('message', sinon.match('BadRequest'))).returns(undefined);
			errorStub.callThrough();

			expect(await processProductUpdate({ data: bufferedSimpleProduct })).to.have.property('message', 'A duplicate value \'"1111111111-111"\' exists for field \'key\'.');
			expect(errorStub.calledOnce).to.be.true;
			expect(errorStub.firstCall.lastArg).to.be.an('error').that.have.a.property('message', 'BadRequest: A duplicate value \'"1111111111-111"\' exists for field \'key\'.');

			// Restore console.error stub
			console.error.restore();
		});
	});
	describe('throws', function(){
		it('code 500 on server errors', async function(){
			const data = Buffer.from(JSON.stringify(http500Request)).toString('base64');
			return processProductUpdate({ data })
				.catch(err => {
					expect(err).to.have.property('message', 'InternalServerError: Internal server error');
				});
		});
	});
});

