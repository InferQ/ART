[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / FilterOptions

# Interface: FilterOptions

Defined in: [src/types/index.ts:1140](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1140)

Options for filtering data retrieved from storage.
Structure depends heavily on the underlying adapter's capabilities.

 FilterOptions

## Properties

### filter?

> `optional` **filter**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:1145](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1145)

An object defining filter criteria (e.g., `{ threadId: 'abc', type: 'TOOL_EXECUTION' }`). Structure may depend on adapter capabilities.

***

### limit?

> `optional` **limit**: `number`

Defined in: [src/types/index.ts:1155](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1155)

The maximum number of records to return.

***

### skip?

> `optional` **skip**: `number`

Defined in: [src/types/index.ts:1160](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1160)

The number of records to skip (for pagination).

***

### sort?

> `optional` **sort**: `Record`\<`string`, `"asc"` \| `"desc"`\>

Defined in: [src/types/index.ts:1150](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1150)

An object defining sorting criteria (e.g., `{ timestamp: 'desc' }`).
