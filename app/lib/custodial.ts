"use server";

import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
// const HORIZON_URL = "https://horizon.stellar.org"; // mainnet later

const server = new Horizon.Server(HORIZON_URL);
const BASE_RESERVE = 0.5;

/* -------------------------------------------------
   CREATE CUSTODIAL WALLET (TESTNET FRIEND BOT)
-------------------------------------------------- */
export async function createCustodialWallet() {
  try {
    const pair = Keypair.random();

    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    // Create account on testnet
    await server.friendbot(publicKey).call();

    // ⚠️ In production:
    // - Encrypt `secretKey`
    // - Store it in DB (KMS / Vault / HSM)
    // - Never return it to frontend

    return {
      success: true,
      publicKey,
      secretKey
    };
  } catch (error) {
    console.error("Create wallet error:", error);
    return { success: false, error: "Wallet creation failed" };
  }
}

/* -------------------------------------------------
   FETCH DETAILED BALANCE (TOTAL / RESERVED / SPENDABLE)
-------------------------------------------------- */
export async function getDetailedBalance(publicKey: string) {
  try {
    const account = await server.loadAccount(publicKey);

    const native = account.balances.find(
      b => b.asset_type === "native"
    );

    if (!native) {
      return { success: false, error: "XLM balance not found" };
    }

    const total = parseFloat(native.balance);
    const subentries = account.subentry_count || 0;

    // Minimum balance formula
    const minBalance = (2 + subentries) * BASE_RESERVE;

    const sellingLiabilities = parseFloat(
      native.selling_liabilities || "0"
    );

    const reserved = minBalance + sellingLiabilities;
    const spendable = Math.max(total - reserved, 0);

    return {
      success: true,
      total: total.toFixed(7),
      reserved: reserved.toFixed(7),
      spendable: spendable.toFixed(7),
      subentries
    };
  } catch (error: any) {
    console.error("Balance fetch error:", error?.message);
    return {
      success: false,
      error: "Account not found or not yet indexed"
    };
  }
}

/* -------------------------------------------------
   SEND XLM (CUSTODIAL PAYMENT)
-------------------------------------------------- */
export async function sendPayment(
  senderSecret: string,
  destination: string,
  amount: string
) {
  try {
    const senderKeypair = Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(
      senderKeypair.publicKey()
    );

    const tx = new TransactionBuilder(senderAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(senderKeypair);

    const result = await server.submitTransaction(tx);

    return {
      success: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error("Send payment error:", error?.response?.data || error.message);

    const opError =
      error?.response?.data?.extras?.result_codes?.operations?.[0];

    return {
      success: false,
      error: opError || "Payment failed"
    };
  }
}

/* -------------------------------------------------
   SEND ISSUED ASSET (INR / USD / NFT)
-------------------------------------------------- */
export async function sendAssetPayment(
  senderSecret: string,
  destination: string,
  amount: string,
  assetCode: string,
  issuer: string
) {
  try {
    const senderKeypair = Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(
      senderKeypair.publicKey()
    );

    const asset = new Asset(assetCode, issuer);

    const tx = new TransactionBuilder(senderAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination,
          asset,
          amount
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(senderKeypair);

    const result = await server.submitTransaction(tx);

    return {
      success: true,
      hash: result.hash
    };
  } catch (error: any) {
    console.error("Send asset error:", error?.response?.data || error.message);

    const opError =
      error?.response?.data?.extras?.result_codes?.operations?.[0];

    return {
      success: false,
      error: opError || "Asset transfer failed"
    };
  }
}
