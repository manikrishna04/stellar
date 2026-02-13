import { StellarTomlResolver, WebAuth, Keypair, Networks } from "@stellar/stellar-sdk";

// 1. DISCOVERY: Find Anchor API endpoints from their domain
export async function getAnchorInfo(domain: string) {
  const toml = await StellarTomlResolver.resolve(domain);
  return {
    authEndpoint: toml.WEB_AUTH_ENDPOINT,
    transferServer: toml.TRANSFER_SERVER_SEP0024,
    signingKey: toml.SIGNING_KEY
  };
}

// 2. AUTH: SEP-10 handshake to get a login token (JWT)
export async function getAnchorAuthToken(userSecret: string, domain: string) {
  const info = await getAnchorInfo(domain);
  const kp = Keypair.fromSecret(userSecret);
  
  // Get challenge
  const resp = await fetch(`${info.authEndpoint}?account=${kp.publicKey()}`);
  const { transaction } = await resp.json();

  // Sign challenge
  const auth = new WebAuth(domain, info.signingKey!);
  const tx = auth.readChallengeTx(transaction, info.signingKey!, Networks.TESTNET, domain, domain);
  tx.sign(kp);

  // Exchange for JWT
  const tokenResp = await fetch(info.authEndpoint!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: tx.toXDR() })
  });
  const { token } = await tokenResp.json();
  return token;
}

// 3. START DEPOSIT: SEP-24 Popup URL
export async function getDepositUrl(userSecret: string, domain: string, assetCode: string) {
  const info = await getAnchorInfo(domain);
  const token = await getAnchorAuthToken(userSecret, domain);
  
  const formData = new FormData();
  formData.append("asset_code", assetCode);
  formData.append("account", Keypair.fromSecret(userSecret).publicKey());

  const resp = await fetch(`${info.transferServer}/transactions/deposit/interactive`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  const { url } = await resp.json();
  return url;
}