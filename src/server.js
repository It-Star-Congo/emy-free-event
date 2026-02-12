require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    await sequelize.authenticate();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

start();

