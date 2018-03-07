const inviteUserByEmail = async (context, email) => {
  let user = await context.getObject("User", { where: { username: email } });

  if (!user) {
    user = context.create("User", { username: email });
  }

  await context.save();

  return user;
};

const invitationsAvailable = () => {
  return true;
};

module.exports = {
  inviteUserByEmail,
  invitationsAvailable
};
