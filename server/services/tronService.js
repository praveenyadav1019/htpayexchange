import crypto from "crypto";
import TronWebPkg from "tronweb";

const TronWeb = TronWebPkg.default ?? TronWebPkg;

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: {
    "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY
  }
});

export const generateUserWallet = async () => {
  const account = await tronWeb.createAccount();

  const encryptedPrivateKey = crypto
    .createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPTION_KEY),
      Buffer.alloc(16, 0)
    )
    .update(account.privateKey, "utf8", "hex");

  return {
    address: account.address.base58,
    encryptedPrivateKey
  };
};

export const getUSDTBalance = async (address) => {
  // placeholder until you implement full TRC20 scan
  return 0;
};
