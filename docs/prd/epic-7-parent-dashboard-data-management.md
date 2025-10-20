# Epic 7: Parent Dashboard & Data Management

**Expanded Goal**: Provide parents with comprehensive visibility into their child's learning progress by creating a dashboard that displays word mastery status, session history, confidence scores, and basic analytics. Additionally, implement export and import functionality to allow parents to back up and restore their data. By the end of this epic, parents can monitor learning effectiveness, identify words needing attention, and safely manage their data.

## Story 7.1: Create Dashboard Page Layout

As a parent,
I want to navigate to a dedicated dashboard page,
so that I can view my child's spelling progress.

**Acceptance Criteria:**
1. A `/dashboard` route is created with main dashboard layout
2. Page is accessible from main navigation and home page
3. Dashboard is organized into sections: Overview, Word Mastery, Session History, Analytics
4. Layout is responsive with grid/card-based design
5. Page uses parent UX paradigm: clean, glanceable, professional
6. Empty state is shown if no game session data exists yet
7. Loading states are displayed while fetching data from IndexedDB
8. Page title and breadcrumbs clearly indicate "Progress Dashboard"

## Story 7.2: Display Word Mastery Overview

As a parent,
I want to see which words my child has mastered and which need more work,
so that I can understand their progress at a glance.

**Acceptance Criteria:**
1. Dashboard displays current active word list with mastery status for each word
2. Each word shows: name, confidence score (0-100%), mastery status (needs work/progressing/mastered)
3. Visual indicators: color coding (red <60%, yellow 60-80%, green >80%), progress bars
4. Words are sortable by: confidence (low to high), alphabetically, recently practiced
5. Summary stats displayed: X/Y words mastered, overall mastery percentage
6. If multiple word lists exist, user can switch between them to view different lists
7. Clicking a word shows detailed breakdown: games played, success rate, last practiced date
8. UI is glanceable and clearly communicates status without reading detailed numbers

## Story 7.3: Display Session History

As a parent,
I want to view a history of practice sessions,
so that I can track how often and how long my child practices.

**Acceptance Criteria:**
1. Dashboard includes "Session History" section showing recent sessions
2. Each session entry shows: date/time, duration, words practiced, games completed
3. Sessions are listed in reverse chronological order (most recent first)
4. Pagination or "Load More" if many sessions exist
5. Session entries are expandable to show detailed game-by-game results
6. Visual timeline or calendar view option shows practice frequency
7. Summary stats: total sessions, total practice time, average session length
8. Data is pulled from IndexedDB game results storage

## Story 7.4: Create Analytics Visualizations

As a parent,
I want to see charts and graphs of progress over time,
so that I can understand learning trends and effectiveness.

**Acceptance Criteria:**
1. Dashboard includes "Analytics" section with data visualizations
2. Charts display: confidence scores over time (line chart), mastery progress (stacked bar)
3. Learning style distribution chart shows detected preference (pie or bar chart)
4. Session frequency chart shows practice patterns (calendar heatmap or bar chart)
5. Charts use a simple charting library (Recharts or Chart.js)
6. Charts are responsive and render correctly on mobile
7. Data ranges are configurable: last week, last month, all time
8. Charts handle edge cases gracefully (insufficient data, no data)

## Story 7.5: Implement Data Export Functionality

As a parent,
I want to export all word lists and progress data to a file,
so that I can back up my child's learning data.

**Acceptance Criteria:**
1. Dashboard includes "Export Data" button
2. Export generates a JSON file containing: word lists, game results, confidence scores, story progress
3. Exported file is timestamped (e.g., `wordcraft-backup-2025-10-18.json`)
4. File download triggers automatically when export is clicked
5. Export includes data structure version for future compatibility
6. Exported data is human-readable JSON (formatted, not minified)
7. User sees confirmation message after successful export
8. Export handles large datasets gracefully (no browser freezing)

## Story 7.6: Implement Data Import Functionality

As a parent,
I want to import a previously exported data file,
so that I can restore my child's progress on a new device or after clearing browser data.

**Acceptance Criteria:**
1. Dashboard includes "Import Data" button
2. Button opens file picker allowing user to select a JSON backup file
3. System validates imported file structure and version compatibility
4. Import merges data with existing data (handles duplicates intelligently)
5. User is prompted to confirm before overwriting existing data
6. Success/error messages clearly communicate import results
7. Import handles errors gracefully: invalid files, corrupted data, version mismatches
8. After successful import, dashboard refreshes to show restored data

## Story 7.7: Add Dashboard Navigation and Polish

As a parent,
I want easy navigation between dashboard sections and the rest of the app,
so that I can quickly check progress and return to managing word lists.

**Acceptance Criteria:**
1. Dashboard has clear navigation to: word lists, create new list, start game session
2. "Back to Word Lists" and "Back to Home" links/buttons are prominently placed
3. Dashboard sections have clear headings and visual separation
4. Loading skeletons are shown while data loads (professional UX)
5. Transitions between sections are smooth
6. Mobile navigation uses tabs or collapsible sections for space efficiency
7. Dashboard state (selected word list, expanded sections) persists during session
8. Overall polish: consistent spacing, typography, colors matching app theme

## Story 7.8: Test Dashboard Functionality and Data Integrity

As a developer,
I want to validate that the dashboard accurately displays data and export/import work reliably,
so that parents can trust the information and safely manage their data.

**Acceptance Criteria:**
1. Integration tests verify dashboard loads data correctly from IndexedDB
2. Tests verify word mastery calculations match expected confidence scores
3. Tests verify session history displays correct game results
4. Tests verify analytics charts render with sample datasets
5. Tests verify export produces valid, complete JSON
6. Tests verify import correctly restores exported data
7. Manual testing confirms dashboard is accurate against known game session data
8. Edge case testing: empty data, corrupted files, quota limits

---
