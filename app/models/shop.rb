class Shop < ActiveRecord::Base
  include ShopifyApp::Shop
  include ShopifyApp::SessionStorage
  
  has_many :orders, dependent: :destroy

  def synchronize
    self.orders.delete_all
    orders = ShopifyAPI::Order.find(:all, params: {status: :any})
    orders.each do |order|
      order = Order.create(
          {
              shopify_order_id: order.id,
              shopify_order_name: order.name,
              shopify_order_created_at: order.created_at,
          })
      self.orders << order
    end
    self.orders_synchronized = true
    self.save
  end

  def orders_synchronized?
    return self.orders_synchronized
  end
end
