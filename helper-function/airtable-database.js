const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const APP_ID = process.env.APP_ID;

// insert new data
const insertNewData = async (fields) => {

    url = `https://api.airtable.com/v0/${APP_ID}/Details`;
    headers = {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
    };

    try {

        let response = await axios.post(url, { fields }, { headers });
        if (response.status == 200) {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at createNewUser --> ${error}`);
        return 2;
    }
};

module.exports = {
    insertNewData
};