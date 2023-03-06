import json
import os
import requests
from rich import print
from rich.progress import track
import time

CTAN_API = "http://www.ctan.org/json/2.0"

class PackageList:
    def __init__(self, datafile):
        self._datafile = datafile
        self.packages = {} # package key: package info
        self.load_datafile()

    def load_datafile(self):
        if not os.path.exists(self._datafile):
            return False
        with open(self._datafile, "r") as f:
            self.packages = json.loads(f.read())
            return True

    def save_datafile(self):
        with open(self._datafile, "w") as f:
            f.write(json.dumps(self.packages))

    def fetch_package_details(self, package):
        r = requests.get("".join([
            "http://www.ctan.org/json/2.0/pkg/",
            package,
            "?drop=announce,author,bugs,copyright,description,",
            "development,install,miktex"
        ]))
        r.raise_for_status()
        return r.json()

    def update_list(self, verbose=True):
        r = requests.get(f"{CTAN_API}/packages")
        r.raise_for_status()
        packages = r.json()
        if verbose:
            print(f"Found {len(packages)} packages on CTAN.")
        if self.packages:
            old_keys = set(self.packages.keys())
            new_keys = set(value["key"] for value in packages)
            for deleted_pkg in (old_keys - new_keys):
                del self.packages[deleted_pkg]
            for value in packages:
                key = value.pop("key")
                if key in self.packages:
                    self.packages[key].update(value)
                else:
                    self.packages[key] = value
        else:
            self.packages = {pkg.pop("key"): pkg for pkg in packages}

    def update_package(self, key):
        details = self.fetch_package_details(key)
        self.packages[key].update(details)
        self.packages[key]["last_updated"] = time.strftime("%Y/%m/%d")
        for alias in details.get("aliases", []):
            if "name" in alias and alias["name"] in self.packages:
                self.packages[alias["name"]].update(details)
                self.packages[alias["name"]]["last_updated"] = time.strftime("%Y/%m/%d")

    def update_all_packages(self, verbose=True):
        if not self.packages:
            self.update_list()

        # Which packages need to be fetched?
        # -- currently doesn't look at "last_updated", but could
        to_be_fetched = []
        for key, values in self.packages.items():
            if "license" in values or "documentation" in values:
                continue
            to_be_fetched.append(key)

        if not to_be_fetched:
            if verbose:
                print(f"All package information up-to-date!")
            return
        elif verbose:
            print(f"Fetching package information...")

        num_requests = 0
        for key in track(to_be_fetched):
            try:
                self.update_package(key)
            except Exception:
                print(f"[bold red]Couldn't fetch info for package '[purple]{key}[/]'")
                continue
            num_requests += 1
            if num_requests % 50 == 0:
                time.sleep(1)
