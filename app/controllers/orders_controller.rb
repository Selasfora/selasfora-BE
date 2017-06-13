class OrdersController < ShopifyApp::AuthenticatedController

  def index
    shop = get_current_shop
    shop.synchronize unless shop.orders_synchronized?
    @orders = shop.orders
    count = @orders.count
    page_limit = 25
    @total_pages = (count.to_f / page_limit.to_f).ceil
    @page = (params[:page].presence || 1).to_i
    @previous_page = "/?page=#{ @page - 1 }&limit=#{page_limit}" if @page > 1
    @next_page = "/?page=#{ @page + 1 }&limit=#{page_limit}" if @page < @total_pages
    @orders = @orders.paginate(page: @page, per_page: page_limit).order('shopify_order_id DESC')
  end

  private

    def get_current_shop
      Shop.find_by shopify_domain: ShopifyAPI::Shop.current.myshopify_domain
    end

end