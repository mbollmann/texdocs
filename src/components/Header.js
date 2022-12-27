import logo from '../logo.svg';

import {
  Container, Row, Col, Navbar, NavbarBrand
  } from 'reactstrap';

const Header = () => (
  <header>
    <Navbar fixed="top" color="light" light expand="xs" className="border-bottom border-gray bg-white" style={{ height: 80 }}>

      <Container>
        <Row className="position-relative w-100 align-items-center">

          <Col className="d-flex justify-content-xs-start justify-content-lg-center">
            <NavbarBrand className="d-inline-block p-0" href="/" style={{ width: 80 }}>
              <img src={logo} alt="logo" className="position-relative img-fluid" />
            </NavbarBrand>
          </Col>

        </Row>
      </Container>

    </Navbar>
  </header>
);

export default Header;
