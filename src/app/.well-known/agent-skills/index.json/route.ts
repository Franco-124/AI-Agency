// Agent Skills index (https://isitagentready.com spec, v0.2.0 path).
// Numi AI offers no invocable agent skills — this is an explicit empty
// index rather than a 404, so scanners record "checked, none" instead of
// "unknown/broken".
export async function GET() {
  const body = {
    version: '0.2.0',
    skills: [],
  }

  return Response.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
