class CreateOrders < ActiveRecord::Migration[5.1]
  def change
    create_table :orders do |t|
      t.string :shopify_order_id, null: false
      t.string :shopify_order_name, default: ''
      t.datetime :shopify_order_created_at
      t.belongs_to :shop, index: true

      t.timestamps
    end
    add_index :orders, :shopify_order_id, unique: true
  end
end
