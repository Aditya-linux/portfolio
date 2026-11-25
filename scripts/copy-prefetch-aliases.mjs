// `next build` writes RSC payloads under directories containing "$" for
// dynamic segments (e.g. out/blog/<slug>/__next.blog/$d$slug/__PAGE__.txt),
// while the client requests them percent-encoded. Static asset servers
// canonicalise "$" to "%24" and then miss the manifest entry, so each
// prefetch 404s. Mirror every $-named path under its encoded spelling.
import { cpSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) => {
  let copied = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) copied += walk(full);
    if (name.includes('$')) {
      cpSync(full, join(dir, name.replaceAll('$', '%24')), { recursive: true });
      copied += 1;
    }
  }
  return copied;
};

console.log(`prefetch aliases: copied ${walk('out')} $-named paths`);
