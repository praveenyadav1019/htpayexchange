import crypto from "crypto";
import TronWebPkg from "tronweb";

// ✅ SAFE constructor resolution for Node 18/20/22
const TronWeb =
  typeof TronWebPkg === "function"
    ? TronWebPkg
    : TronWebPkg.default;

if (!TronWeb) {
  throw new Error("TronWeb constructor not found");
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

export const getUSDTBalance = async (address) => {
  // Placeholder until TRC20 scan logic is implemented
  return 0;
};
