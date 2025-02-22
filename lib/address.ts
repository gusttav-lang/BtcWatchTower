import { fromBech32 } from "./bech32";
import { fromBase58 } from "./base58";

export function decodeBitcoinAddress(address: string): Uint8Array {
  if (address.startsWith("bc1")) {
    return fromBech32(address).data;
  } else {
    return fromBase58(address);
  }
}
