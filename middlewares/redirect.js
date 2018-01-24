const NappJSService = require("nappjs").NappJSService;

class Redirect extends NappJSService {
  async load(napp) {
    const app = napp.getService("nappjs-api").app;
    app.get("/", (req, res, next) => {
      res.redirect("/admin/");
    });
  }
}
module.exports = Redirect;
