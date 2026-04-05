import app from "./app.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./config/seed.js";

const startServer = async () => {
  await ensureAdminUser();
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exit(1);
});
