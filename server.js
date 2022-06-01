const dotenv = require("dotenv");

const app = require("./app");
const { createRanks } = require("./controllers/topicController");
const { db } = require("./models/index");

dotenv.config();

const port = process.env.PORT || 8800;
const firstTime = process.env.FIRST_TIME;

if (firstTime) {
  db.sync({ force: true })
    .then(() => {
      app.listen(port, async () => {
        await createRanks();
        console.log(`Backend server running on port ${port} `);
      });
    })
    .catch((err) => console.error(err));
} else {
  db.sync()
    .then(() => {
      app.listen(port, () => {
        console.log(`Backend server running on port ${port} `);
      });
    })
    .catch((err) => console.error(err));
}
