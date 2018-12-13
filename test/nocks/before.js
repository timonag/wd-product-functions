const nock = require('nock');
const { simpleProductResponse, simpleProductDuplicateResponse, http500Response } = require('../data');

const { CT_PROJECT_KEY } = process.env;

before(function(){
	/**
	 *	Authorizarion
	 */
	const auth = nock('https://auth.commercetools.co:443')
		.persist()
		.post('/oauth/token')
		.reply(
			200,
			{
				'access_token': 'hW5sms-KYPaajUrMNEjTsylM0fAwGfcg',
				'token_type': 'Bearer',
				'expires_in': 172395,
				'scope': `manage_project:${CT_PROJECT_KEY}`
			}
		);
	/**
	 *	API calls
	 */
	const createdProductsIds = new Set();
	const productsApi = nock('https://api.commercetools.co:443')
		.persist()
		.post(`/${CT_PROJECT_KEY}/products`)
		.reply(function(uri, requestBody) {
			const { key } = requestBody;

			// Special Key for 500's responses
			if (key === '1111111111-500') {
				return [
					500,
					http500Response
				];
			}

			// Keep tracking of already called products
			if (!createdProductsIds.has(key)) {
				createdProductsIds.add(key);
				return [
					201,
					simpleProductResponse
				];
			} else {
				return [
					400,
					simpleProductDuplicateResponse
				];
			}
		});
});

