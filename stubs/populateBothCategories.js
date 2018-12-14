const crypto = require('crypto');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('hex');
const { processProductUpdate } = require('../index');

const PRODUCT_TYPE1 = 'c340d563-b9bc-4d58-a15a-2cd29b24bf87';
const PRODUCT_TYPE2 = 'bf90e895-deaa-4b9d-aa5d-f7ae6ee4c3b4';

const CATEGORY_LIST = [
	'a82eeb38-5d8d-47e6-9aa0-1fc12415d2af',
	'1424e7fd-a530-468e-80b1-4ae81b9a5410',
	'5db43e68-9e37-41a9-818c-69f2346a8d7b'
];

const SIZE_LIST = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
const COLOR_LIST = [
	{ colorId: 'ff0000', colorGroup: 'red', },
	{ colorId: 'cc0000', colorGroup: 'red', },
	{ colorId: '00ff00', colorGroup: 'green', },
	{ colorId: '00cc00', colorGroup: 'green', },
	{ colorId: '0000ff', colorGroup: 'blue', },
	{ colorId: '0000cc', colorGroup: 'blue', }
];

function* getCategory() {
	while(true) {
		yield CATEGORY_LIST[Math.floor(Math.random() * CATEGORY_LIST.length)];
	}
};

function getSizeColor() {
	const size = SIZE_LIST[Math.floor(Math.random() * SIZE_LIST.length)];
	const { colorId, colorGroup } = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
	return [size, colorId, colorGroup];
};

function getSizedVariant(sizeCode, colorId, colorGroup) {
	const eurValue = Math.floor(Math.random() * 50000);

	const attributes = [
		{
			name: 'sizeCode',
			value: sizeCode,
		}
	];
	if (colorId && colorGroup) {
		attributes.push({
			name: 'colorID',
			value: colorId
		},
		{
			name: 'colorGroup',
			value: colorGroup
		});
	} else {
		attributes.push(
			{
				name: 'styleID',
				value: '1234567',
			}
		);
	}

	return {
		sku: decoder.write(crypto.randomBytes(6)),
		key: decoder.write(crypto.randomBytes(8)),
		prices: [
			{
				value: {
					'currencyCode': 'EUR',
					'centAmount': eurValue,
				},
			}, {
				value: {
					'currencyCode': 'BYN',
					'centAmount': Math.floor(eurValue * 2.41),
				},
			}, {
				value: {
					'currencyCode': 'RUB',
					'centAmount': Math.floor(eurValue * 75.41),
				},
			}
		],
		attributes,
	}
};

function* getColoredVariant() {
	for(let i = 0; i < 5; i++) {
		yield getSizedVariant(...getSizeColor());
	}
	return;
};

function* getNoColoredVariant() {
	for(let i = 0; i < 5; i++) {
		yield getSizedVariant(...getSizeColor().slice(0, 1));
	}
	return;
};

function getProduct(productType, variantGenerator) {
	const strKey = decoder.write(crypto.randomBytes(8));
	const categoryGen = getCategory();

	const productDraft = {
		key: strKey,
		name: {
			en: `English name ${strKey}`,
			fr: `French name ${strKey}`,
			de: `German name ${strKey}`,
			it: `Italian name ${strKey}`,
		},
		productType: {
			typeId: 'product-type',
			id: productType,
		},
		slug: {
			en: `english-name-${strKey}`,
			fr: `french-name-${strKey}`,
			de: `german-name-${strKey}`,
			it: `italian-name-${strKey}`,
		},
		description: {
			en: `English description ${strKey}`,
			fr: `French description ${strKey}`,
			de: `German description ${strKey}`,
			it: `Italian description ${strKey}`,
		},
		categories: [
			{
				typeId: 'category',
				id: categoryGen.next().value,
			}
		],
		metaTitle: {
			en: `English metatitle ${strKey}`,
			fr: `French metatitle ${strKey}`,
			de: `German metatitle ${strKey}`,
			it: `Italian metatitle ${strKey}`,
		},
		metaDescription: {
			en: `English meta description ${strKey}`,
			fr: `French meta description ${strKey}`,
			de: `German meta description ${strKey}`,
			it: `Italian meta description ${strKey}`,
		},
		metaKeywords: {
			en: `English meta keywords ${strKey}`,
			fr: `French meta keywords ${strKey}`,
			de: `German meta keywords ${strKey}`,
			it: `Italian meta keywords ${strKey}`,
		},
		masterVariant: variantGenerator.next().value,
		variants: [...variantGenerator],
		taxCategory: {
			typeId: 'tax-category',
			id: '52f780a6-4124-479c-bde9-34356ae777af',
		},
	};

	return productDraft;
}

const productList1 = Array.from(Array(10))
	.map(() => getProduct(PRODUCT_TYPE1, getNoColoredVariant()));
const productList2 = Array.from(Array(10))
	.map(() => getProduct(PRODUCT_TYPE2, getColoredVariant()));

const promiseList = [...productList1, ...productList2]
	.map(draft => Buffer.from(JSON.stringify(draft)).toString('base64'))
	.map(encodedDraft => ({data: encodedDraft}))
	.map(msg => processProductUpdate(msg))

Promise.all(promiseList);
