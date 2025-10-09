/**
 * Example usage of the Merkle tree utilities.
 * This file demonstrates the complete workflow for creating and using a Merkle tree
 * for an airdrop campaign.
 *
 * CUSTOMIZE: This is a reference implementation. Adapt to your specific needs.
 */

import {
  exportTreeData,
  generateMerkleTree,
  getAllEligible,
  getEligibilityForAddress,
  getRecipientStats,
  loadTreeData,
  MOCK_RECIPIENTS,
  verifyProof,
} from "./index";

/**
 * Example 1: Generate a Merkle tree and get the root
 */
export function example1_GenerateTree() {
  console.log("\n=== Example 1: Generate Merkle Tree ===");

  // Generate tree from recipients
  const tree = generateMerkleTree(MOCK_RECIPIENTS);

  // Get the root hash - this is what you deploy to your smart contract
  const root = tree.root;
  console.log("Merkle Root:", root);
  console.log("Total Recipients:", MOCK_RECIPIENTS.length);

  return { root, tree };
}

/**
 * Example 2: Save and load tree data
 */
export function example2_SaveAndLoadTree() {
  console.log("\n=== Example 2: Save and Load Tree ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);

  // Export tree data for persistence
  const treeData = exportTreeData(tree);
  console.log("Tree data exported:", {
    format: treeData.format,
    leafCount: treeData.values.length,
  });

  // In a real application, you would save this to a file or database:
  // await fs.writeFile("merkle-tree.json", JSON.stringify(treeData, null, 2));
  // or
  // await db.saveTree(campaignId, treeData);

  // Load tree from saved data
  const loadedTree = loadTreeData(treeData);
  console.log("Tree loaded successfully");
  console.log("Roots match:", tree.root === loadedTree.root);

  return { loadedTree, tree };
}

/**
 * Example 3: Check eligibility for a specific address
 */
export function example3_CheckEligibility() {
  console.log("\n=== Example 3: Check Eligibility ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);
  const userAddress = MOCK_RECIPIENTS[0].address;

  // Check if address is eligible
  const eligibility = getEligibilityForAddress(userAddress, tree);

  if (eligibility) {
    console.log("Address is eligible!");
    console.log("Address:", eligibility.address);
    console.log("Amount:", eligibility.amount.toString());
    console.log("Index:", eligibility.index);
    console.log("Proof length:", eligibility.proof.length);
    console.log("Proof:", eligibility.proof);
  } else {
    console.log("Address is not eligible");
  }

  return eligibility;
}

/**
 * Example 4: Verify a proof
 */
export function example4_VerifyProof() {
  console.log("\n=== Example 4: Verify Proof ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);
  const userAddress = MOCK_RECIPIENTS[0].address;
  const eligibility = getEligibilityForAddress(userAddress, tree);

  if (!eligibility) {
    console.log("Address not found");
    return;
  }

  // Verify the proof
  const isValid = verifyProof(
    tree.root,
    eligibility.proof,
    eligibility.index,
    eligibility.address,
    eligibility.amount,
  );

  console.log("Proof is valid:", isValid);

  // Test with invalid data
  const invalidProof = verifyProof(
    tree.root,
    eligibility.proof,
    eligibility.index,
    eligibility.address,
    eligibility.amount + 1n, // Wrong amount
  );

  console.log("Invalid proof (wrong amount):", invalidProof);

  return isValid;
}

/**
 * Example 5: Get statistics
 */
export function example5_GetStatistics() {
  console.log("\n=== Example 5: Get Statistics ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);
  const stats = getRecipientStats(tree);

  console.log("Statistics:");
  console.log("  Total Recipients:", stats.count);
  console.log("  Total Amount:", stats.total.toString());
  console.log("  Average Amount:", stats.average.toString());
  console.log("  Min Amount:", stats.min.toString());
  console.log("  Max Amount:", stats.max.toString());

  return stats;
}

/**
 * Example 6: Get all eligible recipients
 */
export function example6_GetAllEligible() {
  console.log("\n=== Example 6: Get All Eligible ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);
  const allEligible = getAllEligible(tree);

  console.log("All eligible recipients:");
  for (const recipient of allEligible) {
    console.log(`  ${recipient.address}: ${recipient.amount.toString()}`);
  }

  return allEligible;
}

/**
 * Example 7: Simulate a claim workflow
 */
export function example7_ClaimWorkflow() {
  console.log("\n=== Example 7: Claim Workflow ===");

  const tree = generateMerkleTree(MOCK_RECIPIENTS);
  const userAddress = MOCK_RECIPIENTS[2].address;

  console.log("User wants to claim:", userAddress);

  // Step 1: Check eligibility
  const eligibility = getEligibilityForAddress(userAddress, tree);

  if (!eligibility) {
    console.log("❌ Not eligible for airdrop");
    return null;
  }

  console.log("✓ User is eligible");
  console.log("  Amount:", eligibility.amount.toString());

  // Step 2: Verify proof locally before transaction
  const isValid = verifyProof(
    tree.root,
    eligibility.proof,
    eligibility.index,
    eligibility.address,
    eligibility.amount,
  );

  if (!isValid) {
    console.log("❌ Proof verification failed");
    return null;
  }

  console.log("✓ Proof verified");

  // Step 3: Prepare transaction data
  const txData = {
    amount: eligibility.amount,
    index: eligibility.index,
    proof: eligibility.proof,
  };

  console.log("✓ Ready to submit transaction");
  console.log("  Transaction data:", JSON.stringify(txData, null, 2));

  // In a real application:
  // const hash = await claimContract.write.claim([
  //   txData.proof,
  //   txData.index,
  //   txData.amount,
  // ]);

  return txData;
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  Merkle Tree Examples - Sablier Airdrops  ║");
  console.log("╚════════════════════════════════════════════╝");

  example1_GenerateTree();
  example2_SaveAndLoadTree();
  example3_CheckEligibility();
  example4_VerifyProof();
  example5_GetStatistics();
  example6_GetAllEligible();
  example7_ClaimWorkflow();

  console.log("\n✓ All examples completed successfully!");
}

// Uncomment to run examples:
// runAllExamples();
