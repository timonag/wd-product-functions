const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const { processProductUpdate } = require('../index');
const { simpleProduct } = require('./data');
const nock = require('nock');

describe('CT responses', function(){
	const bufferedSimpleProduct = Buffer.from(JSON.stringify(simpleProduct)).toString('base64');
	it('with 200 on calls', async function(){
		await expect(processProductUpdate({ data: bufferedSimpleProduct })).to.eventually.be.ok;
	});
})
