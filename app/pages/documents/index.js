import { useState } from 'react';
import Head from 'next/head';
import DocumentDatabase from '../../components/DocumentDatabase';

export default function DocumentsPage() {
  return (
    <div className="documents-page">
      <Head>
        <title>Document Database | LegalFlow</title>
        <meta name="description" content="Browse and manage your legal documents" />
      </Head>
      
      <main>
        <DocumentDatabase />
      </main>
    </div>
  );
} 