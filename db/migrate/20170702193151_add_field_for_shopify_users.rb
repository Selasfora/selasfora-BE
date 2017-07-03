class AddFieldForShopifyUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :shop, :string
    add_column :users, :state, :string
    add_column :users, :hmac, :string
    add_column :users, :code, :string
    add_column :users, :timestamp, :timestamp
  end
end
