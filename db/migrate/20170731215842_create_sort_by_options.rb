class CreateSortByOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :sort_by_options do |t|
      t.string :name

      t.timestamps
    end
  end
end
