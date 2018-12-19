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
exports.client = createClient({
	middlewares: [authMiddleware, httpMiddleware],
});

