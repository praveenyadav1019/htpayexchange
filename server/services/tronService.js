import crypto from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const TronWebPkg = require("tronweb");

// ✅ Correct constructor reference
const TronWeb = TronWebPkg.TronWeb;

if (typeof TronWeb !== "function") {
  throw new Error("TronWeb constructor not available");
}

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: {
    "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY
  }
});

export const generateUserWallet = async () => {
  const account = await tronWeb.createAccount();

  const iv = Buffer.alloc(16, 0);
  const key = Buffer.from(process.env.ENCRYPTION_KEY).slice(0, 32);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(account.privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    address: account.address.base58,
    encryptedPrivateKey: encrypted
  };
};

export const getUSDTBalance = async (_address) => {
  // placeholder for TRC20 scan
  return 0;
};
