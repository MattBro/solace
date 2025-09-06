# Browser Errors Fix Plan

## Priority 1: Critical HTML Structure Error

### Issue: Invalid HTML nesting - `<th>` elements inside `<thead>`
**Error:** "In HTML, `<th>` cannot be a child of `<thead>`"
**Location:** `src/app/page.tsx:61`
**Impact:** Causes hydration error and full client-side re-render

#### Fix:
```tsx
// Current (INCORRECT):
<thead>
  <th>First Name</th>
  <th>Last Name</th>
  ...
</thead>

// Fixed (CORRECT):
<thead>
  <tr>
    <th>First Name</th>
    <th>Last Name</th>
    ...
  </tr>
</thead>
```

## Priority 2: React Key Warnings

### Issue 1: Missing keys in advocate table rows
**Warning:** "Each child in a list should have a unique 'key' prop"
**Location:** `src/app/page.tsx:72`

#### Fix:
```tsx
// Current:
{filteredAdvocates.map((advocate) => {
  return (
    <tr>
      ...
    </tr>
  );
})}

// Fixed:
{filteredAdvocates.map((advocate) => {
  return (
    <tr key={advocate.id}>
      ...
    </tr>
  );
})}
```

### Issue 2: Missing keys in specialties list
**Warning:** "Each child in a list should have a unique 'key' prop"
**Location:** `src/app/page.tsx:79`

#### Fix:
```tsx
// Current:
{advocate.specialties.map((s) => (
  <div>{s}</div>
))}

// Fixed:
{advocate.specialties.map((s, index) => (
  <div key={`${advocate.id}-specialty-${index}`}>{s}</div>
))}
```

## Additional Improvements

### Console Warnings
- Remove `console.log` statements in production
- Replace with proper logging utility or remove entirely

### TypeScript Type Safety
- Add proper typing for advocate data structure
- Type the event handlers properly

## Implementation Order

1. ✅ Fix HTML structure (`<th>` in `<tr>`)
2. ✅ Add key to table rows
3. ✅ Add key to specialties list
4. ✅ Remove/replace console.log statements
5. ✅ Add TypeScript interfaces
6. ✅ Test all fixes
7. ✅ Verify no hydration errors

## Testing Checklist

- [ ] No HTML validation errors in browser console
- [ ] No React key warnings
- [ ] No hydration mismatch errors
- [ ] Table renders correctly
- [ ] Search functionality works
- [ ] All advocate data displays properly

## Code Quality Improvements

### Add TypeScript Interface
```typescript
interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}
```

### Improve Event Handler Typing
```typescript
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
}
```

## Expected Outcome

After implementing these fixes:
- Zero browser console errors
- Zero React warnings
- Proper HTML structure
- Type-safe code
- Better performance (no client-side re-render due to hydration mismatch)