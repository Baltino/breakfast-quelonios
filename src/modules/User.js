// @flow

type UserModel = {
  name: string,
  email: string,
  avatar: string,
  lastBring: string,
};

const UserValidator = {
  name: 'string',
  email: 'string',
  avatar: 'string',
  lastBring: 'string'
};

function isValidString(s: string) {
  return s && s.length > 0;
}


class User {
  
  data: UserModel;

  constructor(props: UserModel) {
    this.data = props;

  }

  verifyFields() {
    if(!this.data.name || !this.data.email) {
      return { error: 'noNameEmail'}
    }
    return this;
  }

  isValidGeneric(validator: string, data: any) {
    switch(validator) {
    case 'string': 
      return isValidString(data);
    case 'descriptionArray': 
      return isValidDescriptionArray(data);
    default:
      return false;
    }
  }
  
  generateUpdateLastBringQuery () {
    const today = (new Date()).toISOString();
    const query = 'set lastBring = :lastBring';
    const values = {
      ':lastBring': today,
    }

    return { query, values };
  }
}

module.exports = User;