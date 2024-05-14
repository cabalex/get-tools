export interface Account {
    id: string;
    institutionId: string;
    paymentSystemId: string;
    userId: string;
    isActive: boolean;
    accountDisplayName: string;
    paymentSystemType: number;
    accountTender: string;
    isAccountTenderActive: boolean;
    accountType: number;
    depositAccepted: boolean;
    lastFour: string|null;
    nameOnMedia: string|null;
    expirationMonth: string|null;
    expirationYear: string|null;
    billingAddressId: string|null;
    balance: number|null;
}

export interface Transaction {
    transactionId: string;
    transactionSequence: number;
    transactionType: number;
    amount: number;
    resultingBalance: number;
    postedDate: string;
    actualDate: string;
    patronId: string;
    planId: string;
    tenderId: string;
    locationId: string;
    locationName: string;
    patronFullName: string;
    accountType: number;
    accountName: string;
    paymentSystemType: number;
    transactionKey: string;

    // added manually
    friendlyName: string;
}