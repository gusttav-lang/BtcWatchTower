import { bech32, bech32m } from "bech32";

export function fromBech32(address: string) {
  let result;
  let version;
  try {
    result = bech32.decode(address);
  } catch (e) {}
  if (result) {
    version = result.words[0];
    if (version !== 0) throw new TypeError(address + " uses wrong encoding");
  } else {
    result = bech32m.decode(address);
    version = result.words[0];
    if (version === 0) throw new TypeError(address + " uses wrong encoding");
  }
  const data = bech32.fromWords(result.words.slice(1));
  return {
    version,
    prefix: result.prefix,
    data: Uint8Array.from(data),
  };
}
