# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Issue: `npm install` fails with dependency errors

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```bash
# Option 1: Use npm legacy peer deps
npm install --legacy-peer-deps

# Option 2: Update npm to latest version
npm install -g npm@latest

# Option 3: Clear npm cache
npm cache clean --force
npm install
```

#### Issue: Node version incompatibility

**Symptoms:**
```
npm ERR! notsup Unsupported platform for optional dependency
```

**Solutions:**
```bash
# Check your Node version
node --version

# Required: Node.js 18.0.0 or higher
# Recommended: Node.js 20.x or 22.x

# Install correct Node version with nvm
nvm install 20
nvm use 20
```

---

### Build Issues

#### Issue: TypeScript compilation errors

**Symptoms:**
```
error TS2307: Cannot find module...
error TS4023: Exported variable has or is using name from external module...
```

**Solutions:**
```bash
# Clear build artifacts
rm -rf dist/ build/

# Rebuild from scratch
npm run build-ts

# Check for import issues
npx tsc --noEmit
```

#### Issue: Module resolution errors

**Symptoms:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module...
```

**Solutions:**
1. Ensure all imports have `.js` extensions (ESM requirement)
2. Check `tsconfig.json` has `"moduleResolution": "node"`
3. Verify relative paths are correct
4. Check that compiled files exist in `dist/` directory

---

### Testing Issues

#### Issue: Tests fail to run

**Symptoms:**
```
Error: Cannot find module './dist/index.js'
```

**Solutions:**
```bash
# Rebuild the TypeScript
npm run build-ts

# Run tests again
npm test

# For verbose output
npm test -- --verbose
```

#### Issue: Individual test failures

**Symptoms:**
```
✗ Test failed: [specific error message]
```

**Check the test output** to understand which specific assertion failed, then:

1. **Balance Proof Fails**:
   - Verify BigInt values are correct
   - Check that minimumRequired < userBalance

2. **Holding Limit Fails**:
   - Verify eurosHeld values
   - Check that eurosHeld <= maximumAllowed

3. **Privacy Test Fails**:
   - This is expected behavior - commitments should differ with random salts
   - Check that both proofs verify successfully

---

### Runtime Issues

#### Issue: Out of memory errors

**Symptoms:**
```
JavaScript heap out of memory
```

**Solutions:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 tests/test.js

# Or set globally
export NODE_OPTIONS=--max-old-space-size=4096
npm test
```

#### Issue: BigInt conversion errors

**Symptoms:**
```
TypeError: The number X cannot be converted to a BigInt because it is not an integer
```

**Solutions:**
- Ensure all numeric values are integers
- Use `Math.floor()` before BigInt conversion
- Check that values from `Math.random()` are multiplied by integers

```typescript
// ❌ Wrong
const value = BigInt(Math.random() * 1000);

// ✅ Correct
const value = BigInt(Math.floor(Math.random() * 1000));
```

---

### Circuit Issues

#### Issue: Circom circuits not found

**Symptoms:**
```
File not found: circuits/SufficientBalance.circom
```

**Solutions:**
```bash
# Verify circuits exist
ls -la circuits/

# Check file paths in scripts
cat scripts/compile-circuits.js

# Ensure you're in the correct directory
pwd
```

#### Issue: Proof generation fails

**Symptoms:**
```
Error: Insufficient balance for proof
Error: Exceeds maximum holding limit
```

**Solutions:**
1. **Insufficient Balance**:
   - Verify `userBalance >= minimumRequired`
   - Check that balance values are correct

2. **Exceeds Limit**:
   - Verify `eurosHeld <= maximumAllowed`
   - Check holding limit values

---

### Cryptographic Issues

#### Issue: Commitment verification fails

**Symptoms:**
```
Error: Invalid balance commitment
Error: Commitment mismatch
```

**Solutions:**
1. Ensure the same salt is used for commitment and verification
2. Verify balance value hasn't changed
3. Check that Poseidon hash function is working correctly

#### Issue: Proof verification always fails

**Symptoms:**
```
VerificationResult: { isValid: false }
```

**Solutions:**
1. Verify proof structure is valid (check pi_a, pi_b, pi_c)
2. Ensure public signals are correct
3. Check that verification key is loaded correctly
4. Verify proof matches the circuit (right proof for right circuit)

---

### GitHub Issues

#### Issue: Push to GitHub fails

**Symptoms:**
```
fatal: expected 'acknowledgments', received 'packfile'
```

**Solutions:**
```bash
# Check git configuration
git config --list

# Try pushing again (network glitch)
git push origin master

# Or with verbose output
git push -v origin master
```

#### Issue: Cannot create pull request

**Symptoms:**
```
No commits yet
```

**Solutions:**
```bash
# Ensure you have commits
git log

# Create a new branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description"

# Push branch
git push -u origin feature/your-feature

# Create PR from GitHub web interface
```

---

### Performance Issues

#### Issue: Proof generation is slow

**Symptoms:**
- Proof generation takes > 1 second per proof

**Solutions:**
1. Check system resources (RAM, CPU)
2. Close other applications
3. Try with smaller witness data
4. Check for I/O bottlenecks

#### Issue: Batch verification is slow

**Symptoms:**
- Batch verification of 100+ proofs is slow

**Solutions:**
1. Process proofs in smaller batches (e.g., 50 at a time)
2. Use `Promise.all()` for parallel verification
3. Consider implementing result caching

---

### Environment Issues

#### Issue: Proxy/Network errors

**Symptoms:**
```
RequestError: connect ECONNREFUSED
Network error: ENOTFOUND
```

**Solutions:**
```bash
# Check internet connection
ping github.com

# Check proxy settings
echo $HTTPS_PROXY

# Clear npm cache
npm cache clean --force

# Retry installation
npm install --no-cache
```

#### Issue: TypeScript/Node version incompatibility

**Symptoms:**
```
error TS1219: Experimental decorators are not permitted for parameters...
```

**Solutions:**
```bash
# Check TypeScript version
npx tsc --version

# Update TypeScript
npm install --save-dev typescript@latest

# Verify tsconfig.json settings
cat tsconfig.json
```

---

## Getting Help

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* npm test
VERBOSE=true npm test
```

### Check Logs

```bash
# View error logs
cat logs/error.log

# View npm logs
npm logs

# View git logs
git log --oneline
```

### Report Issues

1. **Check existing issues**: https://github.com/engr-dr-ammad/Real-zero-knowledge-privacy-for-Payment-Sharding-Network/issues

2. **Create detailed bug report**:
   - Include error message
   - Provide steps to reproduce
   - Share environment details
   - Attach relevant logs

3. **Security issues**: Email security@paymentsharding.network

---

## Advanced Troubleshooting

### Strace debugging (Linux)

```bash
strace -e openat node tests/test.js 2>&1 | head -50
```

### Node.js debugging

```bash
node --inspect-brk tests/test.js
# Then open chrome://inspect in Chrome
```

### Memory profiling

```bash
node --expose-gc tests/test.js
```

### Performance profiling

```bash
node --prof tests/test.js
node --prof-process isolate-*.log > profile.txt
```

---

## Still Need Help?

- 📖 Read [README.md](README.md) and [DEVELOPMENT.md](DEVELOPMENT.md)
- 💬 Check GitHub Discussions
- 🔒 Report security issues to: security@paymentsharding.network
- 📧 For other inquiries: contact@paymentsharding.network

---

**Last Updated**: 2024-10-26
**Version**: 1.0.0
