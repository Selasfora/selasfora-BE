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

  def get_filters
    color_filters = ColorFilterOption.all()
    material_filters = MaterialFilterOption.all()
    mood_filters = MoodFilterOption.all()
    price_filters = PriceFilterOption.all()
    sort_by_options = SortByOption.all()

    filters = {
        "color" => color_filters,
        "material" =>  material_filters,
        "mood" =>  mood_filters,
        "price" => price_filters,
        "sort_by" => sort_by_options
    }

    json_response(filters)
  end

  def filter
    page_limit = params[:limit] || 50
    page_num = params[:page] || 1
    product_type_name = params[:product_type] ? params[:product_type] : "charm"

    filters = {}
    filters[:color] = params[:color] ? params[:color].split(',') : []
    filters[:material] = params[:material] ? params[:material].split(',') : []
    filters[:mood] = params[:mood] ? params[:mood].split(',') : []
    filters[:max_price] = params[:max_price] ? params[:max_price] : -1
    filters[:min_price] = params[:min_price] ? params[:min_price] : 100000000000000

    sort_by_paramter = params[:sort_by] ? params[:sort_by] : nil


    puts filters

    all_products = ShopifyAPI::Session.temp(ENV['SHOPIFY_API_URL'], ENV['SHOPIFY_API_KEY']) { ShopifyAPI::Product.find(:all, :params => {:limit => page_limit, :product_type => product_type_name}) }
    products_str = all_products.to_json
    products = YAML.load(products_str)
    
    final_products = []

    if(params[:color] || params[:material] || params[:mood] || params[:max_price] || params[:min_price])
      products.each do |product|
        average_price = 0
        product["variants"].each do |variant|
          if(variant["price"].to_f >= average_price)
            average_price = variant["price"].to_f
          end

          product["average_price"] = average_price

          if((variant["price"].to_f <= filters[:max_price].to_f &&
            variant["price"].to_f >= filters[:min_price].to_f) ||
            filters[:material].include?(variant["option3"]) ||
            filters[:mood].include?(variant["option1"]) ||
            filters[:color].include?(variant["option2"])
          )   
            final_products.push(product)
            breaks = true
            break if breaks
          end
        end
      end
    else
        final_products = products
    end

    if(sort_by_paramter) 
        if(sort_by_paramter == "Newest")
            final_products = final_products.sort {|a,b| a[:created_at] <=> b[:created_at]}
            final_products = final_products.reverse
        elsif(sort_by_paramter == "Highest Price")
            final_products = final_products.sort {|a,b| a[:average_price] <=> b[:average_price]}
        elsif(sort_by_paramter == "Lowest Price")
            final_products = final_products.sort {|a,b| a[:average_price] <=> b[:average_price]}
            final_products = final_products.reverse
        end
    else
        final_products = final_products
    end

    render json: final_products
  end

  def json_response(object, status = :ok)
    render json: object, status: status
  end

end
