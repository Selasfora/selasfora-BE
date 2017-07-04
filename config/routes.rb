Rails.application.routes.draw do
  get 'users/index'

  get 'users/edit'

  post 'users/update'

  mount_devise_token_auth_for 'User', at: 'auth'
  root :to => 'orders#index'
  mount ShopifyApp::Engine, at: '/'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
