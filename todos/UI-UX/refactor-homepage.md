# Refactor Homepage Component

## File: src/app/page.tsx

### TODO Items:

- [ ] Create custom hook `useAdvocates` for data fetching, search, and pagination logic
- [ ] Create a dedicated AdvocateTable component using TanStack Table for advanced table features
- [ ] Extract pagination controls into a reusable component (integrate with TanStack Table pagination)
- [ ] Move interfaces to a types file
- [ ] Create SearchInput component that uses the hook
- [ ] Improve styling with CSS modules or Tailwind
- [ ] Add proper loading states and error handling
- [ ] Consider using a data fetching library (SWR or React Query)
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Implement proper form handling for search input
- [ ] Add unit tests for hook and components

### TanStack Table Implementation Notes:
- [ ] Install @tanstack/react-table package
- [ ] Implement column definitions with proper typing
- [ ] Add sorting functionality for columns
- [ ] Implement filtering with column-specific filters
- [ ] Add column visibility controls
- [ ] Consider implementing row selection features
- [ ] Add column resizing capabilities if needed
- [ ] Implement virtualization for better performance with large datasets