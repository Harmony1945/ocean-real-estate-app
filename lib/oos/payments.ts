export type PaymentProvider = "manual" | "iyzico";

export type CheckoutSessionRequest = {
  provider: PaymentProvider;
  productName: string;
  amount: number;
  currency: "TRY";
};

export async function createCheckoutSession(_request: CheckoutSessionRequest) {
  // TODO: iyzico checkout session will be created here.
  return {
    provider: "manual" as PaymentProvider,
    ready: false,
    message: "Kartlı ödeme altyapısı iyzico entegrasyonu ile aktif edilecektir."
  };
}
