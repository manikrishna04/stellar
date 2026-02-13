import { server } from "./stellar";

/* CONNECT WALLET */
export async function connectWallet() {
  if (!window.freighterApi) {
    throw new Error("Freighter wallet not installed");
  }

  const connected = await window.freighterApi.isConnected();
  if (!connected) await window.freighterApi.connect();

  return await window.freighterApi.getPublicKey();
}

/* FETCH BALANCES */
export async function getBalances(publicKey: string) {
  const account = await server.loadAccount(publicKey);

  return account.balances.map(b => ({
    asset:
      b.asset_type === "native"
        ? "XLM"
        : `${b.asset_code}:${b.asset_issuer}`,
    balance: b.balance
  }));
}
