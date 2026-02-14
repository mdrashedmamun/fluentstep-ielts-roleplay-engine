# Data Integrity: Code Safety & Performance

## Defensive Fallback Patterns

All code accessing nested properties must use defensive patterns. This prevents crashes from missing or null values.

### Rule: Defensive Property Access

**Template**:
```typescript
// ✅ Correct: Defensive with default
const value = obj?.prop?.nested || defaultValue;
const array = obj?.items || [];
const obj2 = data?.nested ?? null;
```

**Anti-patterns** (❌ Forbidden):
```typescript
// ❌ Crash if property missing
const value = obj.prop.nested;
const array = obj.items.map(...); // Crashes if items undefined

// ❌ No default
const value = obj?.prop; // Returns undefined if missing
```

### Common Properties Requiring Defense

These properties should ALWAYS have defensive access:

- `entry?.chunkFeedback?.[answerId]?.feedback`
- `scenario?.blanksInOrder || []`
- `feedback?.patternSummary?.commonMistakes || []`
- `data?.activeRecall?.hints || []`

---

## O(1) Lookup Requirement

All frequently accessed collections must use O(1) lookups (Map/Set/Object keys, NOT arrays).

### Rule: Use Maps for Lookups

**Template**:
```typescript
// ✅ Correct: O(1) lookup with Map
const feedbackMap = new Map(
  Object.entries(chunkFeedback || {})
);
const feedback = feedbackMap.get(blankId);

// ✅ Correct: Direct object key (O(1))
const feedback = chunkFeedback?.[blankId];

// ❌ Wrong: O(n) search
const feedback = Object.entries(chunkFeedback || {})
  .find(([id]) => id === blankId)?.[1];
```

### Performance Requirements

| Operation | Complexity | Requirement | Example |
|-----------|-----------|------------|---------|
| Find feedback by blank ID | O(n) | O(1) | Use Map/object key |
| List all blanks | O(n) | Acceptable | Array iteration |
| Check if blank exists | O(n) | O(1) | Use Set.has() |
| Get all feedback entries | O(n) | Acceptable | Object.values() |

### Collections That Must Use O(1)
- Chunk feedback lookups: Use object keys, not array find()
- Scenario ID lookups: Use Map or Set
- Answer variation lookups: Use indexed array access
- Blank index lookups: Use direct array index, not search

---

## File Locking & Race Conditions

The most critical file in the system is `src/services/staticData.ts` (all 52 scenarios + feedback).

### File Locking Protocol

**Rule**: Only ONE agent can write to `staticData.ts` at a time.

### Implementation

```typescript
// ✅ Correct: Acquire lock before write
const lockFile = await acquireLock('staticData.ts', {
  timeout: 300000,  // 5 minute timeout
  waitInterval: 1000, // Check every 1 second
});

try {
  const data = await readFile('staticData.ts');
  // Modify data
  await writeFile('staticData.ts', newData);
} finally {
  await releaseLock(lockFile);
}
```

### Lock Timeout Rules
- **Standard write**: 5 minute timeout (300,000 ms)
- **Quick writes**: 30 second timeout (30,000 ms)
- **Batch writes**: 30 minute timeout (1,800,000 ms)

### Race Condition Prevention

**Forbidden Patterns** (❌):
```typescript
// ❌ Multiple processes writing simultaneously
await writeFile('staticData.ts', data1); // Process A
await writeFile('staticData.ts', data2); // Process B

// ❌ Read-modify-write without lock
const data = await readFile('staticData.ts');
data.scenarios.push(newScenario);
await writeFile('staticData.ts', data); // Lost update!
```

**Correct Pattern** (✅):
```typescript
// ✅ Lock-based coordination
const lock = await acquireLock('staticData.ts');
try {
  const data = await readFile('staticData.ts');
  data.scenarios.push(newScenario);
  await writeFile('staticData.ts', data);
} finally {
  await releaseLock(lock);
}
```

### Multi-Agent Coordination

Agents write to **different zones** within staticData.ts:

