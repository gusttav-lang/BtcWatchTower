import { type NextRequest } from "next/server";
import sql from "../../../db.js";

export const dynamic = "force-dynamic";

/**
 * id -> uuid (default)
 * created_at -> timestamp (default)
 * hash -> bytes (txid in little endian format)
 * index -> int8 (position of the output)
 * value -> int8 (sats)
 * destination_address -> varchar (recovery address)
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchAddress, recoveryAddress, utxos } = body;
    console.log(body);

    if (
      watchAddress === undefined ||
      utxos === undefined ||
      !Array.isArray(utxos) ||
      recoveryAddress === undefined ||
      typeof watchAddress !== "string" ||
      typeof recoveryAddress !== "string"
    ) {
      return new Response("Bad Request: Missing or invalid required fields", {
        status: 400,
      });
    }

    const dbData = utxos.map((outpoint: any) => {
      const { txid, n, balance } = outpoint;
      return {
        hash: Buffer.from(txid, "hex"),
        index: n,
        value: balance,
        destination_address: recoveryAddress,
      };
    });

    console.log(dbData);

    const insertedRows = await sql`
      INSERT INTO armored_outpoint (hash, index, value, destination_address) VALUES ${sql(
        dbData.map(({ hash, index, value, destination_address }) => [
          hash,
          index,
          value,
          destination_address,
        ])
      )}
      RETURNING id
    `;

    const insertedIds = insertedRows.map((row: any) => row.id);
    console.log(insertedIds);

    return Response.json({ insertedIds }, { status: 201 });
  } catch (error) {
    console.error("api/address -> ", error);
    return new Response("api/address", { status: 500 });
  }
}
