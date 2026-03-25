---
description: Find and remove `any` type annotations from TypeScript files
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(pnpm tsc:*), Bash(npx tsc:*), Read, Glob, Grep, Edit
---

# Clean Any Types

Find and remove `any` type annotations from TypeScript files, replacing them with proper types.

## Instructions

1. **Identify files to check**:
   - If no specific files are provided, check files changed in the current branch:
     ```bash
     git diff --name-only main...HEAD -- '*.ts' '*.tsx'
     ```
   - Or check staged files:
     ```bash
     git diff --cached --name-only -- '*.ts' '*.tsx'
     ```

2. **Find `any` usages in those files**:
   - Search for patterns: `: any`, `as any`, `<any>`, `any[]`, `any,`, `any>`
   - Use grep to find all occurrences

3. **For each `any` found, determine the proper type**:

   ### Common replacements:

   | Pattern                  | Likely Replacement                                   |
   | ------------------------ | ---------------------------------------------------- |
   | `error: any` in catch    | `error: unknown` then narrow with `instanceof Error` |
   | `data: any` from API     | Create an interface or use existing DTO              |
   | `as any` for enums       | Cast to the specific enum type                       |
   | `callback: any`          | `callback: () => void` or proper function signature  |
   | `options: any`           | Create an options interface                          |
   | `db: any` for drizzle    | Use `PostgresJsDatabase` from drizzle-orm            |
   | `table: any` for drizzle | Use `Table` from `drizzle-orm`                       |
   | `ctx: any` in middleware | Use framework-specific context type                  |

4. **Fix each occurrence**:
   - Read the surrounding code to understand the expected type
   - Check if a type already exists elsewhere in the codebase
   - Create new types/interfaces if needed
   - Use `unknown` with type narrowing for truly unknown types

5. **Verify changes**:
   - Run `pnpm tsc --noEmit` to verify no type errors
   - Ensure the code still works as expected

## Examples

### Before:

```typescript
const getRowCount = async (db: any, table: any): Promise<number> => {
  const result = await db.select().from(table)
  return result.length
}
```

### After:

```typescript
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { Table } from "drizzle-orm"

const getRowCount = async (
  db: PostgresJsDatabase,
  table: Table
): Promise<number> => {
  const result = await db.select().from(table)
  return result.length
}
```

## Arguments

$ARGUMENTS

If arguments are provided, treat them as file paths or glob patterns to check.
Otherwise, check files changed in the current branch compared to main.

## Notes

- Don't use `any` to silence legitimate type errors - fix the underlying issue
- `unknown` is preferred over `any` when the type is truly unknown
- Consider using generics for reusable functions with variable types
- Check for existing types before creating new ones
- Run type checker after each change to catch cascading issues
