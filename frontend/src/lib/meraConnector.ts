import { createWalletClient, getAddress, numberToHex } from "viem";
import { createConnector } from "wagmi";
import { monadTestnet } from "./chain";
import { resilientHttp } from "./resilientTransport";
import {
  createPasskeyAccount,
  currentPasskeyAccount,
  endPasskeySession,
  signInWithPasskey,
} from "./meraAccount";

// "pick" signs in without pinning a passkey, so the browser's picker chooses which account.
export type MeraMode = "create" | "signin" | "pick";

const CONNECTOR_NAMES: Record<MeraMode, string> = {
  create: "Create account with passkey",
  signin: "Sign in with passkey",
  pick: "Use a different passkey",
};

function requireAccount() {
  const current = currentPasskeyAccount();
  if (!current) throw new Error("No active passkey session. Sign in with your passkey.");
  return current;
}

// A wagmi connector backed by a passkey account. Defining getClient() makes wagmi use this viem
// wallet client for every write, so useWriteContract and friends need no changes.
export function meraPasskey({ mode }: { mode: MeraMode }) {
  return createConnector((config) => ({
    id: `mera-${mode}`,
    name: CONNECTOR_NAMES[mode],
    type: "mera",
    async connect() {
      const { account } =
        mode === "create"
          ? await createPasskeyAccount()
          : await signInWithPasskey({ choose: mode === "pick" });
      return { accounts: [getAddress(account.address)] as never, chainId: monadTestnet.id };
    },
    async disconnect() {
      endPasskeySession();
    },
    async getAccounts() {
      return [getAddress(requireAccount().account.address)];
    },
    async getChainId() {
      return monadTestnet.id;
    },
    async isAuthorized() {
      return currentPasskeyAccount() !== null;
    },
    async getProvider() {
      // Not a wallet extension: only the read-only identity methods wagmi may ask for.
      return {
        async request({ method }: { method: string }) {
          if (method === "eth_chainId") return numberToHex(monadTestnet.id);
          if (method === "eth_accounts" || method === "eth_requestAccounts") {
            return [getAddress(requireAccount().account.address)];
          }
          throw new Error(`${method} is not supported by the passkey account`);
        },
      };
    },
    async getClient() {
      return createWalletClient({
        account: requireAccount().account,
        chain: monadTestnet,
        transport: resilientHttp(monadTestnet.rpcUrls.default.http[0]),
      });
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else config.emitter.emit("change", { accounts: accounts.map((x) => getAddress(x)) });
    },
    onChainChanged(chain) {
      config.emitter.emit("change", { chainId: Number(chain) });
    },
    async onDisconnect() {
      endPasskeySession();
      config.emitter.emit("disconnect");
    },
  }));
}
