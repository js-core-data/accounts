const Router = require('express').Router;
const OAuthServer = require('express-oauth-server');
const bodyParser = require('body-parser');
const sha512 = require('js-sha512');
const yaml = require('js-yaml');

const NappJSService = require('nappjs').NappJSService;

const jwt = require('../lib/jwt');
const {
  canFetchUserFromParent,
  fetchUserFromParent
} = require('../lib/parent');

class OAuth extends NappJSService {
  async load(napp) {
    const database = napp.getService('nappjs-core-data').database;
    const app = napp.getService('nappjs-api').app;

    const model = {
      generateAccessToken: async (client, user, scope) => {
        const iat = Math.floor(Date.now() / 1000);
        const sub = user.uid;
        let payload = { user, scope, iat, sub };
        let config = await jwt.getTokenConfiguration(database);
        return jwt.generateAccessToken(payload, config);
      },
      getClient: async (clientId, clientSecret) => {
        // console.log("get client", clientId, clientSecret);
        const context = database.createContext();
        let client = await context.getObject('Client', {
          where: {
            uid: clientId,
            secret: clientSecret
          }
        });

        if (!client) {
          return { id: clientId, grants: ['password'] };
        }

        let values = client.getValues();
        if (typeof values.grants === 'string') {
          values.grants = values.grants.split(',');
        }

        context.destroy();

        return values;
      },
      getUser: async (username, password) => {
        // console.log("get user", username);
        const context = database.createContext();
        let user = await context.getObject('User', {
          where: {
            username: username,
            password: sha512(password)
          }
        });

        if (!user && canFetchUserFromParent()) {
          const userData = await fetchUserFromParent(username, password);
          return userData;
        }

        if (!user) return null;

        let permissions = (user.permissions || '').split('\n');
        let roles = await user.getRoles();
        for (let role of roles) {
          permissions.push(role.permissions);
        }

        context.destroy();

        let metadata = null;
        try {
          metadata = yaml.safeLoad(user.metadata);
        } catch (e) {}

        return {
          uid: user.uid,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          permissions: permissions.join('\n'),
          metadata: metadata
        };
      },
      saveToken: async (token, client, user) => {
        // console.log("save token", token, client, user);
        const context = database.createContext();

        token.accessTokenExpiresAt = new Date(
          Date.now() + 1000 * 3600 * 24 * 90
        );

        context.create('Token', {
          type: 'access',
          token: token.accessToken,
          expiresAt: new Date(Date.now() + token.accessTokenExpiresAt * 1000)
        });

        if (token.refreshToken) {
          context.create('Token', {
            type: 'refresh',
            token: token.refreshToken,
            expiresAt: new Date(Date.now() + token.refreshTokenExpiresAt * 1000)
          });
        }

        token.client = client;
        token.user = user;

        await context.saveAndDestroy();

        return token;
      },
      getUserFromClient: async client => {
        const context = database.createContext();

        let user = await context.getObject('User', {
          where: { 'SELF.clients.id': client.id }
        });

        let values = user.getValues();
        await context.destroy();

        return values;
      }
    };

    const oauth = new OAuthServer({
      model
    });

    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/auth', oauth.authorize());
    app.post('/auth/token', oauth.token());
  }
}

module.exports = OAuth;
