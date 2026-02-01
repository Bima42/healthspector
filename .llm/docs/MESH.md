## Mesh Targeting System

**Overview**  
The mesh system lets you programmatically place pain pins at the center of named body‑part meshes (`hand-right`, `hand-left`, `foot-right`, `foot-left`) without requiring the user to click the 3D model.

---

### Flow

1. **Trigger**: Set `targetMesh` state to a mesh name (e.g., `"hand-right"`).
2. **Lookup**: `HumanModel` traverses the GLTF scene to find the matching mesh by `child.name`.
3. **Position calculation**: Computes the mesh's bounding‑box center in world coordinates.
4. **Callback**: Calls `onMeshPositionFound(position)` with `[x, y, z]`.
5. **Dialog open**: `BodyViewer.handleModelClick` receives the position and opens `AddPinDialog`.
6. **Cleanup**: `targetMesh` is reset to `null` after callback fires.

---

### How to add a mesh-targeting button

```tsx
<button
  onClick={() => setTargetMesh("foot-left")}
>
  Add pin on left foot
</button>
```

**Available mesh names:**  
`hand-right` · `hand-left` · `foot-right` · `foot-left`

---

### Key props and functions

| Prop / Function         | Component     | Purpose                                      |
|-------------------------|---------------|----------------------------------------------|
| `targetMesh`            | `HumanModel`  | Mesh name to locate; triggers search        |
| `onMeshPositionFound`   | `HumanModel`  | Callback with `[x, y, z]` when mesh found   |
| `setTargetMesh(name)`   | `BodyViewer`  | Initiate mesh targeting                      |
| `handleModelClick(pos)` | `BodyViewer`  | Opens dialog; shared for clicks and lookups |

---

### Notes

- Mesh names must exactly match those in the GLTF file (case‑sensitive).
- Position is the bounding‑box center, not surface point.
- `targetMesh` resets immediately after callback to prevent re-triggering.
- If mesh not found, nothing happens (no error shown).
