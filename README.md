# TeXdocs

A web interface to quickly find and switch between TeX package documentation
from [CTAN](https://ctan.org/).

**This app is in alpha status.  Try at your own risk.**


## Development

This is a React app.  Install its dependencies with `npm install`, then run the
app via `npm start`.

### Obtaining a list of packages

The app needs a list of packages and their documentation URLs on
[CTAN](https://ctan.org/).  This list can be produced by running
`bin/updates_packages.py`.  This script will request a list of all packages
using CTAN's JSON 2.0 API, then request detailed package for each of them.

It should take about 30 minutes to populate the package list. The script can be
interrupted and resumed at any time. It will produce two files:

- The information obtained from CTAN is saved in `ctan-packages.json`.

- A list of packages and their documentation PDFs prepared for the React app is
  saved in `public/pkg-docs.json`.  In particular, the script will attempt to
  determine the primary English-language documentation file for packages that
  have more than one documentation file listed, and put this there.  This is a
  heuristic and not perfect.

The `ctan-packages.json` also contains a timestamp from when the package info
was last updated, but the script doesn't currently do anything with this
information.  It will only update removed or completely new packages on
subsequent runs.

### Displaying the package docs

Package documentation is currently shown by embedding an `<iframe>` from a
public CTAN mirror.  The URL of that mirror is currently hardcoded in
[`src/components/DocView.js`](https://github.com/mbollmann/texdocs/blob/main/src/components/DocView.js).
It does **not** use `mirrors.ctan.org` because not all mirrors are configured to
allow embedding in this way, and it's probably not an intended use -- for
running the app locally on one machine, this is probably fine, but a deployed
version of the app should likely come with its own mirror.


### TODOs

- [ ] Support multiple documentation files per package
- [ ] Package IDs should be stable across updates
- [ ] Support automatic downloading/updating of the relevant PDFs
