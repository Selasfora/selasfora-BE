# selasfora REST APIs

## Prerequistie
`$:> npm install`

## Set Config
`Configure the .env file`

## Start Server
`$:> npm start`

## creating builds for deployment 
```cd selasfora-be```

```rm ../selasfora-be-dev.zip && zip ../selasfora-be-dev.zip -r * .[^.]* -x *.git* node_modules/\* *.md .env.* test.js```


deploy on elasticbeanstalk

### note about when deplying to other environemnts 
.env needs to be changed according to prod env.

http://selasfora-api-stg.us-east-2.elasticbeanstalk.com/documentation