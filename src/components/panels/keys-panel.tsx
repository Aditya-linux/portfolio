import { TLine } from './term';

const KEYS: [string, string][] = [
  ['1-6', 'toggle a window'],
  ['esc', 'close the focused window'],
  ['?', 'open this list'],
  ['drag', 'move a window by its title bar'],
  ['_', 'minimise to the taskbar'],
  ['□', 'maximise toggle'],
  ['×', 'close'],
];

export function KeysPanel() {
  return (
    <div className="term">
      {KEYS.map(([k, v]) => <TLine key={k} k={k}>{v}</TLine>)}
    </div>
  );
}
