class NewsletterController < ApplicationController
  def create
    @news = Newsletter.create!(newsletter_params)
    json_response(@news, :created)
  end

  def get
    @news = Newsletter.all()
    json_response(@news)
  end

  def newsletter_params
    params.permit(:email)
  end

  def json_response(object, status = :ok)
    render json: object, status: status
  end

end
