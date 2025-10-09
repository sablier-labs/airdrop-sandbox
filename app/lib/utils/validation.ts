import { isAddress } from "viem";
import { z } from "zod";

/**
 * Ethereum address schema
 */
export const addressSchema = z.string().refine(isAddress, {
  message: "Invalid Ethereum address",
});

/**
 * Query parameters schema for proof endpoint
 */
export const proofQuerySchema = z.object({
  address: addressSchema,
});

/**
 * Validates query parameters for proof endpoint
 */
export function validateProofQuery(address: string | null) {
  return proofQuerySchema.safeParse({ address });
}
