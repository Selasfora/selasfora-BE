class BlogsController < ApplicationController
  def getAllBlogs
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    #TODO put shop and credentials in config file
    all_blogs = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Blog.find(:all, :params => {:limit => page_limit, :page => page_num}) }
    render json: all_blogs
  end

  def getSpecifyBlog
    blog_id = params[:id]
    #TODO put shop and credentials in config file
    blog = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Blog.find(blog_id) }
    render json: blog
  end

  def getAllArticles
    articles = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Article.find(:all) }
    render json: articles
  end

  def getArticlesForBlog
    id = params[:id]
    #TODO put shop and credentials in config file
    articles = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Article.find(:all, :params => { :blog_id => id }) }
    render json: articles
  end
end
