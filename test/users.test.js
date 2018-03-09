const assert = require("assert");
const supertest = require("supertest");
const NewNappJS = require("nappjs").NewNappJS;

describe("users", () => {
  const nappjs = NewNappJS({});
  let test = null;

  before(async () => {
    await nappjs.load();
    await nappjs.runScript("nappjs-core-data/migrate");
    await nappjs.runScript("nappjs-core-data/seed", "test");
    let api = nappjs.getService("nappjs-api");
    test = supertest(api.app);
  });

  after(async () => {
    await nappjs.stop();
  });

  it("should register user with default role", () => {
    return test
      .post("/graphql")
      .send({
        query: `mutation{
        createUser(input:{username:"jane.siri@example.com",password:"blahsecret"}) {
          uid
          roles {
            name
          }
        }
      }`
      })
      .expect(200)
      .then(res => {
        assert.ok(res.body.data.createUser);

        let user = res.body.data.createUser;

        assert.ok(user.uid);
        assert.equal(user.roles.length, 1);
        assert.equal(user.roles[0].name, "Default role");
      });
  });

  it("invite user", () => {
    return test
      .post("/graphql")
      .send({
        query: `mutation{
      inviteUser(email:"john.doe@example.com") {
        uid
      }
    }`
      })
      .expect(200)
      .then(res => {
        assert.ok(res.body.data.inviteUser.uid);
      });
  });
});
