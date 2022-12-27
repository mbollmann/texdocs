#!/usr/bin/python

import json
import os
import requests
from rich import print
from rich.progress import track
import time

PACKAGE_FILE = "ctan-packages.json"

def request_package_list():
    r = requests.get(
        "http://www.ctan.org/json/2.0/packages"
    )
    r.raise_for_status()
    return r.json()


def request_package_info(name):
    r = requests.get("".join([
        "http://www.ctan.org/json/2.0/pkg/",
        name,
        "?drop=announce,author,bugs,copyright,description,",
        "development,install,miktex"
    ]))
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    packages = {
        value.pop("key"): value
        for value in request_package_list()
    }
    print(f"Found {len(packages)} packages.")

    if os.path.exists(PACKAGE_FILE):
        with open(PACKAGE_FILE, "r") as f:
            saved = json.loads(f.read())
        for key, values in packages.items():
            saved_values = saved.get(key, {})
            saved_values.update(values)
            values.update(saved_values)

    num_requests = 0
    for key, values in track(packages.items(), total=len(packages)):
        if "license" in values or "documentation" in values:
            continue

        try:
            details = request_package_info(key)
        except:
            print(f"[bold red]Couldn't fetch info for package '[purple]{key}[/]'")
            continue
        values.update(details)

        for alias in details.get("aliases", []):
            if "name" in alias and alias["name"] in packages:
                packages[alias["name"]].update(
                    details
                )

        if num_requests % 50 == 0:
            time.sleep(1)

    with open(PACKAGE_FILE, "w") as f:
        f.write(json.dumps(packages))
