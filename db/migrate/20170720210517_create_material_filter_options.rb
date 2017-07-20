class CreateMaterialFilterOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :material_filter_options do |t|
      t.string :name

      t.timestamps
    end
  end
end
