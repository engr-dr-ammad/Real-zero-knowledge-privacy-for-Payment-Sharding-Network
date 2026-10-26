# Development Guide

## Project Structure

```
.
├── circuits/                 # Circom ZK circuits
│   ├── RangeCheck.circom
│   ├── SufficientBalance.circom
│   ├── DigitalEuroHoldingLimit.circom
│   └── TransactionCompliance.circom
├── src/                      # TypeScript source code
│   ├── index.ts              # Main API
│   ├── types.ts              # Type definitions
│   ├── crypto.ts             # Cryptographic utilities
│   ├── ProofGenerator.ts     # Proof generation logic
│   └── ProofVerifier.ts      # Proof verification logic
├── scripts/
│   ├── compile-circuits.js   # Circuit compilation
│   └── generate-proofs.js    # Proof generation demo
├── tests/
│   └── test.js               # Test suite
├── examples/
│   └── demo.ts               # Usage examples
└── package.json
```

## Setting Up Development Environment

### Prerequisites
- Node.js 18.0.0 or later
- npm or yarn
- (Optional) Circom compiler for circuit development

### Initial Setup

```bash
# Install Node dependencies
npm install

# Install Circom (optional, for circuit development)
git clone https://github.com/iden3/circom.git
cd circom
cargo install --path circom

# Build the project
npm run build
```

## Development Workflow

### Making Circuit Changes

1. Edit circuits in `circuits/` directory
2. Update circuit type definitions in `src/types.ts` if needed
3. Recompile: `npm run compile-circuits`
4. Test: `npm test`

### Adding New Proofs

1. Create new circuit in `circuits/NewCircuit.circom`
2. Add TypeScript types in `src/types.ts`
3. Implement generator in `ProofGenerator.ts`
4. Add verifier logic in `ProofVerifier.ts`
5. Export from `src/index.ts`
6. Write tests in `tests/test.js`

### Testing

```bash
# Run all tests
npm test

# Run specific test
node --experimental-vm-modules --input-type=module tests/test.js

# Generate coverage (when available)
npm run test:coverage
```

## Circuit Development Details

### Circuit Language: Circom 2.0

Circuits define constraints that prove statements without revealing witness data.

#### Example: SufficientBalance
```circom
template SufficientBalance() {
  signal input userBalance;          // Private witness
  signal input minimumRequired;      // Public
  signal input salt;                 // Private
  signal input balanceCommitment;    // Public
  
  signal output isValid;
  signal output balanceHash;
  
  // Constraint 1: Verify commitment
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== userBalance;
  poseidon.inputs[1] <== salt;
  balanceHash <== poseidon.out;
  balanceHash === balanceCommitment;
  
  // Constraint 2: Check balance >= threshold
  component isGreaterOrEqual = GreaterEqThan(64);
  isGreaterOrEqual.in[0] <== userBalance;
  isGreaterOrEqual.in[1] <== minimumRequired;
  isValid <== isGreaterOrEqual.out;
  isValid === 1;
}
```

#### Key Concepts

1. **Signals**: Variables in the circuit
   - `signal input`: Private witness data
   - `signal output`: Public outputs
   - Regular signals: Internal computation

2. **Constraints**: Mathematical equations that must hold
   - Written with `<==` operator
   - Must be satisfied for valid proofs
   - Violations cause proof generation to fail

3. **Components**: Reusable circuit building blocks
   - `GreaterEqThan(n)`: Compare two n-bit numbers
   - `LessEqThan(n)`: Less-than-or-equal comparison
   - `Poseidon(n)`: Hash function

### Compilation Process

```bash
# Compile circuit to constraints
circom circuits/SufficientBalance.circom --r1cs --wasm -o build/

# This generates:
# - SufficientBalance.r1cs (constraint system)
# - SufficientBalance_js/ (witness generation WASM)
```

## Proof Generation Flow

```
User Balance Data
        ↓
   Generate Salt
        ↓
   Create Commitment
   (hash(balance, salt))
        ↓
   Generate Witness
   (all signal values)
        ↓
   Create Proof
   (using snarkjs)
        ↓
   ZK Proof
   (can be verified without revealing balance)
```

