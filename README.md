# User Acceptance Test (UAT) Execution Guide

## Overview

This directory contains executable User Acceptance Tests for the Universal Inc tattoo artist directory platform. The tests validate critical features for artist profile management and portfolio uploads.

## Test Suite

### UAT-1: Artist Profile Creation & Editing
**File:** `uat-1-profile-creation.test.ts`  
**Objective:** Verify artists can create and update their complete profile information.

**Test Coverage:**
- ✅ Profile creation with all required fields
- ✅ Bio text save and persistence (234 characters)
- ✅ Specialties as comma-separated values
- ✅ Years of experience as integer
- ✅ Contact information (phone, website, Instagram)
- ✅ Complete address information
- ✅ Profile updates and data persistence
- ✅ Multiple field updates
- ✅ Data integrity after updates
- ✅ Subscription tier verification (free in beta)

**Test Data:**
- Artist: Marcus "Ink" Rodriguez
- Shop: Ink & Iron Studios
- Location: New Orleans, Louisiana
- Specialties: Realism, Japanese Traditional, Black & Grey, Cover-ups
- Experience: 12 years

---

### UAT-2: Portfolio Image Upload & Management
**File:** `uat-2-portfolio-upload.test.ts`  
**Objective:** Verify artists can upload, view, and delete portfolio images.

**Test Coverage:**
- ✅ Upload multiple images (3 total)
- ✅ Image metadata storage (caption, style)
- ✅ S3 URL generation and storage
- ✅ Image retrieval by artist ID
- ✅ Caption display verification
- ✅ Image deletion functionality
- ✅ Portfolio count after deletion
- ✅ Remaining images verification
- ✅ Metadata integrity after deletion

**Test Data:**
- Image 1: `dragon_sleeve_final.jpg` - Japanese Traditional
- Image 2: `portrait_realism_woman.jpg` - Realism (deleted in test)
- Image 3: `geometric_mandala_back.png` - Geometric

---

## Prerequisites

### 1. Environment Setup
Ensure the following environment variables are configured:

```bash
# Database
DATABASE_URL=postgresql://...

# S3 Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=universalinc-portfolio

# Application
NODE_ENV=test
```

### 2. Dependencies
Install all required packages:

```bash
pnpm install
```

### 3. Database
Ensure the test database is running and migrations are applied:

```bash
pnpm db:push
```

---

## Running the Tests

### Run All UAT Tests
```bash
pnpm test tests/uat
```

### Run Individual Test Suites

**UAT-1 Only:**
```bash
pnpm test tests/uat/uat-1-profile-creation.test.ts
```

**UAT-2 Only:**
```bash
pnpm test tests/uat/uat-2-portfolio-upload.test.ts
```

### Run with Coverage
```bash
pnpm test:coverage tests/uat
```

### Run in Watch Mode
```bash
pnpm test:watch tests/uat
```

---

## Test Execution Flow

### UAT-1: Profile Creation & Editing

```
1. Setup Phase (beforeAll)
   ├── Create test user (Marcus Rodriguez)
   └── Create test artist profile

2. Test Execution (10 test cases)
   ├── Verify profile creation
   ├── Verify bio save (234 chars)
   ├── Verify specialties save
   ├── Verify experience save
   ├── Verify contact info save
   ├── Verify address save
   ├── Update bio
   ├── Update specialties & experience
   ├── Verify data integrity
   └── Verify subscription tier

3. Cleanup Phase (afterAll)
   ├── Delete test artist profile
   └── Delete test user
```

### UAT-2: Portfolio Upload & Management

```
1. Setup Phase (beforeAll)
   ├── Create test user
   └── Create test artist profile

2. Test Execution (10 test cases)
   ├── Upload image 1 (dragon)
   ├── Upload image 2 (portrait)
   ├── Upload image 3 (mandala)
   ├── Retrieve all 3 images
   ├── Verify captions
   ├── Verify S3 URLs
   ├── Delete image 2 (portrait)
   ├── Verify 2 images remain
   ├── Verify correct images remain
   └── Verify metadata integrity

3. Cleanup Phase (afterAll)
   ├── Delete all portfolio images
   ├── Delete test artist profile
   └── Delete test user
```

