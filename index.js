const { client } = require('./lib/client');

const projectKey = process.env.CT_PROJECT_KEY;

const EVENT_MAX_AGE = 20000;

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

/**
 * Cloud Pub/Sub message processor to convert CT product with other products with same StyleId into DW compatible format.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 * @returns	{Promise}
 */
function transformExportedProduct(event, context) {

	const productSource = _prepareProductDraft(event, context);
	// If a product is empty that means premature exit of the function, abort GCF as no retries are needed here.
	if(!productSource) {
		return;
	}
	const styleId = productSource.productProjection.masterVariant.attributes.find(attr => attr.name === 'styleID').value;

	const productsByStyleIdRequest = {
		uri: `/${projectKey}/product-projections?where=variants(attributes(name="styleID" and value="${styleId}"))`,
		method: 'GET',
	};
	return client
		.execute(productsByStyleIdRequest)
		.then(resp => {
			console.log(resp);
			const products = resp.body.results;
			console.log(products.length);
		})
		.catch(err => {
			console.error(new Error(err));
			return err;
		});
};

exports.processProductUpdate = processProductUpdate;
exports.transformExportedProduct = transformExportedProduct;
exports._api = {
	_prepareProductDraft,
}
