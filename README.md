# MeiliSearch Manager (meili-manager)

This is Meili-Manager, a Quasar app built to help manage your Meilisearch instance(s).
You can run this locally or hosted. Currently the demo is at [https://meili-manager.vercel.app/#/](https://meili-manager.vercel.app/#/)

Full readme below the quickstart.

# Quick start

## Install the dependencies

```bash
yarn
# or
npm install
```

```bash
yarn
# or
npm install -g @quasar/cli
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

# Overview

## What is this

This is Meili-Manager, a Quasar app built to help manage your Meilisearch instance(s).
You can run this locally or hosted. Currently the demo is at [https://meili-manager.vercel.app/#/](https://meili-manager.vercel.app/#/)

## Dependancies

The `npm install` step should install everything you need, but certain packages are important to mention.
Critical to this app's function are

- [Vue InstantSearch](https://github.com/algolia/vue-instantsearch/)
- [Meilisearch Vue](https://github.com/meilisearch/meilisearch-vue)
- [Meilisearch JS](https://github.com/meilisearch/meilisearch-js#-documentation)
- [vue3-ts-jsoneditor](https://github.com/bestkolobok/vue3-jsoneditor)
- [Quasar CLI](https://quasar.dev/start/quasar-cli#installation-project-scaffolding) to install project w/vue3 vite js

---

## Features

_No more manual API calls to change settings_

- Indexes
  - List, Create, Edit, Delete
  - Statistics and status
- Settings
  - Per index, full settings object available to edit
  - Intuitive web form rather than raw JSON
- Search
  - Interactive Vue instantsearch widgets in each index view
    - Stats
    - Search Query
    - Sort Options
    - Filters
    - Refinements
    - Hits
- Keys
  - Create, edit, update, and delete API keys
- Tasks
  - View and search through the latest 1000 tasks in real time

---

## Installation

To install you can follow the quickstart above, or host this app on the service of your choice. The demo is hosted on vercel, with the following settings:

- Build Command : `quasar build`
- Output Directory : `dist/spa`

You can also follow the quasar docs to compile this app for the platform of your choosing:

- [Mobile](https://quasar.dev/quasar-cli-webpack/developing-mobile-apps)
  - iOS or Android via Cordova or Capacitor
- [Desktop](https://quasar.dev/quasar-cli-webpack/developing-electron-apps/introduction)
  - Uses Electron

---

## Customization

PLEASE fork this and make it your own. I make no promises to maintain this over the years.
All you need are vue3 (And all that implies) and the quasar docs to customize this. I will be making some videos about this app to help summarize.

Vue Instantsearch is used heavily when viewing results. See [their showcase](https://www.algolia.com/doc/guides/building-search-ui/widgets/showcase/vue/) for all the things.

---

## Sidebar settings

### Credentials

By clicking the hamburger button in the top left, or bottom left, you can expand the sidebar settings.

Your Index url needs to be in the form of https://myIndex.com - This can be local.
You API key will require the `indexes.get` and `document.get` permissions at the least to work with this tool. I recommend making a key with most permissions for a short time while you configure to your liking, then let it expire in favor of more strict keys.

Once submitted, a notification will display if any serious errors occured. If you don't immediately see a list of indexes, then your permissions aren't wide enough or your credentials are incorrect.

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
