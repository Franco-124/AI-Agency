// API Catalog (RFC-in-progress linkset format). The only backend route this
// site exposes is the contact-form lead intake (/api/contact), which is
// unauthenticated, rate-limited, and disallowed in robots.txt — not a public
// API meant for agent consumption. The catalog is intentionally empty.
export async function GET() {
  const body = {
    linkset: [],
  }

  return Response.json(body, {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
