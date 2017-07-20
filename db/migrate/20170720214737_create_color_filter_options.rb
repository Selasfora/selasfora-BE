class CreateColorFilterOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :color_filter_options do |t|
      t.string :name
      t.string :code

      t.timestamps
    end
  end
end
