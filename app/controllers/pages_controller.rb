class PagesController < ApplicationController
  def getAllPages
    pages = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Page.find(:all) }
    render json: pages
  end

  def getSpecifyPage
    page_handle = params[:handle]
    pages = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Page.find(:all, :params => { :handle => page_handle }) }
    render json: pages
  end
end
