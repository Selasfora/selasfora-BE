class BlogsController < ApplicationController
  def getAllBlogs
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    #TODO put shop and credentials in config file
    all_blogs = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Blog.find(:all, :params => {:limit => page_limit, :page => page_num}) }
    render json: all_blogs
  end

  def getSpecifyBlog
    blog_id = params[:id]
    #TODO put shop and credentials in config file
    blog = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Blog.find(blog_id) }
    render json: blog
  end

  def getAllArticles
    articles = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Article.find(:all) }
    render json: articles
  end

  def getArticlesForBlog
    id = params[:id]
    #TODO put shop and credentials in config file
    articles = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Article.find(:all, :params => { :blog_id => id }) }
    render json: articles
  end
end
