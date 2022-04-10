# 🤖 MB Bot Basics

An introduction course to the world of chatbots, inside a chatbot!
Talk to it here: https://t.me/mb_basics_bot

## Overview

### Chatbot

All files related to the **chatbot** can be found in the [Functions](https://github.com/MichaelBarney/MB-Bot-Basics/tree/master/functions) folder.

The system uses two integration services, one to connect to **Voiceflow** and another to connect to **Telegram**.

An https endpoint created using Firebase Functions receives requests from Telegram when a user sends a message. It consequently:

1.  Asks Voiceflow for the chatbots answers
2.  Processes the message with the according message processor (text, buttons, animations, actions...)
3.  Sends the answers to the user.

The bot uses Voiceflow's **stateless** API, therefore it needs to store the user's current state in a database and update it accordingly.

### Certificate

All files related to the **certificate** can be found in the [Public](https://github.com/MichaelBarney/MB-Bot-Basics/tree/master/public) folder.

It uses vanilla javascript to generate a custom certificate a user that has completed the course.

[Certificate Example](https://mb-bot-basics.web.app/420728565)
