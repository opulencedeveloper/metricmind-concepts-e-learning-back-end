"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCurriculum = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("../course/entity"));
const entity_2 = __importDefault(require("../course/section/entity"));
const entity_3 = __importDefault(require("../course/curriculum-item/entity"));
const enum_1 = require("../course/enum");
const curriculumData = {
    "complete-web-development-masterclass": {
        sections: [
            {
                title: "HTML & CSS Fundamentals",
                description: "Learn the basics of web development",
                items: [
                    {
                        title: "Introduction to HTML",
                        description: "Learn the fundamentals of HTML markup language and how to structure web pages properly.",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1200,
                    },
                    {
                        title: "HTML Best Practices",
                        type: enum_1.CurriculumItemType.Article,
                        content: "Learn semantic HTML, accessibility, and SEO best practices for modern web development.",
                    },
                    {
                        title: "CSS Styling Basics",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1500,
                    },
                    {
                        title: "HTML & CSS Quiz",
                        type: enum_1.CurriculumItemType.Quiz,
                    },
                ],
            },
            {
                title: "JavaScript Essentials",
                description: "Master JavaScript fundamentals",
                items: [
                    {
                        title: "JavaScript Variables and Types",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1800,
                    },
                    {
                        title: "Functions and Scope",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2100,
                    },
                    {
                        title: "JavaScript Quiz",
                        type: enum_1.CurriculumItemType.Quiz,
                    },
                ],
            },
        ],
    },
    "data-science-machine-learning-bootcamp": {
        sections: [
            {
                title: "Python Basics",
                description: "Get started with Python for data science",
                items: [
                    {
                        title: "Python Setup and Environment",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 900,
                    },
                    {
                        title: "NumPy and Pandas Basics",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2400,
                    },
                    {
                        title: "Data Manipulation Exercise",
                        type: enum_1.CurriculumItemType.Article,
                        content: "Practice data manipulation using pandas DataFrames.",
                    },
                ],
            },
            {
                title: "Machine Learning Algorithms",
                description: "Learn core ML algorithms",
                items: [
                    {
                        title: "Linear Regression",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2700,
                    },
                    {
                        title: "Classification Algorithms",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 3000,
                    },
                    {
                        title: "ML Quiz",
                        type: enum_1.CurriculumItemType.Quiz,
                    },
                ],
            },
        ],
    },
    "uiux-design-fundamentals": {
        sections: [
            {
                title: "Design Thinking",
                description: "Understand design thinking methodology",
                items: [
                    {
                        title: "Design Thinking Overview",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1500,
                    },
                    {
                        title: "User Research Methods",
                        type: enum_1.CurriculumItemType.Article,
                        content: "Learn various user research techniques including interviews, surveys, and usability testing.",
                    },
                ],
            },
            {
                title: "Figma Mastery",
                description: "Master Figma design tool",
                items: [
                    {
                        title: "Figma Basics",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1800,
                    },
                    {
                        title: "Creating Wireframes",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2100,
                    },
                    {
                        title: "Prototyping in Figma",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2400,
                    },
                ],
            },
        ],
    },
    "cloud-infrastructure-with-aws": {
        sections: [
            {
                title: "AWS Fundamentals",
                description: "Get started with Amazon Web Services",
                items: [
                    {
                        title: "AWS Overview",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1200,
                    },
                    {
                        title: "Setting Up AWS Account",
                        type: enum_1.CurriculumItemType.Article,
                        content: "Step-by-step guide to creating and configuring your AWS account with IAM best practices.",
                    },
                    {
                        title: "EC2 Instances",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2000,
                    },
                ],
            },
            {
                title: "Storage and Databases",
                description: "Learn S3 and RDS",
                items: [
                    {
                        title: "S3 Storage",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1800,
                    },
                    {
                        title: "RDS Databases",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2200,
                    },
                    {
                        title: "AWS Quiz",
                        type: enum_1.CurriculumItemType.Quiz,
                    },
                ],
            },
        ],
    },
    "mobile-app-development-with-react-native": {
        sections: [
            {
                title: "React Native Setup",
                description: "Set up your React Native environment",
                items: [
                    {
                        title: "Environment Setup",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1500,
                    },
                    {
                        title: "Your First React Native App",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2000,
                    },
                ],
            },
            {
                title: "Core Components",
                description: "Learn React Native components",
                items: [
                    {
                        title: "View, Text, and ScrollView",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 1800,
                    },
                    {
                        title: "FlatList and Performance",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2100,
                    },
                    {
                        title: "Navigation Setup",
                        type: enum_1.CurriculumItemType.Lecture,
                        videoUrl: "https://vimeo.com/696055089",
                        videoDuration: 2400,
                    },
                ],
            },
        ],
    },
};
const seedCurriculum = async () => {
    try {
        console.log("🔄 Seeding curriculum for courses...");
        for (const [slug, { sections }] of Object.entries(curriculumData)) {
            const course = await entity_1.default.findOne({ slug });
            if (!course) {
                console.log(`⚠️  Course not found: ${slug}`);
                continue;
            }
            console.log(`\n📚 Processing: ${course.title}`);
            for (let sectionOrder = 0; sectionOrder < sections.length; sectionOrder++) {
                const sectionData = sections[sectionOrder];
                // Create section
                const section = await entity_2.default.create({
                    courseId: course._id,
                    title: sectionData.title,
                    description: sectionData.description,
                    order: sectionOrder + 1,
                });
                console.log(`  ✓ Section: ${section.title}`);
                // Create curriculum items
                for (let itemOrder = 0; itemOrder < sectionData.items.length; itemOrder++) {
                    const itemData = sectionData.items[itemOrder];
                    // Fallback description if not provided
                    const description = itemData.description || `Complete this lesson: ${itemData.title}`;
                    const item = await entity_3.default.create({
                        sectionId: section._id,
                        title: itemData.title,
                        description,
                        type: itemData.type,
                        videoUrl: itemData.videoUrl,
                        videoDuration: itemData.videoDuration,
                        content: itemData.content,
                        order: itemOrder + 1,
                    });
                    console.log(`    ✓ ${itemData.type}: ${item.title}`);
                }
            }
        }
        console.log("\n✅ Curriculum seeding complete!");
    }
    catch (error) {
        console.log("❌ Error seeding curriculum:", error);
        throw error;
    }
};
exports.seedCurriculum = seedCurriculum;
if (require.main === module) {
    mongoose_1.default
        .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
        .then(() => (0, exports.seedCurriculum)())
        .then(() => mongoose_1.default.connection.close())
        .catch((error) => {
        console.log(error);
        process.exit(1);
    });
}
