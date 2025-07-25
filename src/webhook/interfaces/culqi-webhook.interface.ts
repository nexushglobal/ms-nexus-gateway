export interface CulqiWebhookEvent {
  object: string;
  event: string;
  data: {
    id: string;
    object: string;
    amount: number;
    currency_code: string;
    email: string;
    outcome: {
      type: string;
      code: string;
      merchant_message: string;
      user_message: string;
    };
    metadata: {
      internal_payment_id?: string;
      [key: string]: any;
    };
    creation_date: number;
    reference_code: string;
  };
}

export interface PaymentApprovePayload {
  paymentId: string;
  gatewayTransactionId: string;
  bankName: string;
  dateOperation: Date;
  amount: number;
  metadata?: Record<string, any>;
}

export interface PaymentRejectPayload {
  paymentId: string;
  gatewayTransactionId: string;
  reason: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}
