class AddStatusColumn < ActiveRecord::Migration[5.1]
  def change
    add_column :newsletters, :is_active, :boolean, default: true
  end
end
