const {
  inviteUserByEmail,
  invitationsAvailable
} = require("../lib/invitations");

module.exports = () => {
  return {
    Query: {
      invitationsAvailable: () => {
        return invitationsAvailable();
      }
    },
    Mutation: {
      inviteUser: async (parent, args, ctx) => {
        let user = await inviteUserByEmail(ctx.context, args.email);
        return user;
      }
    }
  };
};
