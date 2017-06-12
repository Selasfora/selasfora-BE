ShopifyApp.configure do |config|
  config.application_name = "My Shopify App"
  config.api_key = "4a41f7b203cb4dbbb266291955f3b405"
  config.secret = "cb68e78faf60d40b18b2b5158e229500"
  config.scope = "read_orders, read_products"
  config.embedded_app = true
end
