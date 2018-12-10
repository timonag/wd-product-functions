const nock = require('nock');

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
				'scope': 'manage_project:tb-test2'
			}
		);
	/**
	 *	API calls
	 */
	const productsApi = nock('https://api.commercetools.co:443')
		.persist()
		.post('/tb-test2/products')
		.reply(201, {});
});

