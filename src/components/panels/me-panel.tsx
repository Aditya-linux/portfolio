'use client';

import { TLine, TLink } from './term';

const tools = ['React', 'Next.js', 'TypeScript', 'Rust', 'Solidity', 'Soroban', 'Python', 'Node.js'];

export function MePanel({ onOpen, onKeys }: { onOpen: (id: string) => void; onKeys: () => void }) {
  const jump = (id: string, label = id) => (
    <button type="button" className="tlink tbtn" onClick={() => onOpen(id)}>{label}</button>
  );

  return (
    <div className="term">
      <p className="thead">
        Aditya Nishad · <span className="tblue">AI &amp; Web3 product builder</span>
      </p>
      <TLine k="where">New Delhi · remote</TLine>
      <TLine k="now">
        open source at <TLink href="https://stellar.org/">Stellar</TLink> · Brand Ambassador
      </TLine>
      <TLine k="also">
        building Recurra, Sentinex and other on-chain products
      </TLine>
      <TLine k="langs">English, Hindi</TLine>
      <TLine k="open">
        {jump('work')} · {jump('webdev', 'projects')} · {jump('blog')} · {jump('contact')}
      </TLine>
      <TLine k="links">
        <TLink href="https://github.com/Aditya-linux">github</TLink> ·{' '}
        <TLink href="https://x.com/AdityaNishad987">x</TLink> ·{' '}
        <TLink href="https://www.linkedin.com/in/aditya-nishad-a07b191b9">linkedin</TLink> ·{' '}
        <TLink href="/cv.pdf">CV (PDF)</TLink>
      </TLine>
      <p className="ttags">
        {tools.map((tool) => <span className="ttag" key={tool}>{tool}</span>)}
      </p>
      <p className="thint">
        icons on the left open the rest. 1-6 too.{' '}
        <button type="button" className="tlink tbtn" onClick={onKeys}>[?]</button> for keys.
      </p>
    </div>
  );
}
