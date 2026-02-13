"use client";
import * as bip39 from "bip39";
import StellarHDWallet from "stellar-hd-wallet";
import * as StellarSdk from "@stellar/stellar-sdk";
import { server } from "./stellar";

// GHZ BANK TREASURY CONFIG
const TREASURY_SECRET = "SBKXQPAZSSWLXDZGAHZLLLKCXR6UC6W7FONWG5JFTLYXG7XUB534ZE73";
const TREASURY_KEYPAIR = StellarSdk.Keypair.fromSecret(TREASURY_SECRET);

/* CREATE WALLET (Bank-Funded) */
export async function createWallet(startingBalance: string = "20.0") {
  // 1. Generate high-entropy mnemonic and keys
  const mnemonic = bip39.generateMnemonic(128); 
  const wallet = StellarHDWallet.fromMnemonic(mnemonic);
  const keypair = wallet.getKeypair(0);

  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  try {
    // 2. Fetch Treasury Account Details
    const sourceAccount = await server.loadAccount(TREASURY_KEYPAIR.publicKey());

    // 3. Build Create Account Transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: publicKey,
          startingBalance: startingBalance, // Funded by Ghazanfar Bank
        })
      )
      .setTimeout(30)
      .build();

    // 4. Sign with Treasury Key and Submit
    transaction.sign(TREASURY_KEYPAIR);
    await server.submitTransaction(transaction);
    
    console.log(`Treasury successfully funded account: ${publicKey}`);
  } catch (e) {
    console.error("Treasury funding failed. User account not created on ledger.", e);
    throw new Error("Institutional funding failure.");
  }

  return {
    mnemonic,
    publicKey,
    secretKey
  };
}

/* RESTORE WALLET */
export function restoreWallet(mnemonic: string) {
  const cleanMnemonic = mnemonic.trim();
  if (!bip39.validateMnemonic(cleanMnemonic)) {
    throw new Error("Invalid recovery phrase");
  }

  const wallet = StellarHDWallet.fromMnemonic(cleanMnemonic);
  const keypair = wallet.getKeypair(0);

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret()
  };
}
// "use client";

// import * as bip39 from "bip39";
// import StellarHDWallet from "stellar-hd-wallet";
// import { server } from "./stellar";

// /* CREATE WALLET */
// export async function createWallet() {
//   // Generate high-entropy mnemonic
//   const mnemonic = bip39.generateMnemonic(128); 
//   const wallet = StellarHDWallet.fromMnemonic(mnemonic);
//   const keypair = wallet.getKeypair(0);

//   const publicKey = keypair.publicKey();
//   const secretKey = keypair.secret();

//   try {
//     // Fund on testnet via Friendbot
//     await server.friendbot(publicKey).call();
//   } catch (e) {
//     console.error("Friendbot funding failed, but keys generated", e);
//   }

//   return {
//     mnemonic,
//     publicKey,
//     secretKey
//   };
// }

// /* RESTORE WALLET */
// export function restoreWallet(mnemonic: string) {
//   const cleanMnemonic = mnemonic.trim();
//   if (!bip39.validateMnemonic(cleanMnemonic)) {
//     throw new Error("Invalid recovery phrase");
//   }

//   const wallet = StellarHDWallet.fromMnemonic(cleanMnemonic);
//   const keypair = wallet.getKeypair(0);

//   return {
//     publicKey: keypair.publicKey(),
//     secretKey: keypair.secret()
//   };
// }