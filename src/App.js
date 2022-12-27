import React from 'react';
import { Container, Row, Col } from "reactstrap";
import { Index } from 'flexsearch';

import history from "history/browser";

import DocView from "./components/DocView";
import PackageNavigator from "./components/PackageNavigator";

import './App.css';

const getData = async () => {
  const response = await fetch('pkg-docs.json',
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  return await response.json();
}

const buildSearchIndex = (data) => {
  var index = new Index({
    preset: "default",
    tokenize: "reverse",
    resolution: 9,
  });

  for (const [id, element] of data.entries()) {
    const name = "name" in element ? element["name"] : element["key"];
    index.add(id, name);
  }

  return index;
};

const HistorySetter = (props) => {
  let params = {};
  if (props.selectedPackage !== null) {
    params['pkg'] = props.selectedPackage;
  }
  if (props.favoritePackages.size > 0) {
    params['fav'] = Array.from(props.favoritePackages);
  }
  const paramString = new URLSearchParams(params).toString();

  if (paramString && history.location.search.slice(1) != paramString) {
    console.log("update: " + paramString);
    history.push(process.env.PUBLIC_URL + "/?" + paramString);
  }

  return <span className="d-none">{paramString}</span>;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      searchIndex: null,
      selectedPackage: null,
      activePackages: new Set(),
      favoritePackages: new Set(),
    };

    this.updateSelectedPackage = this.updateSelectedPackage.bind(this);
    this.updateFavoritePackage = this.updateFavoritePackage.bind(this);
  }

  componentDidMount() {
    getData().then((json) => {
      this.setState({
        data: json,
        searchIndex: buildSearchIndex(json)
      });

      const params = new URLSearchParams(history.location.search);
      if (params.has("pkg")) {
        this.setState((state, props) => {
          const idx = Number(params.get("pkg"));
          state.data[idx].loaded = true;

          return {
            data: state.data,
            activePackages: state.activePackages.add(idx),
            selectedPackage: idx
          }
        })
      }
      if (params.has("fav")) {
        this.setState((state, props) => {
          const favorites = params.get("fav").split(",");
          favorites.forEach((sidx) => {
            const idx = Number(sidx);
            state.data[idx].favorite = true;
            state.favoritePackages.add(idx);
          })

          return {
            data: state.data,
            favoritePackages: state.favoritePackages
          }
        })
      }
    });
  }

  updateSelectedPackage(idx) {
    this.setState({
      selectedPackage: idx,
    });

    if (idx !== null) {
      this.setState((state, props) => {
        state.data[idx].loaded = true;
        return {
          data: state.data,
          activePackages: state.activePackages.add(idx)
        };
      })
    }
  }

  updateFavoritePackage(idx, favorite) {
    if (favorite) {
      this.setState((state, props) => {
        this.state.data[idx].favorite = true;
        return {
          data: state.data,
          favoritePackages: state.favoritePackages.add(idx)
        }
      });
    } else {
      this.setState((state, props) => {
        this.state.data[idx].favorite = false;
        state.favoritePackages.delete(idx);
        return {
          data: state.data,
          favoritePackages: state.favoritePackages
        }
      });
    }
  }

  render() {
    const selectedPackage = (this.state.selectedPackage !== null) ?
      this.state.data[this.state.selectedPackage] : undefined;

    return <>
    <main>
      <HistorySetter
        selectedPackage={this.state.selectedPackage}
        favoritePackages={this.state.favoritePackages}
        />
      <Container fluid={true} className="gx-0 min-vh-100 vh-100">
        <Row className="gx-0">
          <Col
            xs={{ size: 12 }}
            sm={{ size: 4 }}
            lg={{ size: 2 }}
            tag="section"
            className="vh-100 mh-100 overflow-scroll
                       border-end"
          >
            <PackageNavigator
              packageData={this.state.data}
              searchIndex={this.state.searchIndex}
              selectedPackage={this.state.selectedPackage}
              activePackages={this.state.activePackages}
              favoritePackages={this.state.favoritePackages}
              callbackSelect={this.updateSelectedPackage}
              callbackFavorite={this.updateFavoritePackage}
            />
          </Col>

          <Col
            xs={{ size: 12 }}
            sm={{ size: 8  }}
            lg={{ size: 10 }}
            tag="section"
            className="vh-100 mh-100"
          >
            <DocView package={selectedPackage} />
          </Col>
        </Row>
      </Container>
    </main>
    </>
  }
}

export default App;
