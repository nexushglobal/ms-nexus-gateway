export class WithdrawalValidationResponseDto {
  infoUser: {
    userId: string;
    userName: string;
    userEmail: string;
    documentType: string;
    documentNumber: string;
    ruc: string;
    razonSocial: string;
    address: string;
    bankName: string;
    accountNumber: string;
    cci: string;
    phone: string;
  };
  canWithdraw: boolean;
  availablePoints: number;
  req?: string[];
}
