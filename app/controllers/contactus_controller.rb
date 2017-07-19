require 'sendgrid-ruby'

class ContactusController < ApplicationController
  def forward

    my_string = '{
      "personalizations": [
        {
          "to": [
            {
              "email": "%{to_email}"
            }
          ],
          "subject": "%{p_subject}"
        }
      ],
      "from": {
        "email": "%{from_email}"
      },
      "content": [
        {
          "type": "text/plain",
          "value": "%{message}"
        }
      ]
    }'

    to = params[:to]
    from = params[:from]
    subject = params[:subject] || "No subject"
    message = params[:message]
    issue = params[:issue]
    name = params[:name]

    formated_message = 'Request from %{name}: with %{issue} issue.\n %{message}' % {:name => name, :issue => issue, :message => message} 


    put = params[:subject]

    new_my_string = my_string % {:to_email => to, :p_subject => subject, :from_email => from, :message => formated_message} 
    data = JSON.parse(new_my_string)


    sg = SendGrid::API.new(api_key: ENV['SENDGRID_API_KEY'])
    response = sg.client.mail._("send").post(request_body: data)

    render json: {:message => 'Message sent successfully'}, status: response.status_code

    puts response.status_code
    puts response.body
    puts response.headers

  end

  def contact_us_params
    params.permit(:from, :message, :subject, :issue, :name)
  end

  def json_response(object, status = :ok)
    render json: object, status: status
  end

  def get_options
    @options = ContactUsQueryOption.all()
    json_response(@options)
  end
end
