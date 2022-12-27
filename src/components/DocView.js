import React from 'react';

// const SOURCE = process.env.PUBLIC_URL;
const SOURCE = "https://ftp.fau.de/ctan/";

class DocView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    if (this.props.package === undefined) {
      return <div className="align-center">
        <p>No documentation loaded.</p>
      </div>
    }

    // const url = process.env.PUBLIC_URL + "/ctan/" + this.props.package['key'] + ".pdf";
    const url = this.props.package["href"].replace("ctan:", SOURCE);

    return <div className="position-relative h-100">
        <iframe src={url} width="100%" height="100%" />
      </div>;
  }
}

export default DocView;
