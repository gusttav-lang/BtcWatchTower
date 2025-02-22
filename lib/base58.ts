import bs58 from "bs58";

export function fromBase58(address: string) {
  return bs58.decode(address);
}
