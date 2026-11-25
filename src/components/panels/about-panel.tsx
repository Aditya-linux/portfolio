import { PanelLabel } from './rows';

const tools = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Rust', 'Solidity', 'Soroban', 'PostgreSQL', 'Docker'];

export function AboutPanel() {
  return (
    <>
      <p className="panel-copy">
        I’m an AI and Web3 product builder focused on fintech, automation and blockchain tools
        that solve real problems.
      </p>
      <p className="panel-copy">
        I’m a Stellar Brand Ambassador and open-source contributor. Recent work includes Recurra,
        Sentinex and other on-chain products across Stellar, Solana, Ethereum and Starknet.
      </p>
      <PanelLabel>Stack</PanelLabel>
      <p className="stack-list">{tools.join(' · ')}</p>
    </>
  );
}
