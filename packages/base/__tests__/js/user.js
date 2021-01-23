const properties = {
  "id": {
    "type": "integer",
    "autoIncrement": true,
    "primaryKey": true
  },
  "phone": {
    "type": "string",
    "length": 11,
    "description": "手机号"
  },
  "password": {
    "type": "string",
    "length": 32,
    "description": "密码"
  },
  "nickName": {
    "type": "string",
    "length": 32,
    "description": "昵称"
  },
  "createdAt": {
    "type": "date",
    "allowNull": false
  },
  "updatedAt": {
    "type": "date",
    "allowNull": false
  },
  "deletedAt": {
    "type": "date",
    "allowNull": false
  }
}

module.exports = {
  properties
}
