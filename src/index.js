// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const TOKEN = process.env.TOKEN;

// This method is to verify the Facebook webhook
webApp.get('/facebook', (req, res) => {

    let mode = req['query']['hub.mode'];
    let token = req['query']['hub.verify_token'];
    let challenge = req['query']['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === TOKEN) {
            console.log('Webhook verified by Facebook.')
            res.status(200).send(challenge);
        } else {
            res.status(403).send('Forbidden');
        }
    }
});

const FM = require('../helper-function/facebook-messenger');
const DF = require('../helper-function/google-dialogflow');
const GT = require('../helper-function/google-translate');
const AT = require('../helper-function/airtable-database');

// Facebook post route to receive and send message
webApp.post('/facebook', async (req, res) => {

    if (req.body.object === 'page') {

        let incomingData = req.body.entry[0].messaging[0];

        let senderId = incomingData.sender.id;
        let message = incomingData.message.text;

        console.log(`Sender id --> ${senderId}`);
        console.log(`Message --> ${message}`);

        // Translate the incoming message to English
        let translatedMessage = await GT.translateText(message, 'en');

        let intentData = await DF.detectIntent(translatedMessage, senderId);

        let reply = intentData.fulfillmentMessages.text.text[0];

        // Translate the outgoing message back to bangla
        let text = await GT.translateText(reply, 'bn');

        if (intentData.intent === 'User Provides Mobile') {
            let outputContext = intentData.outputContexts[0];
            let fields = outputContext.parameters.fields;
            let mobile = fields.number.numberValue;

            let data = {
                facebook_id: String(senderId),
                mobile: String(mobile)
            };

            await AT.insertNewData(data);
        }

        await FM.sendMessage(text, senderId);

        // Make sure to send the status
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});