| Agent | Write Zone | Lock Required |
|-------|-----------|---------------|
| content-gen-agent | Staging area `.staging/` | No |
| data-services-agent | `staticData.ts` main | Yes, exclusive lock |
| testing-agent | Read-only, test files | No |
| orchestrator-qa | Coordination, metadata | Shared lock |

---

## Security & Input Validation

### Input Validation Rules

**Validate at system boundaries only**:
- User form input ✅
- API responses ✅
- File uploads ✅
- External data sources ✅

**Do NOT validate**:
- Internal function parameters ❌
- Results from trusted functions ❌
- Framework-validated data ❌

### Validation Checklist
- [ ] ChunkID format: `{scenarioId}-b{n}` regex
- [ ] ScenarioID: Alphanumeric + hyphens only
- [ ] Answer text: Max 500 characters, no special control characters
- [ ] Feedback text: Max 2000 characters
- [ ] Array lengths: Match expected schema

### Forbidden Operations
- ❌ No `eval()` on user input
- ❌ No dynamic imports from user data
- ❌ No passing user input to shell commands
- ❌ No DOM innerHTML from external data (use textContent)
- ❌ No disabled security checks for convenience

---

## Data Transformation Safety

### Immutable Transform Pattern

```typescript
// ✅ Correct: Create new objects
const updated = {
  ...scenario,
  blanksInOrder: [...scenario.blanksInOrder, newBlank],
  feedback: { ...scenario.feedback, [id]: newFeedback }
};

// ❌ Wrong: Mutate in place
scenario.blanksInOrder.push(newBlank);
scenario.feedback[id] = newFeedback;
```

### Collection Operations

```typescript
// ✅ Correct: Functional transforms
const mapped = data.map(x => transform(x));
const filtered = data.filter(x => predicate(x));
const reduced = data.reduce((acc, x) => acc + x, 0);

// ❌ Wrong: forEach mutations
data.forEach(x => {
  x.value = transform(x); // Mutation!
});
```

---

## Type Safety Rules

### Enum Strictness

```typescript
// ✅ Correct: Explicit string literal type
type FeedbackStatus = 'correct' | 'good_try' | 'incorrect';
const status: FeedbackStatus = 'correct';

// ❌ Wrong: Loose string type
const status: string = 'correct';
if (status === 'correct') { } // Typo-prone
```

### Optional Chaining Order

```typescript
// ✅ Correct: Stop at first null
const value = obj?.prop?.nested?.deeply?.value || default;

// ❌ Wrong: Stop at undefined
const value = obj?.prop?.nested.deeply.value; // Crashes if nested null
```

---

## Performance Guardrails

### Acceptable Complexity

| Operation | Complexity | Max Items | OK? |
|-----------|-----------|-----------|-----|
| Scenario lookup | O(1) | N/A | ✅ |
| List all scenarios | O(n) | 1,000+ | ✅ |
| Feedback search | O(1) | N/A | ✅ |
| Render one scenario | O(m) | 50 blanks | ✅ |
| Nested loop search | O(n²) | Any | ❌ |

**Forbidden Patterns**:
```typescript
// ❌ O(n²): Nested loops
scenarios.map(scenario =>
  blanks.find(blank => blank.id === scenario.id)
);

// ✅ O(n): Use Map
const blankMap = new Map(blanks.map(b => [b.id, b]));
scenarios.map(s => blankMap.get(s.id));
```

---

## Checklist for Safe Code

Before committing any change:

- [ ] All nested property access is defensive (uses `?.` or `||`)
- [ ] No O(n²) algorithms
- [ ] No mutations to shared data structures
- [ ] Scenario ID format validated
- [ ] ChunkID format matches `{scenarioId}-b{n}`
- [ ] File locking used for staticData.ts writes
- [ ] Type checks done for collections before iteration
- [ ] Error handling present for external operations
- [ ] No hardcoded absolute paths
- [ ] No console.log left in production code
- [ ] Tests pass (`npm run test:e2e`)
- [ ] Build passes (`npm run build`)

---

**Last Updated**: Feb 14, 2026
