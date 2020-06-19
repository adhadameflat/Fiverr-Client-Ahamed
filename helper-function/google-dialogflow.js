// Requiered Packages
const dialogflow = require('dialogflow').v2beta1;
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Your google dialogflow project-id
const projectId = CREDENTIALS.project_id;

// Configuration for the client
const config = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email']
    }
}

// Create a session client
const sessionClient = new dialogflow.SessionsClient(config);

const detectIntent = async (queryText, senderId) => {

    // Create a sessionPath for the senderId
    let sessionPath = sessionClient.sessionPath(projectId, senderId);

    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: 'en-US',
            }
        }
    };

    try {
        let response = await sessionClient.detectIntent(request);
        let intent = response[0]['queryResult']['intent']['displayName'];
        let fulfillmentMessages = response[0]['queryResult']['fulfillmentMessages'][0];
        let outputContexts = response[0]['queryResult']['outputContexts'];

        return {
            'intent': intent,
            'fulfillmentMessages': fulfillmentMessages,
            'outputContexts': outputContexts
        };
    } catch (error) {
        console.log(`Error at detectIntent --> ${error}`);
    }
};

module.exports = {
    detectIntent
};