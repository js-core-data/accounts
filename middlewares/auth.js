const createError = require("http-errors");
module.exports = app => {
  app.use(async (req, res, next) => {
    if (
      req.path.indexOf("/auth") === 0 ||
      req.path == "/" ||
      req.path == "/healthcheck"
    ) {
      return next();
    }
    try {
      let token = await req.app.locals.getJWT(req);
      let scopes = (token.scope || "").split(" ");
      if (scopes.indexOf("accounts") === -1) {
        throw createError(401, `token missing require scope 'accounts'`);
      }
      next();
    } catch (e) {
      next(e);
    }
  });
};
