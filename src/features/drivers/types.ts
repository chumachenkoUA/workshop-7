export type DriverPassport =
	| { type: "paper"; series: string; number: string }
	| { type: "idCard"; number: string };

export type Driver = {
	id: string;
	email: string;
	phone: string;
	fullName: string;
	licenseData: string;
	passportData: DriverPassport;
};

export type DriverPayload = {
	email: string;
	phone: string;
	fullName: string;
	licenseData: string;
	passportData: DriverPassport;
};

export type DriverUpdatePayload = DriverPayload & { id: string };
