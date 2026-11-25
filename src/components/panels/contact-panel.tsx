import { Logo, Row } from './rows';

export function ContactPanel() {
  return (
    <>
      <p className="panel-copy">Email, Telegram, or DM me on X any time.</p>
      <p className="panel-copy">
        I’m open to freelance work and collaborations across AI, Web3 and full-stack product
        development. Questions about TapPay, Rekura or anything else I’ve shipped are welcome.
      </p>
      <div className="prow-list">
        <Row href="mailto:adityanishad0402@gmail.com" logo={<Logo src="/logos/email.svg" glyph />} name="Email" meta="adityanishad0402@gmail.com" />
        <Row href="https://t.me/AdityaNishad77" logo={<Logo src="/logos/telegram.svg" glyph />} name="Telegram" meta="@AdityaNishad77" />
        <Row href="https://x.com/AdityaNishad987" logo={<Logo src="/logos/x-dark.svg" glyph />} name="X" meta="@AdityaNishad987" />
        <Row href="https://www.linkedin.com/in/aditya-nishad-a07b191b9" logo={<Logo src="/logos/linkedin-dark.svg" glyph />} name="LinkedIn" meta="aditya-nishad" />
        <Row href="https://github.com/Aditya-linux" logo={<Logo src="/logos/github-dark.svg" glyph />} name="GitHub" meta="Aditya-linux" />
        <Row href="/cv.pdf" logo={<Logo src="/logos/github-dark.svg" glyph />} name="Resume" meta="PDF" />
      </div>
    </>
  );
}
