/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import LegalFlow from '@/components/legal-flow';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('LegalFlow Component', () => {
  it('renders the navigation items', () => {
    render(<LegalFlow />);
    
    // Check for the logo text
    expect(screen.getByText('LegalFlow')).toBeInTheDocument();
    
    // Check for navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<LegalFlow />);
    
    // Check for navigation links
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const documentsLink = screen.getByText('Documents').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(documentsLink).toHaveAttribute('href', '/documents');
  });
}); 