import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import "dotenv/config";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("database connected successfuly!");

    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting at server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
