const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const moment = require('moment');

const { BadRequest } = require('@commercetools/sdk-middleware-http');
const { processProductUpdate } = require('../index');
const { simpleProduct, simpleProductResponse, simpleProductDuplicateResponse, http500Request } = require('./data');
const nock = require('nock');

describe('Function', function(){
	describe('returns', function(){
		const bufferedSimpleProduct = Buffer.from(JSON.stringify(simpleProduct)).toString('base64');
		it('nothing when processing a message older than specified', function(){
			const timestamp = moment().subtract(40, 'seconds').toISOString();
			expect(processProductUpdate({ data: bufferedSimpleProduct }, { timestamp, eventId: '11gqifec4ou' })).to.be.undefined;
		});
		it('code 201 on correct calls', async function(){
			await expect(processProductUpdate({ data: bufferedSimpleProduct })).to.eventually.deep.equal({
				body: simpleProductResponse,
				statusCode: 201,
			});
		});
		it('code 400 when trying to create existing product', async function(){
			expect(await processProductUpdate({ data: bufferedSimpleProduct })).to.have.property('message', 'A duplicate value \'"1111111111-111"\' exists for field \'key\'.');
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

