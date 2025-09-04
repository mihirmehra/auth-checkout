// app/invoice/[id]/page.js
import { notFound } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getInvoice(id) {
  try {
    const client = await clientPromise;
    const db = client.db('payments');
    const collection = db.collection('invoices');
    
    const invoice = await collection.findOne({ uniqueCustomerId: id });

    return invoice;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function InvoicePage({ params }) {
  const invoice = await getInvoice(params.id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="container">
      <h1>Invoice</h1>
      <div className="invoice-details">
        <p><strong>Invoice ID:</strong> {invoice.uniqueCustomerId}</p>
        <p><strong>Transaction ID:</strong> {invoice.transactionId}</p>
        <p><strong>Amount:</strong> ${invoice.amount}</p>
        <p><strong>Customer IP:</strong> {invoice.customerIp}</p>
        <p><strong>Timestamp:</strong> {new Date(invoice.timestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
      </div>
      <button onClick={() => window.print()}>Print Invoice</button>
    </div>
  );
}