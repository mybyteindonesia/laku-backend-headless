
export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'system-ui' }}>
      <h1>Laku Backend API</h1>
      <p>This is a headless backend service for Framer.</p>
      <p>Status: <strong>Running</strong></p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><code>GET /api/models</code> - Get list of models</li>
        <li><code>GET /api/storage?model=iPhone%2013</code> - Get storage options for a model</li>
        <li><code>POST /api/quote</code> - Calculate price</li>
        <li><code>POST /api/lead</code> - Submit lead data</li>
      </ul>
    </div>
  );
}
