
import { 
  Keypair, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Networks, 
  BASE_FEE, 
  Memo 
} from "@stellar/stellar-sdk";
import { server } from "./stellar";

/* ENGINE 1: P2P NATIVE (Same Asset Transfer) */
/* ENGINE 1: P2P NATIVE (Same Asset Transfer) */
export async function sendPayment(secretKey: string, destination: string, amount: string, assetCode: string, issuer?: string, memoText?: string) {
  try {
    const kp = Keypair.fromSecret(secretKey);
    const acc = await server.loadAccount(kp.publicKey());
    const asset = assetCode === "XLM" ? Asset.native() : new Asset(assetCode, issuer!);

    const txBuilder = new TransactionBuilder(acc, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .setTimeout(30);

    if (memoText) txBuilder.addMemo(Memo.text(memoText));

    const tx = txBuilder.build();
    tx.sign(kp);
    const result: any = await server.submitTransaction(tx);
    return { hash: result.hash, fee: result.fee_charged, ledger: result.ledger, type: 'P2P' };
  } catch (e: any) {
    // This will print the specific Stellar error (e.g., op_no_destination, op_no_trust)
    console.error("Stellar Submission Error:", e.response?.data?.extras?.result_codes);
    throw e;
  }
}
/* ENGINE 2: CROSS-CURRENCY (FIXED FOR REAL-TIME PATHFINDING) */
export async function sendCrossAssetPayment(
  secretKey: string,
  destination: string,
  sendCode: string, sendIssuer: string | undefined,
  destCode: string, destIssuer: string | undefined,
  destAmount: string,
  memoText?: string
) {
  const kp = Keypair.fromSecret(secretKey);
  const acc = await server.loadAccount(kp.publicKey());

  const sendAsset = sendCode === "XLM" ? Asset.native() : new Asset(sendCode, sendIssuer!);
  const destAsset = destCode === "XLM" ? Asset.native() : new Asset(destCode, destIssuer!);

  // 1. Path Discovery: Query Horizon to find the bridge (e.g., INR -> XLM -> USDC)
  const paths = await server.strictReceivePaths(sendAsset, destAsset, destAmount).call();
  
  if (paths.records.length === 0) {
    throw new Error("op_no_path"); // No liquidity bridge found
  }

  const bestPath = paths.records[0];
  
  // 2. Slippage Logic (2% buffer as per tutorial standard)
  const sendMax = (parseFloat(bestPath.source_amount) * 1.02).toFixed(7);

  const txBuilder = new TransactionBuilder(acc, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET });

  if (memoText) txBuilder.addMemo(Memo.text(memoText));

  txBuilder.addOperation(Operation.pathPaymentStrictReceive({
    sendAsset,
    sendMax: sendMax.toString(),
    destination,
    destAsset,
    destAmount,
    path: bestPath.path, // Use the specific hop sequence found by Horizon
  }))
  .setTimeout(30);

  const tx = txBuilder.build();
  tx.sign(kp);
  const result: any = await server.submitTransaction(tx);
  return { hash: result.hash, fee: result.fee_charged, ledger: result.ledger, type: 'CROSS_CURRENCY' };
}

/* MANAGE TRUSTLINE */
export async function changeTrustline(secretKey: string, assetCode: string, issuer: string, limit: string = "MAX") {
  const kp = Keypair.fromSecret(secretKey);
  const acc = await server.loadAccount(kp.publicKey());
  const opParams: any = { asset: new Asset(assetCode, issuer) };
  if (limit !== "MAX" && limit !== undefined) opParams.limit = limit;

  const tx = new TransactionBuilder(acc, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust(opParams))
    .setTimeout(30)
    .build();

  tx.sign(kp);
  return await server.submitTransaction(tx);
}