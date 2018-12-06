/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.processProductUpdate = (event, context) => {
	if(!event || (!event.data && !event.attributes)) {
		return new Error('Event data is not valid. Either "data" buffer or "attributes" hash must be specified.');
	}
	if(event.data && event.data.length) {
		let messageJson = {};
		try {
			const pubsubMessage = Buffer.from(event.data, 'base64').toString();
			messageJson = JSON.parse(pubsubMessage);
		} catch(err) {
			return err;
		}
		return messageJson;
	} else if (event.attributes) {
		return event.attributes;
	}
};

