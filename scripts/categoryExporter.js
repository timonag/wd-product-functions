const { client } = require('../lib/client');
const fetch = require('node-fetch');

const projectKey = process.env.CT_PROJECT_KEY;

const ROOT_CATEGORY_ID = '8c8d059b-bbfe-47e2-96d7-09a5311e4fe5';


/**
 *	@param	{string}	parentCategoryId	Parent category ID from CT
 *	@param	{object[]}	subcategories	List of subcategories
 *
 *	@returns	Promise[]
 */
function processSubcategories(parentCategoryId, subcategories) {

	return Promise.all(subcategories.map(subcat => {
		const categoryDraft = {
			key: subcat.id,
			name: {
				en: subcat.name,
			},
			description: {
				en: subcat.description,
			},
			parent: {
				typeId: 'category',
				id: parentCategoryId,
			},
			slug: {
				en: subcat.id
			},
			externalId: subcat.id
		};
		const categoryRequest = {
			uri: `/${projectKey}/categories`,
			method: 'POST',
			body: JSON.stringify(categoryDraft),
		};
		return client.execute(categoryRequest)
			.then(response => {
				if (subcat.subcategories && subcat.subcategories.length) {
					return processSubcategories(response.body.id, subcat.subcategories);
				}
			});
	}));
}

fetch('https://toryburch-prod.apigee.net/v1/categories')
	.then(response => response.json())
	.then(body => {
		return processSubcategories(ROOT_CATEGORY_ID, body.subcategories);
	})
	.catch(err => {
		console.error(err);
	});
