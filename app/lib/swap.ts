// import { Keypair, TransactionBuilder, Operation, Asset, Networks } from "@stellar/stellar-sdk";
// import { server } from "./stellar";

// export async function swapAssets(
//   secretKey: string,
//   sendCode: string, sendIssuer: string | undefined,
//   destCode: string, destIssuer: string | undefined,
//   sendAmount: string
// ) {
//   const kp = Keypair.fromSecret(secretKey);
//   const account = await server.loadAccount(kp.publicKey());

//   const sendAsset = sendCode === "XLM" ? Asset.native() : new Asset(sendCode, sendIssuer!);
//   const destAsset = destCode === "XLM" ? Asset.native() : new Asset(destCode, destIssuer!);

//   const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
//     .addOperation(Operation.pathPaymentStrictSend({
//         sendAsset: sendAsset,
//         sendAmount: sendAmount,
//         destination: kp.publicKey(),
//         destAsset: destAsset,
//         destMin: "0.0000001",
//         path: [] 
//       }))
//     .setTimeout(30)
//     .build();

//   tx.sign(kp);
//   return await server.submitTransaction(tx);
// }
import { Keypair, TransactionBuilder, Operation, Asset, Networks } from "@stellar/stellar-sdk";
import { server } from "./stellar";

export async function swapAssets(
  secretKey: string,
  sendCode: string, sendIssuer: string | undefined,
  destCode: string, destIssuer: string | undefined,
  sendAmount: string
) {
  const kp = Keypair.fromSecret(secretKey);
  const account = await server.loadAccount(kp.publicKey());

  const sendAsset = sendCode === "XLM" ? Asset.native() : new Asset(sendCode, sendIssuer!);
  const destAsset = destCode === "XLM" ? Asset.native() : new Asset(destCode, destIssuer!);

  // 1. PATHFINDING: Find how to get from SendAsset to DestAsset
  // This is required for non-native swaps (e.g., INR -> XLM -> USDC)
  const paths = await server.strictSendPaths(sendAsset, sendAmount, [destAsset]).call();
  
  if (paths.records.length === 0) {
    throw new Error("op_no_path");
  }

  const bestPath = paths.records[0];

  // 2. SLIPPAGE: Calculate minimum received (98% of estimate)
  const destMin = (parseFloat(bestPath.destination_amount) * 0.98).toFixed(7);

  const tx = new TransactionBuilder(account, { 
    fee: "100", 
    networkPassphrase: Networks.TESTNET 
  })
    .addOperation(Operation.pathPaymentStrictSend({
        sendAsset: sendAsset,
        sendAmount: sendAmount,
        destination: kp.publicKey(), // Swapping back into own wallet
        destAsset: destAsset,
        destMin: destMin,
        path: bestPath.path // CRITICAL: This enables non-native bridges
      }))
    .setTimeout(30)
    .build();

  tx.sign(kp);
  const result: any = await server.submitTransaction(tx);
  return { hash: result.hash, ledger: result.ledger, fee: result.fee_charged };
}