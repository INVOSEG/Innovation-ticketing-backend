exports.DB_Tables = Object.freeze({
  USER: "Users",
  AGENCY: "Agencies",
  BOOOKING: "Booking",
  TYPES: "Type",
  CUSTTYPE: "customerType",
  CUSTOMER: "customer",
  GDS: "GDSSchema",
  PAXTYPE: "paxType",
  VISITTYPE: "visitType",
  SPO: "Spo",
  SPO: "Spo",
  TOURINVOICE: "tourInvoice",
  CUSTOMERLEDGER: "customerLedger",
  SUPPLIERLEDGER: "supplierLedger",
  INCOMESTATEMENT: "incomeStatement",
  TRAVELLER: "Traveller",
});

exports.EUserRole = Object.freeze({
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
  AGENCY: "agency",
  SUPERADMIN: "super_admin",
  SALE: "sale",
  MARKETING: "marketing",
  SPO: "SPO",
});

exports.EResponseCode = Object.freeze({
  SUCCESS: 200,
  BADREQUEST: 400,
  NOTFOUND: 404,
  INVALID: 422,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNALSERVERERROR: 500,
});

exports.UserStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  CLOSED: "CLOSED",
});

exports.DeleteStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  SOFT_DELETE: "SOFT_DELETE",
  HARD_DELETE: "HARD_DELETE",
});
exports.BookingType = Object.freeze({
  ONLINE: "online",
  OFFLINE: "offline",
});
exports.flightTrip = Object.freeze({
  MULTICITY: "Multi City",
  ONEWAY: "One Way",
  ROUNDTRIP: "Round Trip",
});

exports.AppointmentStatus = Object.freeze({
  BOOKED: "BOOKED",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKEDIN: "CHECKEDIN",
  INPROGRESS: "INPROGRESS",
  COMPLETED: "COMPLETED",
  RESCHEDULED: "RESCHEDULED",
  CANCELLED: "CANCELLED",
  NOSHOW: "NOSHOW",
  PASTDUE: "PASTDUE",
});

exports.EChatStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
});
exports.EPaidStatus = Object.freeze({
  PAID: "PAID",
  PENDING: "PENDING",
  UNPAID: "UNPAID",
  PARTALLYPAID: "PARTALLY PAID",
});
exports.EMarkupType = Object.freeze({
  percentage: "percentage",
  whole: "whole",
});
exports.EPaymentTypeStatus = Object.freeze({
  pending: "pending",
  paid: "paid",
  confirmed: "confirmed",
  declined: "declined",
  overdue: "overdue",
});
exports.ETicketStatus = Object.freeze({
  CANCELLED: "canceled",
  VOIDED: "voided",
  HOLD: "hold",
  COMFIRMED: "confirmed",
  REFUNDED: "refunded",
});

exports.PayMode = Object.freeze({
  CASH: "CASH",
  CC: "CREDIT CARD",
  CR: "CREDIT",
  AD: "ADJUSTMENT",
});
exports.SaleStatus = Object.freeze({
  Q: "Quotation",
  B: "Booking",
  C: "Confirmed",
  R: "Refunded",
});
exports.visitType = Object.freeze({
  Hajj: "Hajj",
  Holiday: "Holiday",
  Tour: "Tour",
  Umrah: "Umrah",
  Visitor: "Visitor",
});
exports.PaxType = Object.freeze({
  ADULT: "Adult",
  CHILD: "Child",
  INFANT: "Infant",
});
exports.doc = Object.freeze({
  MAN: "Manual",
  AUT: "Auto",
  ET: "E-Ticket",
  BSP: "BSP",
  BSPE: "BSP E-Ticket",
  BSPO: "BSP D",
  IA: "IA",
  VTO: "VTO",
  E_TAT: "E-TAT",
  SOTO_TICKET: "SOTO TICKET",
});
exports.saleType = Object.freeze({
  I: "International",
  D: "Domestic",
  A: "Auto",
});
exports.sector = Object.freeze({
  SIN: "Single",
  DOU: "Double",
  TRI: "Triple",
  FOU: "Four",
});
exports.category = Object.freeze({
  HAJJ: "Hajj",
  HOLIDAY: "Holiday",
  TOUR: "Tour",
  UMRAH: "Umrah",
  VISITOR: "Visitor",
});
exports.voucherType = Object.freeze({
  JOURNALVOUCHER: "Journal Voucher",
  PAYMENTVOUCHER: "Payment Voucher",
  RECIPTVOUCHER: "Recipt Voucher",
});
exports.PAYTYPE = Object.freeze({
  RECIVED: "received",
  CHARGED: "charged",
});
exports.PayMethod = Object.freeze({
  CASH: "CASH",
  CHECK: "CHECK",
  CR: "CREDIT",
  VD: "VOID",
});
exports.LedgerType = Object.freeze({
  CUSTOMER: "Customer",
  SUPPLIER: "Supplier",
});
exports.Typpe = Object.freeze({
  CREDITED: "credited",
  DEBITED: "debited",
});

exports.travelClassMap = {
  PREMIUMFIRST: "PremiumFirst",
  FIRST: "First",
  PREMIUMBUSINESS: "PremiumBusiness",
  BUSINESS: "Business",
  PREMIUMECONOMY: "PremiumEconomy",
  ECONOMY: "Economy",
};
exports.EVisaStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

exports.cabinTypeMap = {
  P: "Premium First",
  PremiumFirst: "Premium First",
  F: "First",
  First: "First",
  J: "Premium Business",
  PremiumBusiness: "Premium Business",
  C: "Business",
  Business: "Business",
  S: "Premium Economy",
  PremiumEconomy: "Premium Economy",
  Y: "Economy",
  Economy: "Economy",
};
