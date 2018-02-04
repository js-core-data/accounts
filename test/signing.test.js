const assert = require("assert");
const certificates = require("../lib/certificates");
const jwt = require("../lib/jwt");

describe("signing", () => {
  it("should create new certificate", async () => {
    let pems = await certificates.genereateNewCertificate();
    assert.ok(pems.private);
    assert.ok(pems.public);
  });

  it("should sign and verify jwt based on secret", async () => {
    let payload = { hello: "world" };
    let secret = "topsecretstring";
    let token = await jwt.generateAccessToken(payload, { secret });
    assert.ok(token);

    let payload2 = await jwt.verifyToken(token, secret);
    delete payload2.iat;
    assert.deepEqual(payload, payload2);
  });

  it("should sign and verify jwt based on certificate", async () => {
    let payload = { hello: "world" };
    let cert = await certificates.genereateNewCertificate();

    let token = await jwt.generateAccessToken(payload, {
      secret: cert.private,
      options: {
        algorithm: "RS256"
      }
    });
    assert.ok(token);

    let payload2 = await jwt.verifyToken(token, cert.public, {
      algorithms: ["RS256"]
    });
    delete payload2.iat;
    assert.deepEqual(payload, payload2);
  });
});
