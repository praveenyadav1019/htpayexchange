
import TronWeb from 'tronweb';
import { encrypt } from '../utils/cryptoUtils.js';

// Hardcoded provided API key as per request
const TRONGRID_API_KEY = 'b307f0dd-b83a-44f3-861b-bfc927983b2b';
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Mainnet USDT

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY }
});

/**
 * Generates a unique TRON wallet for a new user
 */
const generateUserWallet = async () => {
  try {
    const account = await tronWeb.createAccount();
    return {
      address: account.address.base58,
      encryptedPrivateKey: encrypt(account.privateKey)
    };
  } catch (err) {
    console.error('Wallet Generation Failed:', err);
    throw new Error('Could not generate secure TRON wallet');
  }
};

/**
 * Checks USDT balance for a specific address
 */
const getUSDTBalance = async (address) => {
  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    const balance = await contract.balanceOf(address).call();
    return tronWeb.fromSun(balance); // USDT uses 6 decimals but tronweb helpfully converts
  } catch (err) {
    console.error('Balance Fetch Failed:', err);
    return 0;
  }
};

export { generateUserWallet, getUSDTBalance };
