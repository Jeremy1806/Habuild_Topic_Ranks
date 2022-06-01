const { Sequelize, DataTypes } = require("sequelize");

const db = new Sequelize({
  database: "assignment",
  username: "assignmentuser",
  password: "assignment",
  dialect: "postgres",
});

const Topic = db.define("topic", {
  topic: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

const Ranking = db.define("ranking", {
  ranking: {
    type: DataTypes.INTEGER,
  },
});

const User = db.define("user", {
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Ranking.hasMany(Topic);
Topic.belongsTo(Ranking);

module.exports = {
  db,
  Topic,
  Ranking,
  User,
};