---

## Expected Results

### Success Criteria

All tests should pass with the following output:

```
✓ UAT-1: Artist Profile Creation & Editing (10 tests)
  ✓ Step 1: Should create artist profile with all required fields
  ✓ Step 2: Should save complete bio (234 characters)
  ✓ Step 3: Should save specialties as comma-separated string
  ✓ Step 4: Should save years of experience as integer
  ✓ Step 5: Should save all contact information
  ✓ Step 6: Should save complete address information
  ✓ Step 7: Should update bio and persist changes
  ✓ Step 8: Should update specialties and experience
  ✓ Step 9: Should maintain data integrity after multiple updates
  ✓ Step 10: Should have correct subscription tier (free in beta)

✓ UAT-2: Portfolio Image Upload & Management (10 tests)
  ✓ Step 1: Should upload first portfolio image (dragon_sleeve_final.jpg)
  ✓ Step 2: Should upload second portfolio image (portrait_realism_woman.jpg)
  ✓ Step 3: Should upload third portfolio image (geometric_mandala_back.png)
  ✓ Step 4: Should retrieve all 3 uploaded images for artist
  ✓ Step 5: Should display images with correct captions
  ✓ Step 6: Should have valid S3 URLs for all images
  ✓ Step 7: Should delete second image (portrait_realism_woman.jpg)
  ✓ Step 8: Should only have 2 images remaining after deletion
  ✓ Step 9: Should still have dragon and mandala images
  ✓ Step 10: Should maintain image metadata after deletion

Test Files  2 passed (2)
Tests  20 passed (20)
Duration  1.24s
```

### Failure Handling

If any test fails:

1. **Check the error message** - Vitest provides detailed assertion failures
2. **Review database state** - Ensure migrations are applied
3. **Verify environment variables** - Check S3 and database credentials
4. **Check test data** - Ensure no conflicts with existing data
5. **Review logs** - Check server logs for errors

---

## Helper Functions

The `helpers.ts` file provides reusable utilities:

### User Management
```typescript
createTestUser(data)      // Create a test user
cleanupTestUser(userId)   // Delete user and associated data
```

### Artist Profile
```typescript
createTestArtist(userId, data)    // Create artist profile
updateArtistProfile(artistId, updates)  // Update profile
getArtistProfile(artistId)        // Retrieve profile
cleanupTestArtist(artistId)       // Delete artist and data
```

### Portfolio Management
```typescript
uploadTestPortfolioImage(artistId, data)  // Upload image
getArtistPortfolio(artistId)              // Get all images
deletePortfolioImage(imageId)             // Delete image
```

### Test Data
```typescript
MARCUS_RODRIGUEZ_DATA     // UAT-1 test data
PORTFOLIO_TEST_IMAGES     // UAT-2 test data
```

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "Cannot connect to database"  
**Solution:** Ensure `DATABASE_URL` is set and database is running

**Issue:** S3 upload fails  
**Solution:** Verify AWS credentials and S3 bucket exists

**Issue:** Tests timeout  
**Solution:** Increase timeout in vitest.config.ts:
```typescript
testTimeout: 10000 // 10 seconds
```

**Issue:** Test data conflicts  
**Solution:** Tests use unique timestamps to avoid conflicts. If issues persist, manually clean test database:
```sql
DELETE FROM portfolioImages WHERE artistId IN (
  SELECT id FROM artists WHERE shopName LIKE '%Test%'
);
DELETE FROM artists WHERE shopName LIKE '%Test%';
DELETE FROM users WHERE email LIKE '%test%';
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: UAT Tests

on: [push, pull_request]

jobs:
  uat:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm db:push
      - run: pnpm test tests/uat
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## Maintenance

### Updating Test Data

When updating test data:

1. Modify constants in `helpers.ts`
2. Update test assertions if needed
3. Update this README with new data
4. Re-run tests to verify

### Adding New Tests

To add new UAT tests:

1. Create `uat-N-feature-name.test.ts`
2. Follow existing test structure
3. Use helpers from `helpers.ts`
4. Add cleanup in `afterAll`
5. Document in this README

---

## Contact

For questions or issues with UAT tests, contact the development team or file an issue in the project repository.
