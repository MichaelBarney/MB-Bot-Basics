firebase emulators:start
ngrok http 5001

firebase functions:config:set stripe.test="_______"

firebase functions:config:get > .runtimeconfig.json 

http://localhost:3000/?s=420728565