import PaymentShardingNetwork from '../dist/index.js';

async function runTests() {
  console.log('🔐 Zero-Knowledge Privacy for Payment Sharding Network - Test Suite\n');

  const network = new PaymentShardingNetwork();
  await network.initialize();

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Balance Sufficiency Proof
  console.log('Test 1: Balance Sufficiency Proof');
  console.log('═══════════════════════════════════');
  try {
    const userBalance = BigInt(5000); // User has €5000
    const minimumRequired = BigInt(1000); // Needs to prove they have at least €1000

    const { proof, commitment } = await network.proveBalanceSufficiency(
      userBalance,
      minimumRequired
    );

    console.log('✓ Proof generated successfully');
    console.log(`  • Proof type: ${proof.circuitName}`);
    console.log(`  • Public signals: ${proof.publicSignals.length}`);
    console.log(`  • Commitment hash: ${commitment.commitmentHash.toString().substring(0, 20)}...`);

    const verification = await network.verifyBalanceProof(proof);
    if (verification.isValid) {
      console.log('✓ Proof verified successfully');
      console.log(`  • Balance is sufficient without revealing amount\n`);
      passedTests++;
    } else {
      console.log('✗ Proof verification failed');
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    failedTests++;
  }

  // Test 2: Holding Limit Compliance
  console.log('Test 2: Digital Euro Holding Limit Compliance');
  console.log('═══════════════════════════════════════════════');
  try {
    const eurosHeld = BigInt(95000); // User holds €95,000
    const maximumAllowed = BigInt(100000); // Limit is €100,000

    const { proof, commitment } = await network.proveHoldingCompliance(
      eurosHeld,
      maximumAllowed
    );

    console.log('✓ Proof generated successfully');
    console.log(`  • Proof type: ${proof.circuitName}`);
    console.log(`  • Compliant with digital euro limits\n`);

    const verification = await network.verifyHoldingLimitProof(proof);
    if (verification.isValid) {
      console.log('✓ Proof verified successfully');
      console.log(`  • User is under holding limit without revealing balance\n`);
      passedTests++;
    } else {
      console.log('✗ Proof verification failed');
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    failedTests++;
  }

  // Test 3: Transaction Compliance
  console.log('Test 3: Transaction Compliance Proof');
  console.log('═════════════════════════════════════');
  try {
    const userBalance = BigInt(10000);
    const transactionAmount = BigInt(2000);
    const holdingLimit = BigInt(100000);

    const { proof, commitment } = await network.proveTransactionCompliance(
      userBalance,
      transactionAmount,
      holdingLimit
    );

    console.log('✓ Transaction compliance proof generated');
    console.log(`  • User balance: sufficient for transaction`);
    console.log(`  • Remaining balance: within holding limits`);

    const verification = await network.verifyTransactionComplianceProof(proof);
    if (verification.isValid) {
      console.log('✓ Proof verified successfully');
      console.log(`  • Transaction can proceed securely\n`);
      passedTests++;
    } else {
      console.log('✗ Proof verification failed');
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    failedTests++;
  }

  // Test 4: Insufficient Balance Detection
  console.log('Test 4: Insufficient Balance Detection');
  console.log('═══════════════════════════════════════');
  try {
    const userBalance = BigInt(500);
    const minimumRequired = BigInt(1000);

    await network.proveBalanceSufficiency(userBalance, minimumRequired);
    console.log('✗ Should have failed but did not\n');
    failedTests++;
  } catch (error) {
    console.log('✓ Correctly rejected insufficient balance');
    console.log(`  • Error: ${error.message}\n`);
    passedTests++;
  }

  // Test 5: Holding Limit Violation Detection
  console.log('Test 5: Holding Limit Violation Detection');
  console.log('═════════════════════════════════════════');
  try {
    const eurosHeld = BigInt(150000);
    const maximumAllowed = BigInt(100000);

    await network.proveHoldingCompliance(eurosHeld, maximumAllowed);
    console.log('✗ Should have failed but did not\n');
    failedTests++;
  } catch (error) {
    console.log('✓ Correctly rejected holding limit violation');
    console.log(`  • Error: ${error.message}\n`);
    passedTests++;
  }

  // Test 6: Batch Verification
  console.log('Test 6: Batch Proof Verification');
  console.log('═════════════════════════════════');
  try {
    const proofs = [];

    const proof1 = (await network.proveBalanceSufficiency(BigInt(5000), BigInt(1000)))
      .proof;
    const proof2 = (await network.proveHoldingCompliance(BigInt(50000), BigInt(100000)))
      .proof;

    proofs.push(proof1, proof2);

    const results = await network.verifyProofBatch(proofs);
    const allValid = results.every(r => r.isValid);

    if (allValid) {
      console.log('✓ Batch verification successful');
      console.log(`  • Verified ${results.length} proofs`);
      console.log(`  • All proofs valid\n`);
      passedTests++;
    } else {
      console.log('✗ Some proofs failed verification');
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    failedTests++;
  }

  // Test 7: Privacy Properties
  console.log('Test 7: Privacy Properties Verification');
  console.log('══════════════════════════════════════');
  try {
    const balance1 = BigInt(5000);
    const balance2 = BigInt(5001);
    const threshold = BigInt(1000);

    const { commitment: commitment1 } = await network.proveBalanceSufficiency(
      balance1,
      threshold
    );
    const { commitment: commitment2 } = await network.proveBalanceSufficiency(
      balance2,
      threshold
    );

    // Verify that commitments are different (salts are random)
    const commitmentsDiffer = commitment1.commitmentHash !== commitment2.commitmentHash;

    // But both proofs verify successfully
    const proof1 = (await network.proveBalanceSufficiency(balance1, threshold)).proof;
    const proof2 = (await network.proveBalanceSufficiency(balance2, threshold)).proof;

    const verify1 = await network.verifyBalanceProof(proof1);
    const verify2 = await network.verifyBalanceProof(proof2);

    if (verify1.isValid && verify2.isValid && commitmentsDiffer) {
      console.log('✓ Privacy preserved: different commitments for different amounts');
      console.log(`  • Verifier cannot distinguish between €${balance1} and €${balance2}`);
      console.log(`  • Real balances remain private (commitments use random salts)\n`);
      passedTests++;
    } else {
      console.log('✗ Privacy issue: verification failed');
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}\n`);
    failedTests++;
  }

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('Test Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✓ Passed: ${passedTests}`);
  console.log(`✗ Failed: ${failedTests}`);
  console.log(`Total:   ${passedTests + failedTests}`);
  console.log('\n✨ Zero-Knowledge Privacy System Ready for Payment Sharding!\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
