import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { cookieStorage, createConfig, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId && typeof window !== "undefined") {
  // Warn in the browser instead of throwing during SSR/SSG; wallet connect just won't work
  // until the env var is provided.
  // biome-ignore lint/suspicious/noConsole: intentional dev-time warning for missing env var
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// Connectors only initialize on the client to avoid SSR indexedDB / localStorage issues.
const connectors =
  typeof window !== "undefined" && projectId
    ? connectorsForWallets(
        [
          {
            groupName: "Supported Wallets",
            wallets: [metaMaskWallet, rabbyWallet],
          },
        ],
        {
          appName: "Sablier Airdrops",
          projectId,
        },
      )
    : [];

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export { mainnet, sepolia };
