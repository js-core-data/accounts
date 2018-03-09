const ManagedObject = require("js-core-data").ManagedObject;

class User extends ManagedObject {
  async willSave() {
    await super.willSave();

    if (this.isInserted) {
      let defaultRoles = await this.managedObjectContext.getObjects("Role", {
        where: { default: 1 }
      });
      this.addRoles(defaultRoles);
    }
  }
}

module.exports = User;
