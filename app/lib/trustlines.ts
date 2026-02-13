// src/lib/trustlines.ts
import {
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Networks
} from "@stellar/stellar-sdk";
import { server, NETWORK } from "./stellar";

export async function changeTrustline(
  secretKey: string,
  assetCode: string,
  issuer: string,
  limit?: string
) {
  const kp = Keypair.fromSecret(secretKey);
  const acc = await server.loadAccount(kp.publicKey());

  const tx = new TransactionBuilder(acc, {
    fee: "100",
    networkPassphrase:
      NETWORK === "public"
        ? Networks.PUBLIC
        : Networks.TESTNET
  })
    .addOperation(
      Operation.changeTrust({
        asset: new Asset(assetCode, issuer),
        limit
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(kp);
  return await server.submitTransaction(tx);
}
