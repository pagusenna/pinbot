const slackToken = process.env.PINBOT_SLACK_TOKEN;
const RtmClient = require('@slack/client').RtmClient;
const ClientEvents = require('@slack/client').CLIENT_EVENTS;
const RTMEvents = require('@slack/client').RTM_EVENTS;
const rtm = new RtmClient(slackToken);
const NewMessageHandler = require('./handlers/new_message');
const DeleteMessageHandler = require('./handlers/delete_message');
const EditMessageHandler = require('./handlers/edit_message');
const ReactionsHandler = require('./handlers/reactions');
const Mongo = require('./shared/mongo');

const initSlack = function() {
    rtm
        .on(ClientEvents.RTM.AUTHENTICATED, (rtmStartData) => {
            console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
            setTimeout(() => {
                rtm
                    .on(RTMEvents.MESSAGE, (message) => {
                        if(message.subtype) {
                            message.type = message.subtype;
                        }
                        if(message.channel[0] == 'D') {
                            return;
                        }
                        if(message.type == 'message') {
                            NewMessageHandler.handle(message);
                        } else if(message.type == 'message_deleted') {
                            DeleteMessageHandler.handle(message);
                        } else if(message.type == 'message_changed') {
                            EditMessageHandler.handle(message);
                        }
                    })
                    .on(RTMEvents.REACTION_ADDED, (message) => {
                        console.log(message);
                        ReactionsHandler.handleReactionAdded(message);
                    })
                    .on(RTMEvents.REACTION_REMOVED, (message) => {
                        console.log(message);
                        ReactionsHandler.handleReactionRemoved(message);
                    });
            }, 3000);
        })
    rtm.start();
}

Mongo.prepare().then(initSlack);
