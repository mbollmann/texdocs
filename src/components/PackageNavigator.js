import React from 'react';
import {
  Row, Col,
  Label, Input,
  ListGroup, ListGroupItem
} from "reactstrap";
import {
  Star, StarFill, CaretRight, RecordCircle
} from "react-bootstrap-icons";

function intersect(setA, listB) {
  const _intersection = new Set();
  for (const elem of setA) {
    if (listB.indexOf(elem) > -1) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

function difference(listA, setB) {
  let _difference = [...listA];
  for (const elem of setB) {
    const idx = _difference.indexOf(elem);
    if (idx > -1) {
      _difference.splice(idx, 1);
    }
  }
  return _difference;
}

const ResultListItems = (props) => {
  return <>
    <h6
      className="d-block px-3 py-1 my-0
                 text-uppercase lh-base
                 text-muted bg-light border
                 user-select-none"
      style={{fontSize: '88%'}}
    >
    {props.heading}
    </h6>
    <ListGroup className="texdocs-package-list" flush>
      {props.listItems}
    </ListGroup>
    </>;
};

const PackageListItem = (props) => {
  const name = "name" in props.data ? props.data["name"] : props.data["key"];
  const isFavorite = Boolean(props.data["favorite"]);

  return <>
    <a
      className="flex-grow-1 lh-lg"
      href="#"
      onClick={(e) => {e.preventDefault(); props.callbackSelect(props.idx)}}
    >
      {name}
    </a>
    {props.data.loaded &&
      <span className="text-success px-1 lh-lg"><RecordCircle /></span>}
    <a
      className="px-1 lh-lg"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        props.callbackFavorite(props.idx, !isFavorite);
      }}
    >
      {isFavorite ? <StarFill /> : <Star />}
    </a>
    <a
      className="ps-1 pe-0 lh-lg"
      href="#"
    >
      <CaretRight />
    </a>
  </>;
};

class PackageNavigator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      displayedPackages: [],
    };

    this.updateSearchValue = this.updateSearchValue.bind(this);
  }

  updateSearchValue(event) {
    const searchValue = event.target.value;
    this.setState({searchValue: searchValue});
    if (searchValue.length > 0) {
      const results = this.props.searchIndex.search(searchValue);
      this.setState({
        displayedPackages: results
      });
    } else {
      this.setState({displayedPackages: []});
    }
  }

  renderListItems(packageList, isSearch) {
    const listItems = [];
    for (var idx of packageList) {
      const this_idx = idx;
      const data = this.props.packageData[idx];
      const listGroupItemClass = (
        "d-flex justify-content-between " +
        "align-items-center py-0 border-0 " +
        (this_idx === this.props.selectedPackage ?
          "list-group-item-primary" : "")
      );

      listItems.push(
        <ListGroupItem
          className={listGroupItemClass}
          key={data['key']}
          >
            <PackageListItem
              callbackSelect={this.props.callbackSelect}
              callbackFavorite={this.props.callbackFavorite}
              idx={this_idx}
              data={data}
            />
        </ListGroupItem>
      );
    }

    if (isSearch && listItems.length == 0) {
      listItems.push(
        <ListGroupItem disabled={true} key="0">
          <span className="fst-italic fw-light">Start typing to find packages.</span>
        </ListGroupItem>
      );
    }

    return listItems;
  }

  render() {
    const favoriteListItems = this.renderListItems(
      this.state.searchValue.length > 0 ?
        intersect(this.props.favoritePackages, this.state.displayedPackages) :
        this.props.favoritePackages
    );
    const loadedListItems = this.renderListItems(
      difference(
        this.state.searchValue.length > 0 ?
          intersect(this.props.activePackages, this.state.displayedPackages) :
          this.props.activePackages,
        this.props.favoritePackages
      )
    );
    const activeListItems = favoriteListItems.concat(loadedListItems);
    const displayedPackages = difference(
      difference(
        this.state.displayedPackages, this.props.activePackages
      ),
      this.props.favoritePackages
    );
    const searchListItems = this.renderListItems(displayedPackages, true);

    return <>
    <Row
      className="gx-0 position-sticky"
      style={{top: 0, left: 0, zIndex: 1020}}
    >
      <Col
        xs={{ size: 12 }}
        className="bg-secondary py-2 px-3 px-sm-1 px-md-2"
        >
          <Label
            className="visually-hidden"
            for="packageSearch"
          >
            Search term
          </Label>
          <Input
            id="packageSearch"
            name="search"
            placeholder="Search..."
            type="text"
            autoComplete='off'
            value={this.state.searchValue}
            onChange={this.updateSearchValue}
            disabled={this.props.packageData.length == 0}
          />
      </Col>
    </Row>

    <Row className="gx-0">
      <Col
        xs={{ size: 12 }}
        className="bg-light"
        >
          <ResultListItems heading="Active Packages" listItems={activeListItems} />
          <ResultListItems heading="Search Results" listItems={searchListItems} />
      </Col>
    </Row>
    </>;
  }
}

export default PackageNavigator;
