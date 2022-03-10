firebase emulators:start
ngrok http 5001

firebase functions:config:set stripe.test="_______"

firebase functions:config:get > .runtimeconfig.json 