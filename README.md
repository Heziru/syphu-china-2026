# Team SYPHU-China 2026 Wiki

This repository uses `TypeScript` and `React` to manage the wikis.

This repository **MUST** contain all coding assets to generate your team's wiki
(HTML, CSS, JavaScript, TypeScript, Python, etc).

Images, photos, icons and fonts **MUST** be stored on `static.igem.wiki` using
[the uploads tool](https://teams.igem.org/go/deliverables/wiki/uploads), and Videos **must** be embedded
from [iGEM Video Universe](https://video.igem.org); see [the Video & Audio page](https://teams.igem.org/go/deliverables/wiki/videos-and-audios) for guidance on adding video and audio.

**Everything your wiki loads (CSS, JavaScript, fonts, images) must be served from
iGEM infrastructure.** Do not link to external or third-party CDNs (for example
Google Fonts, jsDelivr, cdnjs) — upload the files you need via
[the uploads tool](https://teams.igem.org/go/deliverables/wiki/uploads) and reference them from `static.igem.wiki`
instead.

For up-to-date requirements, resources, help and guidance, visit
[teams.igem.org/go/deliverables/wiki](https://teams.igem.org/go/deliverables/wiki).

> **Using an AI assistant (e.g. Claude Code)?** Please read
> [.claude/RESPONSIBLE_AI_USE.md](.claude/RESPONSIBLE_AI_USE.md) first. You remain
> fully responsible for everything you publish: never fabricate scientific
> results, data, or citations.

## Getting Started

### Development and official publishing

- Development repository: https://github.com/Heziru/syphu-china-2026
- Official repository: https://gitlab.igem.org/2026/syphu-china
- Official website: https://2026.igem.wiki/syphu-china/

The local `origin` remote points to GitHub; `igem` points to the official GitLab
repository. GitHub Pages is a preview. Publishing the official wiki requires a
successful push to GitLab `main`, followed by a successful `pages` pipeline.

```bash
npm run build
git push origin main
git push igem main
```

On a new clone, add the official remote once:

```bash
git remote add igem https://gitlab.igem.org/2026/syphu-china.git
```

Authenticate Git separately from the browser, using an authorized iGEM GitLab
account and a valid repository write credential. Keep credentials out of source
files and remote URLs. Fetch both remotes before publishing and merge changes;
do not force-push over another team member's work.

The GitLab build uses the official `/syphu-china/` base path; the GitHub preview
sets its own base in `.github/workflows/deploy-pages.yml`. Verify Home and a
direct Team page refresh after the official pipeline completes. The generated
`public/_redirects` covers both the project-prefixed and root proxy paths.

Before the competition submission, migrate image assets currently in `public`
to the team's official Uploads storage (`static.igem.wiki`) and update their
references, as required by the wiki hosting instructions above.

Before refactoring the code of this template to suit your wiki needs, please make sure you have the ability to use React
for web development.

1. Clone the repository:
   ```bash
   git clone https://gitlab.igem.org/2026/syphu-china
   cd syphu-china
   ```
2. Install the dependencies:

   ```bash
   yarn install
   ```

   ### Important:

   Ensure you are using Node.js version `>=20.19.0` (Node 22 LTS recommended) to avoid compatibility issues.
   You can check your Node version by running `node -v` in your terminal.

3. Start the development server:
   ```bash
   yarn run dev
   ```
4. Navigate to the files you wish to edit:
   - The main App component can be found under `src/containers/App`
   - Pre-built components are located under `src/components`
   - Individual pages can be modified in the `src/pages.ts`
   - Content pages can be updated in the `src/contents`
5. Once you are done, save the changes by **committing** them to the _main branch_ of the repository
6. An automated script will build, test and deploy your wiki to the iGEM server

## About This Template

### Files

Below is the structure of important files and directories in this project:

    ├── README.md            -> The file you are currently reading
    ├── index.html           -> Single HTML file for the wiki
    ├── package.json         -> Manages project metadata and dependencies
    ├── src/
    │   ├── components/      -> Pre-built components(like Navbar, Footer, etc.)
    │   ├── containers/
    │   │   └── App/         -> Main React application container
    │   ├── contents/
    │   │   └── *.tsx        -> Page components for the wiki
    │   ├── main.tsx         -> Entry point of the wiki application
    │   ├── pages.ts         -> Page definition and path mapping
    │   ├── utils/           -> Utility functions
    │   └── vite-env.d.ts    -> TypeScript definitions for Vite
    ├── tsconfig.json        -> Configures TypeScript options
    ├── tsconfig.node.json   -> TypeScript settings for Node.js
    ├── vite.config.ts       -> Configuration for the Vite tool
    └── yarn.lock            -> Yarn lock file for dependency management

### Technologies

- [React](https://reactjs.org): A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org): Extends JavaScript by adding types
- [Vite](https://vitejs.dev): Frontend tooling that provides faster and leaner development builds
- [Bootstrap](https://getbootstrap.com): Framework for building responsive, mobile-first sites
- [React Bootstrap](https://react-bootstrap.github.io): Bootstrap components built with React
- [React Router](https://reactrouter.com): Declarative routing for React applications
- (Optional) [Prettier](https://prettier.io): Code formatter
