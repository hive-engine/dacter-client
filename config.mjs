import { DEFAULT_CHAIN_ID } from "@hiveio/dhive";
import "dotenv/config";

export const TEST_MODE = false;
export const CORE_MODULE_API = "https://dacter.tribaldex.com/api";
export const { ACCOUNT, SIGNING_PRIVATE_KEY, PORT } = process.env;
export const NODES = TEST_MODE
  ? ["https://testnet.openhive.network"]
  : [
      "https://api.hive.blog",
      "https://rpc.ecency.com",
      "https://api.deathwing.me",
      "https://api.hive.blue",
    ];
export const CHAIN_ID = TEST_MODE
  ? "18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e"
  : DEFAULT_CHAIN_ID.toString("hex");
