import Shopify from 'shopify-api-node';
import Config from '../../config';

const shopifyConfig = Config.get('shopify').toJS();

// shop_url = "https://4437f8334483433404d841ecb6770180:4e46757cbd8efca5a097d50b5b090154@selafore-staging.myshopify.com/admin"
const shopify = new Shopify(shopifyConfig);
module.exports = shopify;
