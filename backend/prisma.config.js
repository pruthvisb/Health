try {
  require("dotenv").config();
} catch (e) {
  // Ignore in production environments where env variables are injected directly by the host shell
}

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
