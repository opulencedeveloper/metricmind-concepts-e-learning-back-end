"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackTransferSource = exports.PaystackRecipientType = void 0;
var PaystackRecipientType;
(function (PaystackRecipientType) {
    PaystackRecipientType["NUBAN"] = "nuban";
    PaystackRecipientType["MOBILE_MONEY"] = "mobile_money";
})(PaystackRecipientType || (exports.PaystackRecipientType = PaystackRecipientType = {}));
var PaystackTransferSource;
(function (PaystackTransferSource) {
    PaystackTransferSource["BALANCE"] = "balance";
    PaystackTransferSource["MAIN"] = "main";
})(PaystackTransferSource || (exports.PaystackTransferSource = PaystackTransferSource = {}));
