ShopifyApp.configure do |config|
  config.application_name = "selafora-dev"
  config.api_key = "3abd3e98ba88164a0b4e84acd1d16760"
  config.secret = "315ed00fc2dd34a5b794ea39915ed591"
  config.scope = "read_orders,read_products,read_content,read_customers, write_customers"
  config.embedded_app = true
  config.webhooks = [
      {topic: 'app/uninstalled', address: "#{ENV['WEBHOOK_URL']}app_uninstalled", format: 'json'},
      {topic: 'orders/delete', address: "#{ENV['WEBHOOK_URL']}orders_delete", format: 'json'},
      {topic: 'orders/create', address: "#{ENV['WEBHOOK_URL']}orders_create", format: 'json'},
      {topic: 'orders/updated', address: "#{ENV['WEBHOOK_URL']}orders_updated", format: 'json'}
    ]
end
