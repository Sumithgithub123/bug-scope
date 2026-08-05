import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config();

console.log("ed", process.env.COGNODB_URI);

export const driver = neo4j.driver(
  process.env.COGNODB_URI!,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME!,
    process.env.COGNODB_PASSWORD!,
  ),
);
