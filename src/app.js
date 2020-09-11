const express = require('express');
const fetch = require('node-fetch');
const { CLIENT_ID, CLIENT_SECRET } = require('../appDetails');

const app = express();
const clientId = CLIENT_ID;
const clientSecret = CLIENT_SECRET;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('index.html');
});

const getAccessToken = function (code) {
  return new Promise((resolve, rej) => {
    fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })
      .then((res) => res.text())
      .then((text) => new URLSearchParams(text).get('access_token'))
      .then(resolve);
  });
};

const fetchGitHubUser = function (token) {
  return new Promise((resolve, rej) => {
    fetch('https://api.github.com/user', {
      headers: {
        Authorization: 'token ' + token,
      },
    })
      .then((res) => res.json())
      .then(resolve);
  });
};

app.get('/home', (req, res) => {
  const code = req.query.code;
  getAccessToken(code).then((token) => {
    fetchGitHubUser(token).then((json) => res.json(json));
  });
});

module.exports = { app };
