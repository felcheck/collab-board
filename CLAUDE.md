You are an expert developer who writes full-stack apps in InstantDB, Next.js, and Tailwind developer. However InstantDB is not in your training set and you are not familiar with it.

Before generating a new next app you check to see if a next project already exists in the current directory. If it does you do not generate a new next app.

If the Instant MCP is available use the tools to create apps and manage schema.

Before you write ANY code you read ALL of instant-rules.md to understand how to use InstantDB in your code.

---

## Product Requirements Document

### Collaborative Whiteboard App

**Purpose**
Deliver a real-time collaborative whiteboard experience that enables distributed teams to brainstorm, plan, and visualize ideas together. The app should feel lightweight, responsive, and intuitive—similar to FigJam or Miro—with core functionality that emphasizes seamless multi-user collaboration and minimal friction to getting started.

#### User Flow

**Authentication**
- On launch, users see a simple landing screen with "Create Room" or "Join Room" options
- Authentication via magic link using InstantDB's built-in auth
- User enters email → receives magic link → clicks link → authenticated and routed to board
- After authentication, user can create a new board or access recently viewed boards

**Board/Room Management**
- Each board has a unique shareable URL (e.g., /board/abc123)
- Users can invite others by sharing the URL
- Board loads with infinite canvas (pan/zoom capabilities)
- Persistent board state—everything saves automatically in real-time via InstantDB

**Core Board Interactions**

*Sticky Notes:*
- Double-click anywhere on canvas to create a new sticky note
- Click to select, drag to move
- Double-click to edit text
- Delete via keyboard (Delete/Backspace) or right-click context menu
- Color options (yellow, pink, blue, green, purple) via toolbar or right-click
- Auto-resize based on content

*Shapes:*
- Toolbar with basic shapes: rectangle, circle, triangle, line, arrow
- Click shape tool → click/drag on canvas to draw
- Shapes can be moved, resized, and deleted like sticky notes
- Color and stroke options available

*Collaboration Indicators:*
- Live cursors showing other users' pointers with name labels
- Online user list in top-right corner (avatars/initials)
- Color-coded selection highlights when users select objects
- Presence indicators update in real-time as users join/leave via InstantDB presence

**Session Management**
- User profile dropdown (top-right) with sign-out option
- "Board settings" option to rename board or manage access

#### Core Functionalities (7):
1. **Magic Link Authentication** - Passwordless email-based login using InstantDB auth for frictionless access
2. **Real-time Collaborative Canvas** - Infinite whiteboard where multiple users work simultaneously, synced via InstantDB
3. **Sticky Note CRUD** - Create, edit, delete, and freely position sticky notes with color options
4. **Shape Drawing** - Basic geometric shapes (rectangles, circles, lines, arrows) for diagramming
5. **Live Presence** - See who's online with live cursors, name labels, and user list via InstantDB presence
6. **Persistent Board State** - All changes auto-save and sync across all connected users through InstantDB
7. **Pan/Zoom Navigation** - Smooth canvas navigation for working at any scale

#### Stretch Features (Future Iterations)
- Text boxes and rich text formatting
- Image uploads and embedding
- Connectors/arrows that snap to objects
- Templates (flowcharts, wireframes, kanban boards)
- Comments and reactions on objects
- Version history / undo-redo stack
- Export to PNG/PDF
- Board permissions (view-only vs. edit access)
- Keyboard shortcuts
- Mobile touch optimizations
- Voice/video chat integration

#### Look & Feel
**Material You Expressive Design System**
- Dynamic color theming with vibrant, harmonious palettes
- Rounded corners and soft shadows for depth
- Fluid animations and motion design
- Emphasis on personalization and expressiveness
- High contrast, clear visual hierarchy
- Smooth, playful micro-interactions
- Responsive across desktop and tablet (mobile as stretch goal)
- Minimal UI chrome—tools appear contextually with Material elevation

#### Build Approach

**Frontend:** Next.js 14+ (App Router) + React (TypeScript)
- Canvas rendering with HTML5 Canvas or SVG
- Real-time state management with InstantDB React hooks
- Cursor tracking and presence via InstantDB presence API
- Material Design 3 components (use Material UI or custom implementation)

**Backend/Database:** InstantDB
- Real-time collaborative data sync
- Built-in authentication (magic links)
- Presence API for live cursors and online users
- Reference:
  - Tutorial: https://www.instantdb.com/tutorial
  - Docs: https://www.instantdb.com/docs
  - Auth: https://www.instantdb.com/docs/auth
  - Presence: https://www.instantdb.com/docs/presence

**Schema Design (InstantDB):**
- boards: { id, name, createdBy, createdAt }
- stickyNotes: { id, boardId, content, x, y, color, createdBy, updatedAt }
- shapes: { id, boardId, type, x, y, width, height, color, createdBy, updatedAt }
- boardMembers: { boardId, userId, role, joinedAt }

**Deployment:** Vercel
- Automatic deployments from GitHub main branch
- Preview deployments for pull requests
- Edge functions for optimal performance
- Environment variables for InstantDB app ID and keys

#### Development Workflow
1. Write code in VS Code
2. Use Claude CLI (claude-code) in terminal for assisted development
3. Push code to GitHub
4. Automatic deployment to Vercel on push
5. Monitor with Vercel Analytics
6. Testing: Jest + React Testing Library for component tests, E2E tests for collaboration features

#### Technical Implementation Details

**InstantDB Integration:**
- Initialize InstantDB client in app with app ID
- Use useQuery for reading board/sticky/shape data
- Use transact for creating, updating, deleting objects
- Use usePresence for live cursor positions and online users
- Use InstantDB auth for magic link flow

**Performance Optimizations:**
- Virtualize canvas rendering for boards with 500+ objects
- Debounce position updates during drag operations
- Use InstantDB's optimistic updates for instant feedback
- Implement viewport culling to only render visible objects

**Conflict Resolution:**
- InstantDB handles real-time sync and conflicts automatically
- Last-write-wins strategy for position updates
- Optimistic UI updates with server reconciliation

#### Success Metrics
- **Latency:** Object creation/movement reflects across all users within <100ms (InstantDB target)
- **Reliability:** 99%+ uptime for real-time sync
- **Collaboration Quality:** Users can see each other's presence 100% of the time when online
- **Engagement:** Average session length >10 minutes
- **Retention:** 60%+ of users return within 7 days to view or edit boards
- **Performance:** Page load <2s, canvas interactions <16ms for 60fps

#### Development Phases

**Phase 1: Core Infrastructure (Week 1)**
- Next.js app setup with InstantDB
- Magic link authentication
- Basic board creation and navigation

**Phase 2: Sticky Notes (Week 1-2)**
- Sticky note CRUD operations
- Drag and drop functionality
- Color options

**Phase 3: Collaboration (Week 2)**
- Live presence with cursors
- Online user list
- Real-time sync testing

**Phase 4: Shapes & Polish (Week 3)**
- Shape drawing tools
- Material You design refinements
- Performance optimization