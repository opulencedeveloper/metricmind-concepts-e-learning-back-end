"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRole = exports.AccountStatus = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["Student"] = "student";
    UserType["Admin"] = "admin";
})(UserType || (exports.UserType = UserType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["PendingVerification"] = "pending_verification";
    AccountStatus["Active"] = "active";
    AccountStatus["Suspended"] = "suspended";
    AccountStatus["DeletionRequested"] = "deletion_requested";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SuperAdmin"] = "super_admin";
    AdminRole["Admin"] = "admin";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
