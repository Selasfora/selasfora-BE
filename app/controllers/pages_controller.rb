class PagesController < ApplicationController
  def getAllPages
    pages = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Page.find(:all) }
    render json: pages
  end

  def getSpecifyPage
    page_handle = params[:handle]
    pages = ShopifyAPI::Session.temp("selafore-staging.myshopify.com", "c3973c904c916f7865223c8e3cd754aa") { ShopifyAPI::Page.find(:all, :params => { :handle => page_handle }) }
    render json: pages
  end
end