## Proof Verification Flow

```
ZK Proof + Public Signals
        ↓
   Load Verification Key
        ↓
   Verify Proof Signature
        ↓
   Check Public Signal Values
        ↓
   Return Verification Result
```

## Performance Characteristics

### Proof Generation
- **Time**: 100-500ms per proof (depends on circuit complexity)
- **Memory**: ~50MB per circuit
- **Parallelizable**: Yes, can generate multiple proofs in parallel

### Proof Verification
- **Time**: 10-50ms per proof
- **Memory**: ~10MB
- **Batch**: Can verify 1000s of proofs very quickly

### Proof Size
- **Groth16**: ~256 bytes (constant size)
- **Public Signals**: Variable, typically 32-256 bytes
- **Storage**: Efficient for blockchain

## Production Considerations

### 1. Key Ceremony
```bash
# Generate powers of tau (once per deployment)
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

### 2. Setup Keys
```bash
# Generate per-circuit keys
snarkjs groth16 setup build/SufficientBalance.r1cs \
  pot12_final.ptau build/SufficientBalance_0000.zkey

snarkjs zkey export verificationkey \
  build/SufficientBalance_0000.zkey \
  build/SufficientBalance_vkey.json
```

### 3. Secure Key Storage
- Store proving keys in HSM (Hardware Security Module)
- Never commit proving keys to version control
- Implement key rotation policies
- Use separate keys for different environment stages

### 4. Witness Management
- Never log witness data (especially balance amounts)
- Implement secure memory handling
- Clear sensitive data after use
- Use secure random number generation for salts

## Debugging

### Verbose Logging
```typescript
// Enable detailed logging
process.env.DEBUG = '*';
process.env.VERBOSE = 'true';
```

### Witness Inspection
```bash
# After generating witness
cat witness.json | jq .
```

### Constraint Checking
```bash
# Verify R1CS constraints
circom circuits/SufficientBalance.circom --r1cs -o build/
snarkjs r1cs info build/SufficientBalance.r1cs
```

## Common Issues

### Issue: "Circuit not compiled"
**Solution**: Run `npm run compile-circuits`

### Issue: "Invalid witness"
**Solution**: Verify all input values are correct bigints

### Issue: "Proof verification failed"
**Solution**: 
1. Check proof structure
2. Verify verification key loaded correctly
3. Ensure public signals match proof

### Issue: "Memory overflow"
**Solution**: Reduce bit-widths in circuit or increase system memory

## Contributing Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow existing naming conventions
   - Add JSDoc comments for public APIs

2. **Testing**
   - Write tests for new features
   - Run full test suite before PR
   - Achieve 80%+ code coverage

3. **Documentation**
   - Update README for user-facing changes
   - Document circuit changes in DEVELOPMENT.md
   - Add examples for new features

4. **Commits**
   ```bash
   # Use conventional commits
   git commit -m "feat: add range proof circuit"
   git commit -m "fix: handle large number comparison"
   ```

## Resources

### Circom Documentation
- https://docs.circom.io/
- Circuit examples: https://github.com/iden3/circom/tree/master/examples

### snarkjs Guide
- GitHub: https://github.com/iden3/snarkjs
- Examples: https://github.com/iden3/snarkjs/blob/master/examples

### ZK Learning
- ZKProof Standards: https://zkproof.org/
- Circom & snarkjs Tutorial: https://github.com/iden3/snarkjs/blob/master/README.md

### Elliptic Curves
- BN128: https://en.wikipedia.org/wiki/Barreto%E2%80%93Naehrig_curve
- Curve Specifications: https://eprint.iacr.org/2010/206.pdf

## Security Audit Checklist

Before production deployment:
- [ ] Circuits reviewed by cryptography experts
- [ ] All constraints verified mathematically
- [ ] Witness generation tested with various inputs
- [ ] Key ceremony completed with witnesses destroyed
- [ ] Verification keys distributed securely
- [ ] No sensitive data in logs
- [ ] Performance tested under load
- [ ] Error handling comprehensive
- [ ] All dependencies audited
- [ ] Compliance with regulations verified
