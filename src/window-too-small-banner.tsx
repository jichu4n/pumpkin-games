/** Renders a banner showing the current window is too small. */
export function WindowTooSmallBanner() {
  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'white',
      }}
    >
      <div
        className="p-4 text-center text-uppercase fw-bold h4 text-muted"
        style={{
          letterSpacing: 1,
        }}
      >
        Please use a larger window or device to play this game
      </div>
    </div>
  );
}
