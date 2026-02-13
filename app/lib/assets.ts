// // src/lib/assets.ts

// export interface AssetRecord {
//   asset_id: string; 
//   code: string;     
//   issuer: string;   
//   domain: string;   
//   icon?: string;
// }

// const NETWORK = "testnet"; 
// const BASE_URL = `https://api.stellar.expert/explorer/${NETWORK}/asset`;

// const CURATED_TESTNET_ASSETS: AssetRecord[] = [
//   {
//     asset_id: "USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
//     code: "USDC",
//     issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
//     domain: "centre.io (Testnet)",
//     icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
//   }
// ];

// export async function searchAssets(query: string): Promise<AssetRecord[]> {
//   const cleanQuery = query.toUpperCase().trim();
//   if (!cleanQuery || cleanQuery.length < 2) return [];

//   const results: AssetRecord[] = [...CURATED_TESTNET_ASSETS.filter(a => a.code.includes(cleanQuery))];

//   try {
//     // Stellar.expert search endpoint
//     const res = await fetch(`${BASE_URL}?search=${cleanQuery}&limit=10`);
//     const data = await res.json();
    
//     // Stellar.expert returns records directly in an array or inside _embedded for specific endpoints
//     // For the /asset endpoint, it's usually data._embedded.records
//     const apiRecords = data._embedded?.records || [];

//     const apiMatches = apiRecords.map((record: any) => {
//       // Logic for Stellar.expert response structure
//       const assetString = record.asset; // e.g., "USDC-GBBD..."
//       const [code, issuer] = assetString.split('-');

//       // Avoid duplicates from curated list
//       if (results.find(r => r.issuer === issuer && r.code === code)) return null;

//       return {
//         asset_id: assetString,
//         code: code,
//         issuer: issuer || "Native",
//         // Stellar.expert uses 'domain' directly in the record if verified
//         domain: record.domain || record.toml_info?.domain || "unverified",
//         icon: record.toml_info?.image || null
//       };
//     }).filter((r: any) => r !== null);

//     return [...results, ...apiMatches];
//   } catch (error) {
//     console.error("Asset Search Error:", error);
//     return results; // Return curated list if API fails
//   }
// }
// src/lib/assets.ts

export interface AssetRecord {
  asset_id: string; 
  code: string;     
  issuer: string;   
  domain: string;   
  org_name: string; // <--- Added this field
  icon?: string;
}

const NETWORK = "testnet"; 
const BASE_URL = `https://api.stellar.expert/explorer/${NETWORK}/asset`;

const CURATED_TESTNET_ASSETS: AssetRecord[] = [
  {
    asset_id: "USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    code: "USDC",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    domain: "centre.io",
    org_name: "Centre Consortium", // Friendly name
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
  }
];

export async function searchAssets(query: string): Promise<AssetRecord[]> {
  const cleanQuery = query.toUpperCase().trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const results: AssetRecord[] = [...CURATED_TESTNET_ASSETS.filter(a => a.code.includes(cleanQuery))];

  try {
    // Note: using ?search= instead of ?q= for StellarExpert API
    const res = await fetch(`${BASE_URL}?search=${cleanQuery}&limit=10`);
    const data = await res.json();
    
    const apiRecords = data._embedded?.records || [];

    const apiMatches = apiRecords.map((record: any) => {
      const assetString = record.asset;
      const [code, issuer] = assetString.split('-');

      if (results.find(r => r.issuer === issuer && r.code === code)) return null;

      return {
        asset_id: assetString,
        code: code,
        issuer: issuer || "Native",
        // 'domain' usually comes from the toml_info or record root
        domain: record.domain || record.toml_info?.domain || "unverified",
        // 'orgName' is the specific field StellarExpert uses for the Issuer Name
        org_name: record.orgName || record.toml_info?.orgName || "Unknown Issuer",
        icon: record.toml_info?.image || null
      };
    }).filter((r: any) => r !== null);

    return [...results, ...apiMatches];
  } catch (error) {
    console.error("Asset Search Error:", error);
    return results;
  }
}