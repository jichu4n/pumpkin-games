/** Renders a banner showing the game has been won. */
export function WonBanner() {
  return (
    <div className="d-flex flex-column h-100 justify-content-center align-items-center">
      <div className="col-10 col-sm-8 col-md-6">
        <img
          className="w-100"
          src="./congratulations.png"
          alt="Congratulations!"
        />
      </div>
      <div
        className="col-10 col-md-8 mt-4 text-center text-uppercase fw-bold h4 text-muted"
        style={{
          letterSpacing: 1,
        }}
      >
        press space to play again
      </div>
    </div>
  );
}
