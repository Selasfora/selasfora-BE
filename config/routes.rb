Rails.application.routes.draw do
  get 'users/index'

  get 'users/edit'

  post 'users/update'

  get '/products/', to: 'products#getAllProducts'

  get '/products/charm', to: 'products#getAllCharmProducts'

  get '/products/bracelet', to: 'products#getAllBraceletProducts'

  get '/blogs', to: 'blogs#getAllBlogs'

  get '/blogs/:id', to: 'blogs#getSpecifyBlog'

  get '/blogs/:id/articles', to: 'blogs#getArticlesForBlog'

  get '/articles', to: 'blogs#getAllArticles'

  get '/pages', to: 'pages#getAllPages'

  get '/pages/:handle', to: 'pages#getSpecifyPage'


  mount_devise_token_auth_for 'User', at: 'auth'
  root :to => 'orders#index'
  mount ShopifyApp::Engine, at: '/'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
