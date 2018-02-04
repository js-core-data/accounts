const cron = require("cron");
const NappJSService = require("nappjs").NappJSService;

const certificates = require("../lib/certificates");

class Signing extends NappJSService {
  async load(napp) {
    this.cron = new cron.CronJob("0 0 * * * *", async () => {
      await this.updateCertificates(napp);
    });

    const app = napp.getService("nappjs-api").app;
    app.get("/auth/certs", async (req, res, next) => {
      let certificates = await req.context.getObjects("Certificate");
      res.send(
        certificates.map(c => {
          return {
            key: Buffer.from(c.public, "utf8").toString("base64"),
            expireAt: c.expireAt
          };
        })
      );
    });
  }
  async start(napp) {
    this.cron.start();
    await this.updateCertificates(napp);
  }
  async stop(napp) {
    this.cron.stop();
  }

  async updateCertificates(napp) {
    const database = napp.getService("nappjs-core-data").database;
    const context = database.createContext();

    let certCount = await context.getObjectsCount("Certificate");
    if (certCount == 0) {
      await this.createCertificate(context);
    }

    return context.saveAndDestroy();
  }

  async createCertificate(context) {
    let pems = await certificates.genereateNewCertificate();
    context.create("Certificate", pems);
  }
}

module.exports = Signing;
