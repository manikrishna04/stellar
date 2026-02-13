"use server";

import { Keypair, Horizon, TransactionBuilder,  Operation, Asset, Networks } from "@stellar/stellar-sdk";
const FUTURENET_HORIZON = "https://horizon-futurenet.stellar.org";

//for test net.
export async function createCustodialWallet() {
  try {
    // 1. Generate a random keypair
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();
    // 2. Initialize the Horizon server for Testnet
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    // 3. Fund the account using Friendbot (Testnet only)
    // This effectively "creates" the account on the ledger
    await server.friendbot(publicKey).call();
    // NOTE: In a real custodial app, you would save secretKey
    // to your encrypted database here, linked to the user's ID.
    return {
      success: true,
      publicKey,
      secretKey,

    };
  } catch (error) {
    console.error("Wallet creation failed:", error);

    return { success: false, error: "Failed to create wallet" };
  }
}

// export async function createCustodialWallet() {
//   try {
//     // Generate the keypair
//     const pair = Keypair.random();
//     const publicKey = pair.publicKey();
//     const secretKey = pair.secret();

   

//     // 2. Fund the account via Futurenet Friendbot
//     // Note: On Futurenet, using the direct URL is sometimes more stable than .call()
//     const friendbotUrl = `https://friendbot-futurenet.stellar.org/?addr=${publicKey}`;
//     const response = await fetch(friendbotUrl);

//     if (!response.ok) {
//       throw new Error("Friendbot funding failed");
//     }

//     return {
//       success: true,
//       publicKey,
//       secretKey,
//     };
//   } catch (error) {
//     console.error("Futurenet Wallet creation failed:", error);
//     return { success: false, error: "Failed to create Futurenet wallet" };
//   }
// }


export async function getAccountBalance(publicKey: string) {

  // const server = new Horizon.Server(FUTURENET_HORIZON);
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");

  try {
    // Load account details from the network
    const account = await server.loadAccount(publicKey);

    // Find the 'native' (XLM) balance in the balances array
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );

    return {
      success: true,
      // Stellar returns balances as strings to maintain precision
      balance: nativeBalance ? nativeBalance.balance : "0",
    };
  } catch (error) {
    console.error("Fetch balance failed:", error);
    return { success: false, error: "Account not found or network error" };
  }
}


export async function getDetailedBalance(publicKey: string) {
  // const server = new Horizon.Server(FUTURENET_HORIZON);
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");

  try {
    // 1. Force a small wait if this is called immediately after creation
    const account = await server.loadAccount(publicKey);
    
    const native = account.balances.find(b => b.asset_type === "native");
    if (!native) return { success: false, error: "Native XLM balance not found" };

    // Stellar base reserve constants
    const totalBalance = Number(native.balance);
    const baseReserve = 0.5;
    
    // Minimum balance = (2 + subentries) * baseReserve
    // Ensure we handle subentry_count as a number
    const subentries = account.subentry_count || 0;
    const minBalance = (2 + subentries) * baseReserve;
    
    const sellingLiabilities = Number(native.selling_liabilities || 0);
    const totalReserved = minBalance + sellingLiabilities;
    const spendable = totalBalance - totalReserved;

    return {
      success: true,
      total: totalBalance.toFixed(7),
      reserved: totalReserved.toFixed(7),
      spendable: (spendable > 0 ? spendable : 0).toFixed(7),
      subentries: subentries
    };
  } catch (error: any) {
    // Log the actual error to your terminal to see if it's a 404 or a Network error
    console.error("Horizon Error:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return { success: false, error: "Account not yet active on Testnet. Wait 5s." };
    }
    return { success: false, error: "Connection to Stellar failed." };
  }
}

export async function sendPayment(
  senderSecret: string, 
  destinationPublic: string, 
  amount: string
) {
  // const server = new Horizon.Server(FUTURENET_HORIZON);
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  
  try {
    const feeStats = await server.feeStats();
    console.log("Fee Stats:", feeStats);
    // Use the 90th percentile fee to ensure quick inclusion, or a safe high bid.
    // Most developers use a high "max fee" (e.g., 0.01 XLM) because 
    // you only pay what the network actually needs.
    // const suggestedMaxFee = feeStats.max_fee.max; 
    const maxBaseFee = feeStats.max_fee.p90 || "100000";
    console.log(`Using max fee: ${maxBaseFee} stroops (${Number(maxBaseFee) / 1e7} XLM)`);
    // 1. Load the sender account to get the current sequence number
    const senderKeypair = Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());

    // 2. Build the transaction
    const transaction = new TransactionBuilder(senderAccount, {
      fee: maxBaseFee, // Using the dynamic fee here
      // networkPassphrase: Networks.FUTURENET, // CRITICAL for Futurenet
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublic,
          asset: Asset.native(), // This is XLM
          amount: amount,        // Amount is a string (e.g., "10.0")
        })
      )
      .setTimeout(30) // Transaction expires if not processed in 30 seconds
      .build();

    // 3. Sign the transaction
    transaction.sign(senderKeypair);

    // 4. Submit to the network
    const result = await server.submitTransaction(transaction);

    // Fetch the account state AFTER the transaction
    const updatedAccount = await server.loadAccount(senderKeypair.publicKey());
    const native = updatedAccount.balances.find(b => b.asset_type === "native");

    if (native) {
      const currentBalance = parseFloat(native.balance);
      const subentries = updatedAccount.subentry_count || 0;
      
      // Calculate the network reserve limit
      // Base reserve is 0.5 XLM. Account needs 2 base reserves + 1 per subentry.
      const minBalance = (2 + subentries) * 0.5;
      
      // We add a small buffer (e.g., 2 XLM) so we don't trigger friendbot 
      // for every single tiny transaction fee.
      const safetyBuffer = 2.0;

      if (currentBalance < (minBalance + safetyBuffer)) {
        console.log(`Balance ${currentBalance} is near limit ${minBalance}. Topping up...`);
        await fetch(`https://friendbot-futurenet.stellar.org/?addr=${senderKeypair.publicKey()}`);
      }
    }
    return { success: true, hash: result.hash };
  } catch (error: any) {
    console.error("Payment failed:", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.extras?.result_codes?.operations[0] || "Payment failed" 
    };
  }
}