# Contributing to Zero-Knowledge Payment Sharding Network

First off, thank you for considering contributing to this project! It's people like you that make this such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Follow the TypeScript style guide
* Include appropriate test cases
* Update documentation as needed
* End all files with a newline

## Development Setup

```bash
# Clone the repository
git clone https://github.com/engr-dr-ammad/Real-zero-knowledge-privacy-for-Payment-Sharding-Network.git
cd Real-zero-knowledge-privacy-for-Payment-Sharding-Network

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter (when configured)
npm run lint
```

## Making Changes

### Branch Naming
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring
- `test/description` - for test improvements

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc.

Example:
```
feat(circuits): add range proof circuit

- Implement RangeProof circuit for value bounds checking
- Add witness generation for range proofs
- Include comprehensive tests

Closes #123
```

### Code Style

#### TypeScript
- Use strict mode
- Provide explicit type annotations
- Use meaningful variable names
- Add JSDoc comments for public APIs

```typescript
/**
 * Generates a zero-knowledge proof of balance
 * @param balance - User's actual balance (kept private)
 * @param minimum - Minimum balance to prove
 * @returns Proof and commitment
 */
export async function proveBalance(
  balance: bigint,
  minimum: bigint
): Promise<ProofResult> {
  // implementation
}
```

#### Circom
- One constraint per line when possible
- Comment complex constraints
- Use meaningful signal names

```circom
// Check that balance >= minimumRequired
component isGreaterOrEqual = GreaterEqThan(64);
isGreaterOrEqual.in[0] <== userBalance;
isGreaterOrEqual.in[1] <== minimumRequired;
isValid <== isGreaterOrEqual.out;
```

### Testing

Write tests for:
- Happy path scenarios
- Error cases
- Edge cases
- Privacy properties (for cryptographic code)

```typescript
describe('ProofGenerator', () => {
  it('should generate valid balance proof', async () => {
    const proof = await generator.generateBalanceProof(...);
    expect(proof).toBeDefined();
    expect(proof.publicSignals).toHaveLength(2);
  });

  it('should reject insufficient balance', async () => {
    expect(async () => {
      await generator.generateBalanceProof(BigInt(100), BigInt(1000));
    }).rejects.toThrow('Insufficient balance');
  });
});
```

## Documentation

### README Updates
Update README.md if you:
- Add a new feature
- Change the API
- Add new configuration options
- Fix a security issue

### Code Comments
- Comment the WHY, not the WHAT
- Explain non-obvious logic
- Document security considerations

```typescript
// Verify commitment against revealed salt and private balance
// This prevents frontrunning attacks where prover changes balance
const calculatedCommitment = poseidon(balance, salt);
```

### Changelog
Update CHANGELOG.md (if exists) with:
- New features
- Bug fixes
- Breaking changes
- Security updates

## Review Process

1. **Automated Checks**
   - Tests must pass
   - TypeScript compilation must succeed
   - Code style checks (if configured)

2. **Code Review**
   - At least one approval required
   - For security-related changes: 2 approvals required
   - Cryptography changes reviewed by experts

3. **Merge**
   - Squash commits for clarity
   - Update PR title to follow commit conventions
   - Delete branch after merge

## Security Considerations

### Never Commit
- Private keys or secrets
- API credentials
- Sensitive test data
- Unencrypted passwords

### Security-Related Changes
- Mark PR as `security` label
- Include security implications in description
- Request review from security team
- Don't merge without careful review

### Cryptographic Code
- Reference academic papers
- Include implementation notes
- Add security assumptions
- Document known limitations

## Project Structure Guidelines

```
src/
├── index.ts           # Public API
├── types.ts           # Type definitions
├── ProofGenerator.ts  # Proof generation
└── ProofVerifier.ts   # Proof verification

circuits/
├── *.circom          # Circuit implementations
└── README.md         # Circuit documentation

tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
└── security/         # Security-specific tests
```

## Performance Considerations

- Profile code before optimizing
- Document performance improvements
- Include benchmarks for cryptographic code
- Consider memory usage for large datasets

## Accessibility

- Write clear, descriptive error messages
- Make documentation inclusive
- Test with different environments

## Questions?

- Check existing issues and discussions
- Read the documentation
- Open a new discussion for questions

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in project README

Thank you for your contributions! 🎉
