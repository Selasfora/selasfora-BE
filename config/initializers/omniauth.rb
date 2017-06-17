Rails.application.config.middleware.use OmniAuth::Builder do
  provider :shopify,
    ShopifyApp.configuration.api_key,
    ShopifyApp.configuration.secret,
    scope: ShopifyApp.configuration.scope
  provider :facebook,      '1389149917845163', 'c3c48939366edcb08f20f354455bb080'
  provider :google_oauth2, '561313107749-flfhdb086rglddft350c1c8e3aolju6c.apps.googleusercontent.com', 'z7ykGvdn3O583MN0UB0f4Cwu'
  provider :twitter,      '36r0UcbrGLXjCFMAVi9q0tLOW', 'ygOR3tY5Vc1hXhoQ0v3Sjmded323PEAgIe1hUTX5jscRce0T3j'
end
