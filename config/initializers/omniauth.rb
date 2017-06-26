Rails.application.config.middleware.use OmniAuth::Builder do
  provider :shopify,
    ShopifyApp.configuration.api_key,
    ShopifyApp.configuration.secret,
    scope: ShopifyApp.configuration.scope
  provider :facebook,      ENV['FACEBOOK_KEY'], ENV['FACEBOOK_SECRET']
  provider :google_oauth2, ENV['GOOGLE_OAUTH_URL'], ENV['GOOGLE_SECRET']
  provider :twitter,      ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
end
