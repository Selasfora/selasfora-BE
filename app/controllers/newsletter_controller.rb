class NewsletterController < ApplicationController
  def create
    @news = Newsletter.create!(newsletter_params)
    json_response(@news, :created)
  end

  def get
    active_emails = Newsletter.where(:is_active => true )
    non_active_emails = Newsletter.where(:is_active => false )
    emails = {
        "active" => active_emails,
        "passive" => non_active_emails
    }
    json_response(emails)
  end

  def newsletter_params
    params.permit(:email)
  end

  def json_response(object, status = :ok)
    render json: object, status: status
  end

end
