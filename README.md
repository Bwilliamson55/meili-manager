# Meili-Manager

A Quasar application for managing multiple Meilisearch instances across development, staging, and production environments.

**Version**: 2.0.0
**Demo**: [https://meili-manager.vercel.app](https://meili-manager.vercel.app)

## Quick Start

## Install the dependencies

```bash
npm install
npm install -g @quasar/cli
```

### Development

```bash
quasar dev
```

### Production Build

```bash
quasar build
```

Output: `dist/spa/`

### Changelog

Generate changelog from git history:

```bash
npm run build-changelog
```

Generates `changelog.json` with versioned entries grouped by ISO week. The changelog is automatically generated and deployed with each release to GitHub Pages.

### Code Quality

```bash
npm run lint
npm run format
```

## Core Features

### Multi-Instance Management

Save and switch between multiple Meilisearch instances (development, staging, production). Credentials are persisted locally with automatic connection validation.

### Index Operations

- List, create, edit, and delete indexes
- View statistics and field distribution
- Configure all index settings through an intuitive interface
- Interactive search with Vue InstantSearch widgets

### Document Management

- Browse and search documents with advanced filters
- Edit documents using a full-featured JSON editor
- Add new documents with validation

### API Key Management

- Create and manage API keys with granular permissions
- Update and delete existing keys
- View all keys with detailed information

### Task Monitoring

- View the latest 1000 tasks in real-time
- Sort and search through task history
- View detailed error information for failed tasks

### Preview Mode (Experimental)

- Create custom search previews with configurable UI
- Save multiple preview configurations
- Independent instance/index selection per preview

## Key Dependencies

- **meilisearch** - JavaScript client for Meilisearch API
- **@meilisearch/instant-meilisearch** - Adapter for Vue InstantSearch
- **vue-instantsearch** - Search UI components
- **vue3-ts-jsoneditor** - JSON editor for document editing
- **jose** - JWT encoding for preview sharing
- **pinia** + **pinia-plugin-persistedstate** - State management with persistence
- **Quasar Framework** - Vue 3 UI framework
- **Tailwind CSS** - Utility-first CSS framework (v4)

## Architecture

### Centralized Client Management

All Meilisearch client creation goes through `settings-store.js`, providing:

- Automatic connection validation
- Client caching for performance
- Consistent error handling across all components
- Safe instance switching with validation

### Named Router Views

The application uses dual router views for flexible layouts:

- `main` - Primary page content
- `side` - Contextual sidebar content

This allows pages to control both the main view and sidebar independently.

### State Management

- **settings-store.js** - Instance credentials, active client, connection state
- **preview-store.js** - Preview configurations with tokenization support

---

## Deployment

### Vercel (Recommended)

- Build Command: `quasar build`
- Output Directory: `dist/spa`

### Other Platforms

The application builds as a static SPA and can be hosted on any static file server.

### Native Applications

Quasar supports building for:

- **Mobile**: iOS/Android via Cordova or Capacitor
- **Desktop**: Windows/macOS/Linux via Electron

See [Quasar documentation](https://quasar.dev) for platform-specific build instructions.

## Customization

Fork this repository and adapt to your needs. The codebase uses Vue 3 Composition API with Quasar components and Tailwind utilities.

Key customization points:

- `src/stores/settings-store.js` - Modify client management logic
- `src/pages/` - Add new pages or modify existing ones
- `src/components/` - Reusable components
- `src/utils/notifications.js` - Centralized notification patterns
- `generateChangelog.cjs` - Customize changelog generation logic

**Styling**: Uses Tailwind CSS v4 for utility-first styling. All components use Tailwind utilities (e.g., `p-4`, `mt-2`) while retaining Quasar's Q\* components for complex UI elements.

---

## Getting Started

### Adding Your First Instance

1. Open the sidebar (hamburger menu, top-left or bottom-left)
2. Enter instance details:
   - **Label**: Descriptive name (e.g., "Production")
   - **URL**: Meilisearch endpoint (https://example.com or http://localhost:7700)
   - **API Key**: Master key or admin key with sufficient permissions

3. Click "Add Instance"

The connection is validated before the instance is saved. If validation fails, check your URL and API key.

### Required Permissions

Minimum permissions for basic functionality:

- `indexes.get`
- `documents.get`

For full functionality (creating indexes, managing keys, etc.), use a master key or admin key. Create more restrictive keys once configuration is complete.

### Endpoints/Methods used

- [getVersion](https://github.com/meilisearch/meilisearch-js#version-)

---

## Home page / Index list page

### Data shown in the list

Here you will see a list of your indexes with their created and updated time stamps, a button to examine each, and a button to delete each.

The delete icon will give a warning that needs confirmation before it sends the delete call.

### Endpoints/Methods used

- [getRawIndexes](https://github.com/meilisearch/meilisearch-js#get-all-indexes)
- [createIndex](https://github.com/meilisearch/meilisearch-js#create-a-new-index)
- [deleteIndex](https://github.com/meilisearch/meilisearch-js#delete-index)

---

## Index detail page

### Top Card

#### Overview Tab

In the overview tab you can see the results of the `getStats` endpoint in a friendly way.

- Count of records in the index
- Primary key of the index if set
- Indexing true/false
- Field Distribution table

_The table is limited to 1000 fields_

#### Settings Tab

In the settings tab you can review and update all of the settings about an index. The settings object is displayed in full (And real time) if you expand the `Raw Settings JSON` section at the top. This is a read only view, but may be easier to understand at first than the full form.

Pleasepleaseplease follow the link there for the settings documentation- each field has it's own purpose that needs to be understood.

While the form is stored in your local memory- it is not pushed to your meilisearch instance until you press the **"Submit"** button, for safety.

### Instant Search demo area

Below the top card you can interact with the index documents.
There is a "New" button to create an example document. **_This is not the recommended way to add documents._**

The statistics shown are produced from the Vue Instantsearch components.

The search query is a default Vue Instantsearch component pointed at the current index.

The sort options are derived from the attributes in the `sortable attributes` setting.

The current refinements area will display any filters selected.

Between the refinements and the document list, there is a dynamic filter area. Whatever attributes you have in your `filterable attributes` will be displayed here as simple default filter widgets.

### Result Cards

Each card header displays the documents "name" field value, if present, and an "EDIT" button.

The edit button will take you to a full featured JSON editor, just as creating a new record would. Any incorrect json data will be rejected, and the form reloaded.

The body of the cards will display an image, and the fields of the document in a table. Any nested or complex fields will be shown as a JSON string. Use the "EDIT" button to better examine complex documents.

The image displayed will be assumed to be a URL in a one of three fields (First one populated is used):

- picture_url
- image
- image_url

  Change this to your needs in your fork.

### Endpoints/Methods used

- [index](https://github.com/meilisearch/meilisearch-js#using-the-index-object-1)
- [getStats](https://github.com/meilisearch/meilisearch-js#get-specific-index-stats)
- [getSettings](https://github.com/meilisearch/meilisearch-js#get-settings)
- [fetchPrimaryKey](https://github.com/meilisearch/meilisearch-js#get-primary-key-of-an-index)
- [updateSettings](https://github.com/meilisearch/meilisearch-js#update-settings)
- [waitForTask](https://github.com/meilisearch/meilisearch-js#using-the-index)

---

## Document detail page

### Overview

The document detail page can update your documents via raw json. The json editor used has all the features you could ever need, including JMESpath query language. See [vue3-ts-jsoneditor](https://github.com/bestkolobok/vue3-jsoneditor) for full documentation.

### Endpoints/Methods used

- [index](https://github.com/meilisearch/meilisearch-js#using-the-index-object-1)
- [fetchPrimaryKey](https://github.com/meilisearch/meilisearch-js#get-primary-key-of-an-index)
- [getDocument](https://github.com/meilisearch/meilisearch-js#get-one-document)
- [addDocuments](https://github.com/meilisearch/meilisearch-js#add-or-replace-multiple-documents)
- [waitForTask](https://github.com/meilisearch/meilisearch-js#using-the-index)

---

## Keys page

### Overview

Similar to the settings tab, you can review the entire response of the `getKeys` endpoint by clicking the "Raw Keys JSON" button.

Below that is the "New Key Form" - all fields are required. The list of available actions is static, while the list of indexes is dynamic based on your key's permissions to use the getIndexes endpoints. Wildcards are not allowed here, but can be used via direct api calls.

**_Please review [the Keys documentation](https://docs.meilisearch.com/reference/api/keys.html) to fully understand the available settings._**

The first thing you should do with your master key is create an admin key with the minimum priveleges necessary!

### Endpoints/Methods used

- [getKeys](https://github.com/meilisearch/meilisearch-js#get-keys)
- [updateKey](https://github.com/meilisearch/meilisearch-js#update-a-key)
- [deleteKey](https://github.com/meilisearch/meilisearch-js#delete-a-key)
- [createKey](https://github.com/meilisearch/meilisearch-js#create-a-key)
- [getRawIndexes](https://github.com/meilisearch/meilisearch-js#get-all-indexes)

---

## Tasks page

### Overview

The tasks page shows you a paginated, sortable, searchable table of all of the tasks as of the page loading. This table is limited to the most recent 1000 tasks.

This page is a good way to review if an index is busy, or if a particular task failed/succeeded.

### Endpoints/Methods used

- [getTasks](https://github.com/meilisearch/meilisearch-js#get-all-tasks)

---

## Preview Mode

A more detail oriented preview with the eventual goal of being sharable.
Save as many preview configurations as you like and switch the index/instance powering them independently.

Settings currently available:

- Name (For load/save key locally)
- Pagination
- Pagination Size
- Show Refinements
- Show Clear refinements
- Attribute based options:
  - **_You can manually enter options by typing and pressing enter_**
    - **eg `attributeName.subProperty` is valid assuming subProperty exists**
  - Sortable Attributes
    - Auto generate asc and desc sort options based on attributes entered here
  - Facet/Filter Attributes
    - Auto generate filters based on attributes
      - Currently just `refinement-list` but the goal is to have more options per attribute for other filter types
  - Image Attributes
    - Treat the entered attributes as src/href for image(s) for each result
  - Heading Attributes
    - Show the attributes content above the content as H6's for each result
      - More control over this is on the road map
  - Description Attributes
    - Show the attributes content below the heading for each result
