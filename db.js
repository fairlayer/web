// Onchain database - every full node has exact same copy
let base_db = {
  dialect: "sqlite",
  storage: "./db.sqlite",
  define: { timestamps: true },
  operatorsAliases: false,
  logging: false
};

Sequelize = require("sequelize");

sequelize = new Sequelize("", "", "password", base_db);

// >>> Schemes

User = sequelize.define(
  "user",
  {
    username: Sequelize.STRING,

    auth_token: Sequelize.CHAR(32).BINARY
  },
  {
    indexes: [
      {
        fields: [{ attribute: "auth_token", length: 32 }]
      }
    ]
  }
);

Balance = sequelize.define("balance", {
  balance: { type: Sequelize.BIGINT, defaultValue: 0 },
  asset: { type: Sequelize.INTEGER, defaultValue: 1 }
});

Payment = sequelize.define("payment", {
  amount: { type: Sequelize.BIGINT, defaultValue: 0 },

  asset: { type: Sequelize.INTEGER, defaultValue: 1 },

  desc: { type: Sequelize.TEXT }
});

User.hasMany(Balance);
Balance.belongsTo(User);

Balance.hasMany(Payment);
Payment.belongsTo(Balance);
