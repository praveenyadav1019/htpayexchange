import crypto from "crypto";
import { TronWeb } from "tronweb";

// ✅ TronWeb v6+ requires named import
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

export const getUSDTBalance = async (address) => {
  // TODO: implement TRC20 scan via TronGrid
  return 0;
};
