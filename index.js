const { createClient } = require('@commercetools/sdk-client');
const { createAuthMiddlewareForClientCredentialsFlow } = require('@commercetools/sdk-middleware-auth');
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http');
const fetch = require('node-fetch');

const projectKey = process.env.CT_PROJECT_KEY;
const clientId = process.env.CT_CLIENT_ID;
const clientSecret = process.env.CT_CLIENT_SECRET;
const scopes = [process.env.CT_SCOPES];

const EVENT_MAX_AGE = 20000;

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
 *	@param	{!Object}	context	Metadata for the event.
 *	@returns	{ProductDraft}
 *	@private
 */
function _prepareProductDraft(event, context = {}) {
	// Computing message age to stop retries
	const eventAge = Date.now() - Date.parse(context.timestamp);
	if (!!eventAge && eventAge > EVENT_MAX_AGE) {
		console.log(`Dropping event ${context.eventId} with age ${eventAge} ms.`);
		return;
	}

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

	const productDraft = _prepareProductDraft(event, context);
	// If a product is empty that means premature exit of the function, abort GCF as no retries are needed here.
	if(!productDraft) {
		return;
	}

	const productsRequest = {
		uri: `/${projectKey}/products`,
		method: 'POST',
		body: JSON.stringify(productDraft),
	};
	return client.execute(productsRequest)
		.catch(err => {
			if (err.name === 'BadRequest') {
				console.error(new Error(err));
				return err;
			}
			throw new Error(err);
		});
};

exports.processProductUpdate = processProductUpdate;
exports._api = {
	_prepareProductDraft,
}
