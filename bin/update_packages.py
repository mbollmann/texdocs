#!/usr/bin/python
"""Usage: update_packages.py [options]

Updates packages and their documentation from CTAN.

Options:
  -h, --help               Show this helpful message.
"""

from collections import defaultdict
from docopt import docopt
import json
import os
from rich import print

from CTAN import PackageList

SCRIPTDIR = os.path.dirname(os.path.realpath(__file__))
PACKAGE_FILE = f"{SCRIPTDIR}/../ctan-packages.json"
APPDATA_FILE = f"{SCRIPTDIR}/../public/pkg-docs.json"

def analyze_package_list(ctan):
    categories = defaultdict(list)
    pkg_with_docs = []

    for key, package in ctan.packages.items():
        if not len(package.get("documentation", [])):
            categories["No documentation"].append(key)
            continue

        docs = []
        for documentation in package["documentation"]:
            if "href" not in documentation:
                continue
            if documentation.get("language", "xx") is None:
                if documentation.get("details") != "Package documentation":
                    continue
            elif documentation.get("language", "xx") != "en":
                continue
            if not documentation["href"].endswith(".pdf"):
                continue

            docs.append(documentation.get("href"))

        # if not docs and len(package["documentation"]) == 1:
        #     if "href" in package["documentation"][0]:
        #         docs.append(package["documentation"][0].get("details"))

        if len(docs) == 0:
            categories["No English documentation"].append(key)
        else:
            info = {
                'key': key,
                'caption': package["caption"],
                'href': docs[0],
            }
            if package['name'] != key:
                info['name'] = package['name']
            pkg_with_docs.append(info)
            if len(docs) > 1:
                categories["Multiple documentations"].append(key)
            else:
                categories["Exactly one (English) documentation"].append(key)

    print()
    for category, packagelist in categories.items():
        print(f"{category:35s} – {len(packagelist):>5d}")
        examples = packagelist[:50]
        if len(packagelist) > 50:
            examples.append("...")
        print(", ".join(examples))
        print()

    return pkg_with_docs


if __name__ == "__main__":
    args = docopt(__doc__)

    ctan = PackageList(PACKAGE_FILE)
    ctan.update_list()

    try:
        ctan.update_all_packages()
    finally:
        # save progress, even if the script is interrupted
        ctan.save_datafile()

    pkg_with_docs = analyze_package_list(ctan)
    with open(APPDATA_FILE, "w") as f:
        f.write(json.dumps(pkg_with_docs))
