/**
 * IPFS Merkle tree data structure
 * Follows Sablier's standard IPFS format
 */
export interface IpfsMerkleData {
  /** Stringified StandardMerkleTree JSON */
  merkle_tree: string;
  /** Total number of recipients */
  number_of_recipients: number;
  /** List of recipients with amounts */
  recipients: Array<{
    address: string;
    amount: string;
  }>;
  /** Merkle root hash */
  root: string;
  /** Total amount allocated */
  total_amount: string;
}
