import { custom, http, keccak256 } from "viem";
import type { Hex, Transport } from "viem";

const SEND_ATTEMPTS = 3;
// Pause before asking the node whether a send that looked like a failure landed anyway.
const LANDED_CHECK_DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// An HTTP transport for a slow or flaky public RPC. Ordinary calls get a longer timeout and patient
// retries. eth_sendRawTransaction is handled separately: if a send fails (for example "Failed to
// fetch" because the reply was lost) the node may still have accepted it. A transaction's hash is the
// keccak256 of its raw bytes, so we ask the node about that hash straight away and treat a known
// transaction as success. If it is not there, re-sending the same signed bytes is safe (same hash, same
// nonce), so try again, a few times, before giving up.
export function resilientHttp(url: string): Transport {
  return (parameters) => {
    const reader = http(url, { timeout: 25_000, retryCount: 4, retryDelay: 400 })(parameters);
    const sender = http(url, { timeout: 25_000, retryCount: 0 })(parameters);

    return custom(
      {
        async request({ method, params }: { method: string; params?: unknown }) {
          if (method !== "eth_sendRawTransaction") {
            return reader.request({ method, params } as never);
          }

          const hash = keccak256((params as [Hex])[0]);
          let lastError: unknown;
          for (let attempt = 0; attempt < SEND_ATTEMPTS; attempt++) {
            try {
              return await sender.request({ method, params } as never);
            } catch (error) {
              lastError = error;
              await sleep(LANDED_CHECK_DELAY_MS);
              const known = await reader
                .request({ method: "eth_getTransactionByHash", params: [hash] } as never)
                .catch(() => null);
              if (known) return hash;
            }
          }
          throw lastError;
        },
      },
      { retryCount: 0 },
    )(parameters);
  };
}
