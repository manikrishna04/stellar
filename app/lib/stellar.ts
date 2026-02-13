// import { Horizon } from "@stellar/stellar-sdk";

// export const HORIZON_URL = "https://horizon-testnet.stellar.org";
// export const server = new Horizon.Server(HORIZON_URL);
import { Horizon } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";

// We add a configuration object to increase the timeout to 60 seconds (60000ms)
// This gives Horizon enough time to find paths through your liquidity pools.
export const server = new Horizon.Server(HORIZON_URL, {
  allowHttp: false,
  timeout: 60000, 
});