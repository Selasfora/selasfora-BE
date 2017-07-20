class CreateSortingOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :sorting_options do |t|
      t.string :range

      t.timestamps
    end
  end
end
