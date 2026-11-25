'use client';

import Image from 'next/image';
import { Signature } from './signature';
import { useTheme } from './theme-provider';

const socials = [
  { href: 'https://x.com/AdityaNishad987', label: 'X', icon: '/logos/x-dark.svg' },
  { href: 'https://github.com/Aditya-linux', label: 'GitHub', icon: '/logos/github-dark.svg' },
  { href: 'https://www.linkedin.com/in/aditya-nishad-a07b191b9', label: 'LinkedIn', icon: '/logos/linkedin-dark.svg' },
  { href: 'https://t.me/AdityaNishad77', label: 'Telegram', icon: '/logos/telegram.svg' },
  { href: 'mailto:adityanishad0402@gmail.com', label: 'Email', icon: '/logos/email.svg' },
] as const;

export function ProfileHeader() {
  const { dark } = useTheme();

  return (
    <header className="profile-header">
      <div className="profile-top">
        <Image
          className="profile-avatar"
          src="/profile.jpeg"
          alt="Aditya Nishad"
          width={72}
          height={72}
          priority
        />
        <div className="profile-identity">
          <div className="profile-name-row">
            <h1 className="profile-name">Aditya Nishad</h1>
            <nav className="profile-socials" aria-label="Social links">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  aria-label={item.label}
                >
                  <Image src={item.icon} alt="" width={16} height={16} />
                </a>
              ))}
            </nav>
          </div>
          <Signature
            className="profile-signature"
            text="ai & web3 product builder"
            color={dark ? '#C4B5FD' : '#5B21B6'}
            fontSize={22}
            duration={0.9}
            delay={0.05}
          />
        </div>
      </div>
    </header>
  );
}
