const { createClient } = require('@commercetools/sdk-client');
const { createAuthMiddlewareForClientCredentialsFlow } = require('@commercetools/sdk-middleware-auth');
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http');
const fetch = require('node-fetch');

const projectKey = process.env.CT_PROJECT_KEY;
const clientId = process.env.CT_CLIENT_ID;
const clientSecret = process.env.CT_CLIENT_SECRET;
const scopes = [process.env.CT_SCOPES];

// Setup CT middlewares
const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
	host: 'https://auth.commercetools.co',
	projectKey,
	credentials: {
		clientId,
		clientSecret,
	},
	scopes,
	fetch,
});
const httpMiddleware = createHttpMiddleware({
	host: 'https://api.commercetools.co',
	fetch,
});
// Setup CT client
const client = createClient({
	middlewares: [authMiddleware, httpMiddleware],
});

/**
 *	Function prepares product from PubSub message
 *	@param	{Object}	event	MessagePayload
 *	@returns	{ProductDraft}
 *	@private
 */
function _prepareProductDraft(event) {
	if(!event || !event.data) {
		throw new Error('Event object is not valid. "data" buffer must be specified.');
	}
	let messageJson = {};
	try {
		const pubsubMessage = Buffer.from(event.data, 'base64').toString();
		messageJson = JSON.parse(pubsubMessage);
	} catch(err) {
		throw new SyntaxError('Data property contains invalid json');
	}
	return messageJson;
};

/**
 * Cloud Pub/Sub message processor to update CT product with DW payload.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 * @returns	{Promise}
 */
function processProductUpdate(event, context) {

	const productDraft = _prepareProductDraft(event);

	const productsRequest = {
		uri: `/${projectKey}/products`,
		method: 'POST',
		body: JSON.stringify(productDraft),
	};
	return client.execute(productsRequest);
};

exports.processProductUpdate = processProductUpdate;
exports._api = {
	_prepareProductDraft,
}
