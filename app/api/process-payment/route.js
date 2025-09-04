// app/api/process-payment/route.js
import { NextResponse } from 'next/server';
import { ApiControllers, ApiContracts } from 'authorizenet';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { paymentNonce, amount } = await req.json();

    // Authorize.net API credentials from environment variables
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setApiLoginId(process.env.AUTHORIZENET_API_LOGIN_ID);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY);

    // Opaque data received from Accept.js
    const opaqueData = new ApiContracts.OpaqueDataType();
    opaqueData.setDataDescriptor("COMMON.ACCEPT.INAPP.PAYMENT");
    opaqueData.setDataValue(paymentNonce);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Create the transaction request
    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType('authCaptureTransaction');
    transactionRequestType.setAmount(amount);
    transactionRequestType.setPayment(paymentType);

    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const controller = new ApiControllers.CreateTransactionController(createRequest.getJSON());

    const apiResponse = await new Promise((resolve, reject) => {
      controller.execute((response) => {
        resolve(response);
      });
    });

    if (apiResponse.getMessages().getResultCode() === 'Ok') {
      const transactionResponse = apiResponse.getTransactionResponse();
      const transactionId = transactionResponse.getTransId();

      // Get customer IP and unique ID
      const customerIp = req.headers.get('x-forwarded-for') || req.ip;
      const uniqueId = new Date().getTime().toString();
      
      const invoiceData = {
        uniqueCustomerId: uniqueId,
        transactionId: transactionId,
        amount: amount,
        customerIp: customerIp,
        timestamp: new Date(),
        status: 'Successful',
      };

      // Connect to MongoDB and save invoice data
      const client = await clientPromise;
      const db = client.db('payments');
      const collection = db.collection('invoices');
      await collection.insertOne(invoiceData);

      return NextResponse.json({ 
        message: 'Payment successful', 
        invoiceId: uniqueId, 
        details: invoiceData 
      }, { status: 200 });
    } else {
      const errorMsg = apiResponse.getMessages().getMessage()[0].getText();
      console.error('Authorize.net API Error:', errorMsg);
      return NextResponse.json({ message: 'Payment failed', error: errorMsg }, { status: 400 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}