const Router = require("express").Router;
const OAuthServer = require("express-oauth-server");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const sha512 = require("js-sha512");

module.exports = database => {
  const model = {
    generateAccessToken: async (client, user, scope) => {
      let payload = { user: user };
      console.log("generateAccessToken", client, user, scope);
      console.log(payload);
      token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "this_should_be_secret"
      );
      return token;
    },
    getClient: async (clientId, clientSecret) => {
      const context = database.createContext();
      let client = await context.getObject("Client", {
        uid: clientId,
        secret: clientSecret
      });
      context.destroy();

      if (!client) {
        return { id: clientId, grants: ["password"] };
      }

      let values = client.getValues();
      values.grants = values.grants.split(",");

      return values;
    },
    getUser: async (username, password) => {
      const context = database.createContext();
      let user = await context.getObject("User", {
        username: username,
        password: sha512(password)
      });

      if (!user) return null;

      let permissions = (user.permissions || "").split("\n");
      let roles = await user.getRoles();
      for (let role of roles) {
        permissions.push(role.permissions);
      }

      context.destroy();

      return {
        uid: user.uid,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        permissions: permissions.join("\n")
      };
    },
    saveToken: async (token, client, user) => {
      const context = database.createContext();

      token.accessTokenExpiresAt = new Date(Date.now() + 1000 * 3600 * 24 * 90);

      context.create("Token", {
        type: "access",
        token: token.accessToken,
        expiresAt: new Date(Date.now() + token.accessTokenExpiresAt * 1000)
      });

      if (token.refreshToken) {
        context.create("Token", {
          type: "refresh",
          token: token.refreshToken,
          expiresAt: new Date(Date.now() + token.refreshTokenExpiresAt * 1000)
        });
      }

      token.client = client;
      token.user = user;

      await context.saveAndDestroy();

      return token;
    }
  };

  const oauth = new OAuthServer({
    model
  });

  const app = new Router();

  app.use(bodyParser.urlencoded({ extended: false }));

  app.post("/auth", oauth.authorize());
  app.post("/auth/token", oauth.token());

  // app.use(oauth.authenticate(), (req, res, next) => {
  //   console.log(res.locals.oauth);
  // });

  return app;
};
