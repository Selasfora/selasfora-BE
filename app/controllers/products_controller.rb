class ProductsController < ApplicationController
  def getAllProducts
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    #TODO put shop and credentials in config file
    all_products = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Product.find(:all, :params => {:limit => page_limit, :page => page_num}) }
    render json: all_products 
  end

  def getSingleProduct
    product_id = params[:id]
    #TODO put shop and credentials in config file
    product = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Product.find(product_id) }
    render json: product 
  end

  def getAllCharmProducts
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    charm_products = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Product.where(:product_type => "charm") }
    render json: charm_products
  end

  def getAllBraceletProducts
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    charm_products = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Product.where(:product_type => "bracelet") }
    render json: charm_products
  end

end
