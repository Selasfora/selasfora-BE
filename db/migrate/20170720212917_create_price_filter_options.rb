class CreatePriceFilterOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :price_filter_options do |t|
      t.string :range

      t.timestamps
    end
  end
end
