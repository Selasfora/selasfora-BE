class CreateContactUsQueryOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :contact_us_query_options do |t|
      t.string :name

      t.timestamps
    end
  end
end
