import {Col, Container, Row} from 'react-bootstrap';
import Confetti from 'react-confetti';
import {useWindowSize} from 'usehooks-ts';

/** Renders a banner showing the game has been won. */
export function WonBanner() {
  const {width: windowWidth, height: windowHeight} = useWindowSize();
  return (
    <Container className="d-flex h-100 align-items-center">
      <Row className="justify-content-center">
        <Col xs={10} sm={8} md={6}>
          <img
            className="w-100"
            src="./congratulations.png"
            alt="Congratulations!"
          />
        </Col>
        <Col
          xs={10}
          md={8}
          className="gy-4 text-center text-uppercase fw-bold h4 text-muted"
          style={{
            letterSpacing: 1,
          }}
        >
          press space to play again
        </Col>
      </Row>
      <Confetti width={windowWidth - 5} height={windowHeight - 5} />
    </Container>
  );
}
