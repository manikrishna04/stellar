// import {
//   Keypair,
//   TransactionBuilder,
//   Operation,
//   Asset,
//   Networks,
//   BASE_FEE
// } from "@stellar/stellar-sdk";
// import { server } from "./stellar";

// /**
//  * Creates a Liquidity Pool for a custom asset vs XLM.
//  * This establishes the "Path" so swaps can happen.
//  */
// export async function createLiquidityPool(
//   secretKey: string,
//   assetCode: string,
//   assetIssuer: string,
//   amountXLM: string,
//   amountAsset: string
// ) {
//   const kp = Keypair.fromSecret(secretKey);
//   const account = await server.loadAccount(kp.publicKey());

//   const assetA = Asset.native();
//   const assetB = new Asset(assetCode, assetIssuer);

//   const tx = new TransactionBuilder(account, {
//     fee: BASE_FEE,
//     networkPassphrase: Networks.TESTNET
//   })
//     // Deposit into the Liquidity Pool to create the market
//     .addOperation(
//       Operation.liquidityPoolDeposit({
//         liquidityPoolId: server.getLiquidityPoolId(assetA, assetB),
//         maxAmountA: amountXLM,
//         maxAmountB: amountAsset,
//         minPrice: "0.001",
//         maxPrice: "1000",
//       })
//     )
//     .setTimeout(30)
//     .build();

//   tx.sign(kp);
//   return await server.submitTransaction(tx);
// }
import { Keypair, TransactionBuilder, Operation, Asset, Networks, BASE_FEE } from "@stellar/stellar-sdk";
import { server } from "./stellar";

export async function createLiquidityPool(
  secretKey: string,
  assetCode: string,
  assetIssuer: string,
  amountXLM: string,
  amountAsset: string
) {
  const kp = Keypair.fromSecret(secretKey);
  const account = await server.loadAccount(kp.publicKey());

  const assetA = Asset.native();
  const assetB = new Asset(assetCode, assetIssuer);

  // Get the deterministic ID for this specific pair
  const liquidityPoolId = server.getLiquidityPoolId(assetA, assetB);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        maxAmountA: amountXLM,
        maxAmountB: amountAsset,
        minPrice: "0.0001", // Very loose price bounds for testing
        maxPrice: "10000",
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(kp);
  return await server.submitTransaction(tx);
}