// import { server } from "./stellar";

// export async function getBalances(publicKey: string) {
//   const acc = await server.loadAccount(publicKey);

//   return acc.balances.map(b => ({
//     asset: b.asset_type === "native" ? "XLM" : `${b.asset_code}:${b.asset_issuer}`,
//     balance: b.balance
//   }));
// }

// export async function getTransactions(publicKey: string) {
//   const txs = await server
//     .transactions()
//     .forAccount(publicKey)
//     .order("desc")
//     .limit(10)
//     .call();

//   return txs.records.map(tx => ({
//     hash: tx.hash,
//     created_at: tx.created_at,
//     memo: tx.memo
//   }));
// }
import { Asset } from "@stellar/stellar-sdk";
import { server } from "./stellar";
// export async function getTransactions(publicKey: string) {
//     const txs = await server
//         .transactions()
//         .forAccount(publicKey)
//         .order("desc")
//         .limit(10)
//         .call();
//     return txs.records.map(tx => ({
//         hash: tx.hash,
//         created_at: tx.created_at,
//         memo: tx.memo
//     }));
// }

export const getTransactions = async (pubKey: string) => {
  try {
    const txResponse = await server.transactions()
      .forAccount(pubKey)
      .order("desc")
      .limit(20) // or whatever limit you use
      .call();

    const enrichedTxs = await Promise.all(
      txResponse.records.map(async (tx) => {
        try {
          const ops = await server.operations().forTransaction(tx.hash).call();
          const mainOp = ops.records[0]; // usually the first op is the main one

          return {
            ...tx,
            type: mainOp?.type || "unknown", // e.g. "payment", "path_payment_strict_send", etc.
          };
        } catch (opErr) {
          console.warn(`Could not fetch ops for tx ${tx.hash}:`, opErr);
          return { ...tx, type: "unknown" };
        }
      })
    );

    return enrichedTxs;
  } catch (err) {
    console.error("getTransactions failed:", err);
    return [];
  }
};

// Add this helper to your existing balances.ts
export async function getMarketRate(assetCode: string, assetIssuer: string) {
  if (assetCode === "XLM") return 1;
  try {
    const asset = new Asset(assetCode, assetIssuer);
    const native = Asset.native();
    
    // Find how many XLM you get for 1 of this asset
    const paths = await server.strictSendPaths(asset, "1", [native]).call();
    
    if (paths.records.length > 0) {
      return parseFloat(paths.records[0].destination_amount);
    }
    return 0; // No liquidity/market exists
  } catch (e) {
    return 0;
  }
}

export async function getBalances(publicKey: string) {
  const acc = await server.loadAccount(publicKey);
  const BASE_RESERVE = 0.5;
  

  return acc.balances.map((b: any) => {
    const isNative = b.asset_type === "native";
    const total = parseFloat(b.balance);
    const sellingLiabilities = parseFloat(b.selling_liabilities || "0");
    const buyingLiabilities = parseFloat(b.buying_liabilities || "0");
    
    // Calculate Reserve and Spendable for the Native Asset (XLM)
    // Formula: (2 + subentry_count) * 0.5 XLM
    let reserved = 0;
    let spendable = total;
    const subentries = acc.subentry_count || 0;

    if (isNative) {
      reserved = (2 + subentries) * BASE_RESERVE + sellingLiabilities;
      spendable = Math.max(total - reserved, 0);
    } else {
      // For non-native, spendable is just total minus any selling liabilities (open orders)
      spendable = Math.max(total - sellingLiabilities, 0);
    }
    
    return {
      asset: isNative ? "XLM" : `${b.asset_code}:${b.asset_issuer}`,
      code: isNative ? "XLM" : b.asset_code,
      issuer: b.asset_issuer,
      balance: b.balance,
      spendable: spendable.toFixed(7),
      reserved: isNative ? reserved.toFixed(7) : "0.5000000", // Each trustline cost 0.5 XLM reserve
      subentries: isNative ? subentries : 1, // A trustline is 1 subentry
      buyingLiabilities,
      sellingLiabilities
    };
  });
}