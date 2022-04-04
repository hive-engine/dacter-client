import { networkInterfaces } from "node:os";
import {
  Client,
  PrivateKey,
  cryptoUtils,
  Signature,
  DEFAULT_CHAIN_ID,
} from "@hiveio/dhive";
import axios from "axios";
import {
  ACCOUNT,
  CORE_MODULE_API,
  PORT,
  SIGNING_PRIVATE_KEY,
  NODES,
  CHAIN_ID,
} from "./config.mjs";

export const hiveClient = new Client(NODES, { chainId: CHAIN_ID });

export const isSignedWithActiveKey = async (
  signingPublicKey,
  rawData,
  signature
) => {
  let validSignature = false;

  try {
    const json = JSON.stringify(rawData);

    const pubActiveKey = Signature.fromString(signature)
      .recover(
        cryptoUtils.sha256(json),
        DEFAULT_CHAIN_ID.toString() === CHAIN_ID ? "STM" : "TST"
      )
      .toString();

    validSignature = pubActiveKey === signingPublicKey;
  } catch {
    //
  }

  return validSignature;
};

export const fetchCoreConfig = async () => {
  let config = {};

  try {
    ({ data: config } = await axios.get(`${CORE_MODULE_API}/config`));
  } catch {
    //
  }

  return config;
};

const getMyIp = () => {
  const interfaces = Object.values(networkInterfaces()).flat();

  const netInterface = interfaces.find(
    (item) => !item.internal && item.family === "IPv4"
  );

  if (netInterface) {
    return netInterface.address;
  }

  return null;
};

export const pingCoreModule = async () => {
  let success = false;

  try {
    const ip = getMyIp();

    if (!ip) throw new Error("IP address can not be determined!");

    const postData = {
      account: ACCOUNT,
      ip,
      port: PORT,
    };

    const sig = PrivateKey.fromString(SIGNING_PRIVATE_KEY)
      .sign(cryptoUtils.sha256(JSON.stringify(postData)))
      .toString();

    const { data } = await axios.post(`${CORE_MODULE_API}/ping`, postData, {
      headers: {
        "X-Signature": sig,
      },
    });

    success = data.success;
  } catch (e) {
    const error = e?.response?.data?.message || e.message;

    console.error("Ping Error:", error);
  }

  return success;
};
