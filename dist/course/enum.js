"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.EnrollmentStatus = exports.CurriculumItemType = exports.Language = exports.CourseStatus = exports.Currency = exports.CourseLevel = void 0;
var CourseLevel;
(function (CourseLevel) {
    CourseLevel["Beginner"] = "beginner";
    CourseLevel["Intermediate"] = "intermediate";
    CourseLevel["Advanced"] = "advanced";
})(CourseLevel || (exports.CourseLevel = CourseLevel = {}));
var Currency;
(function (Currency) {
    Currency["NGN"] = "NGN";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
})(Currency || (exports.Currency = Currency = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["Draft"] = "draft";
    CourseStatus["Published"] = "published";
    CourseStatus["Archived"] = "archived";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
var Language;
(function (Language) {
    Language["English"] = "english";
    Language["French"] = "french";
    Language["Spanish"] = "spanish";
    Language["Yoruba"] = "yoruba";
    Language["Igbo"] = "igbo";
    Language["Hausa"] = "hausa";
})(Language || (exports.Language = Language = {}));
var CurriculumItemType;
(function (CurriculumItemType) {
    CurriculumItemType["Lecture"] = "lecture";
    CurriculumItemType["Article"] = "article";
    CurriculumItemType["Resource"] = "resource";
    CurriculumItemType["Quiz"] = "quiz";
    CurriculumItemType["Assignment"] = "assignment";
})(CurriculumItemType || (exports.CurriculumItemType = CurriculumItemType = {}));
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["Active"] = "active";
    EnrollmentStatus["Completed"] = "completed";
    EnrollmentStatus["Dropped"] = "dropped";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
var Category;
(function (Category) {
    Category["WebDevelopment"] = "web_development";
    Category["MobileDevelopment"] = "mobile_development";
    Category["Design"] = "design";
    Category["UIUX"] = "ui_ux";
    Category["DataScience"] = "data_science";
    Category["MachineLearning"] = "machine_learning";
    Category["CloudComputing"] = "cloud_computing";
    Category["AWS"] = "aws";
    Category["FullStack"] = "full_stack";
})(Category || (exports.Category = Category = {}));
