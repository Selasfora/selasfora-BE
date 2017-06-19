class RegistrationsController < Devise::RegistrationsController

  private

  def sign_up_params
    params.permit(:first_name, :last_name, :phone, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.permit(:first_name, :last_name, :phone, :email, :password, :password_confirmation, :current_password)
  end
end