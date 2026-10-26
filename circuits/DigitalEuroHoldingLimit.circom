pragma circom 2.0.0;

include "circomlibjs/poseidon.circom";
include "circomlibjs/comparators.circom";

template DigitalEuroHoldingLimit() {
  signal input eurosHeld;
  signal input maximumAllowed;
  signal input salt;
  signal input holdingCommitment;

  signal output isCompliant;
  signal output holdingHash;

  // Verify holding commitment matches the hashed balance
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== eurosHeld;
  poseidon.inputs[1] <== salt;

  holdingHash <== poseidon.out;

  // Verify the commitment hash matches the input
  holdingHash === holdingCommitment;

  // Check that eurosHeld <= maximumAllowed
  component isLessOrEqual = LessEqThan(64);
  isLessOrEqual.in[0] <== eurosHeld;
  isLessOrEqual.in[1] <== maximumAllowed;

  isCompliant <== isLessOrEqual.out;
  isCompliant === 1;
}
