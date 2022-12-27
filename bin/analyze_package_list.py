#!/usr/bin/python

from collections import defaultdict
import json
import os
from rich import print

PACKAGE_FILE = "ctan-packages.json"

if __name__ == "__main__":
    if not os.path.exists(PACKAGE_FILE):
        print(f"[bold red]Error: [purple]{PACKAGE_FILE}[/] not found![/]")

    with open(PACKAGE_FILE, "r") as f:
        packages = json.loads(f.read())

    categories = defaultdict(list)
    pkg_with_docs = []

    for key, package in packages.items():
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

    for category, packagelist in categories.items():
        print(f"{category:35s} – {len(packagelist):>5d}")
        examples = packagelist[:50]
        if len(packagelist) > 50:
            examples.append("...")
        print(", ".join(examples))
        print()

    with open("pkg-docs.json", "w") as f:
        f.write(json.dumps(pkg_with_docs))
