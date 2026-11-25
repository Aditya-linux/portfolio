import type { Metadata } from 'next';
import { App } from '../../App';
import { ContactPanel } from '../../components/panels/contact-panel';

export const metadata: Metadata = {
  title: 'Contact | Aditya Nishad',
  description: 'Get in touch with Aditya Nishad by email, X or LinkedIn.',
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <App view="contact">
      <h1 className="page-h1">Contact</h1>
      <ContactPanel />
    </App>
  );
}
