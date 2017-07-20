class CreateMoodFilterOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :mood_filter_options do |t|
      t.string :name

      t.timestamps
    end
  end
end
