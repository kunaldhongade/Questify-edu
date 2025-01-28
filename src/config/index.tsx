import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import {
  arbitrum,
  defineChain,
  mainnet,
  mantleSepoliaTestnet,
  sepolia,
} from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://reown.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const eduChainTestnet = defineChain({
  id: 656476,
  caipNetworkId: "eip155:656476",
  chainNamespace: "eip155",
  name: "EDU Chain Testnet",
  nativeCurrency: { name: "EDU", symbol: "EDU", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://open-campus-codex-sepolia.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "EDU Chain Testnet explorer",
      url: "https://edu-chain-testnet.blockscout.com/",
    },
  },
  contracts: {
    // Add the contracts here
  },
});

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [
  mainnet,
  eduChainTestnet,
  arbitrum,
  sepolia,
  mantleSepoliaTestnet,
] as [AppKitNetwork, ...AppKitNetwork[]];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
