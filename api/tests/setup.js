import { beforeAll, afterEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Usuario from "../models/usuario.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { timeout: 30000 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Usuario.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
