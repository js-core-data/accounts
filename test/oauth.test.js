const assert = require("assert");
const supertest = require("supertest");
const NewNappJS = require("nappjs").NewNappJS;

describe.only("oauth", () => {
  const nappjs = NewNappJS({});
  let test = null;

  before(async () => {
    await nappjs.load();
    await nappjs.runScript("nappjs-core-data/migrate");
    await nappjs.runScript("nappjs-core-data/seed", "test");
    await nappjs.runScript("check-certificates");
    let api = nappjs.getService("nappjs-api");
    test = supertest(api.app);
  });

  after(async () => {
    await nappjs.stop();
  });

  it("should grant client_credentials", () => {
    return test
      .post("/auth/token")
      .send("grant_type=client_credentials&client_id=test&client_secret=secret")
      .expect(200)
      .then(res => {
        assert.ok(res.body.access_token);
        assert.equal(res.body.token_type, "Bearer");
      });
  });
  it("should grant password", () => {
    return test
      .post("/auth/token")
      .send(
        "grant_type=password&client_id=blah&client_secret=foo&username=john.doe@example.com&password=test"
      )
      .expect(200)
      .then(res => {
        assert.ok(res.body.access_token);
        assert.equal(res.body.token_type, "Bearer");
      });
  });
});
