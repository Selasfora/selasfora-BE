class UsersController < ApplicationController

  # before_action :set_user, only: [:update]

  def index
    @users = User.all
    render json: @users
  end

  def edit

  end

  def update
    req_email = params[:email]
    req_password = SecureRandom.hex

    user = User.find_or_initialize_by(:email => req_email)
    if user.update(user_params.merge({password: req_password}))
      render json: user
    else
      render_errors(user)
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
        begin
          @user = User.find_by!(params[:email])
        rescue ActiveRecord::RecordNotFound => e
          @user = User.new(user_params)
          @user.save
        end
    end

    # Only allow a trusted parameter "white list" through.
    def user_params
      params.permit(:email, :provider, :first_name, :last_name, :phone, :uid, :name)
    end

    def render_errors(model)
      render json: ErrorSerializer.serialize(model.errors), status: :unprocessable_entity
    end

end
