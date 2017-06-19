class RegistrationsController < Devise::RegistrationsController
  
  def create

     respond_to do |format|
       format.html {
         super
       }
       format.json {
         @user = User.create(sign_up_params)
         @user.save ? (render :json => {:state => {:code => 0}, :data => @user }) : 
                      (render :json => {:state => {:code => 1, :messages => @user.errors.full_messages} })
       }
     end
   end
  

  private

  def sign_up_params
    params.permit(:first_name, :last_name, :phone, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.permit(:first_name, :last_name, :phone, :email, :password, :password_confirmation, :current_password)
  end
end