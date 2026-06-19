import mongoose from "mongoose";
import Course from "../course/entity";
import Admin from "../admin/entity";
import { CourseLevel, CourseStatus, Language, Currency } from "../course/enum";
import Logging from "../utils/loggin";
import config from "../config";

/**
 * Seeder to create 5 test courses
 * Run with: npx ts-node src/seeders/courses.seeder.ts
 */
async function seedCourses() {
  try {
    await mongoose.connect(config.db.uri);
    Logging.info("Connected to MongoDB");

    // Get or create an admin for courses
    let admin = await Admin.findOne();
    if (!admin) {
      Logging.warn("No admin found. Creating test admin...");
      admin = await Admin.create({
        email: "instructor@metricmind.com",
        fullName: "MetricMind Instructor",
        password: "hashedpassword123",
      });
    }

    const adminId = admin._id;
    const thumbnailUrl =
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop";
    const previewVideoUrl = "https://vimeo.com/696055089";

    const coursesData = [
      {
        adminId,
        title: "Complete Web Development Masterclass",
        description:
          "Learn full-stack web development from scratch. Master HTML, CSS, JavaScript, React, Node.js, and MongoDB in this comprehensive course. Build real-world projects and become a professional web developer.",
        instructor: "Sarah Johnson",
        instructorBio:
          "Senior Full-Stack Developer with 8+ years of experience building scalable web applications at tech companies.",
        instructorImage: thumbnailUrl,
        category: "Web Development",
        subcategory: "Full Stack",
        level: CourseLevel.Beginner,
        language: Language.English,
        price: 49.99,
        currency: Currency.USD,
        thumbnail: thumbnailUrl,
        previewVideoUrl,
        learningObjectives: [
          "Build responsive websites from scratch",
          "Master React and modern JavaScript",
          "Create backend APIs with Node.js",
          "Deploy applications to production",
          "Work with databases and SQL",
        ],
        requirements: [
          "Basic computer skills",
          "Passion for learning to code",
          "A text editor and web browser",
        ],
        totalDuration: 45,
        status: CourseStatus.Published,
        studentsEnrolled: 1245,
        rating: 4.8,
        reviewCount: 342,
        featured: true,
      },
      {
        adminId,
        title: "Data Science & Machine Learning Bootcamp",
        description:
          "Master data science and machine learning with Python. Learn pandas, NumPy, scikit-learn, and TensorFlow. Build predictive models and analyze real-world datasets.",
        instructor: "Dr. Michael Chen",
        instructorBio:
          "PhD in Machine Learning, worked at Google and Stanford AI Lab. Published 15+ research papers.",
        instructorImage: thumbnailUrl,
        category: "Data Science",
        subcategory: "Machine Learning",
        level: CourseLevel.Intermediate,
        language: Language.English,
        price: 59.99,
        currency: Currency.USD,
        thumbnail: thumbnailUrl,
        previewVideoUrl,
        learningObjectives: [
          "Understand machine learning algorithms",
          "Build predictive models with scikit-learn",
          "Work with deep learning frameworks",
          "Analyze large datasets with pandas",
          "Deploy ML models to production",
        ],
        requirements: [
          "Python programming knowledge",
          "Basic statistics background",
          "Understanding of linear algebra basics",
        ],
        totalDuration: 52,
        status: CourseStatus.Published,
        studentsEnrolled: 856,
        rating: 4.7,
        reviewCount: 218,
        featured: true,
      },
      {
        adminId,
        title: "UI/UX Design Fundamentals",
        description:
          "Learn user interface and user experience design principles. Master Figma, wireframing, prototyping, and user research. Create beautiful and functional digital products.",
        instructor: "Emma Rodriguez",
        instructorBio:
          "Award-winning UX designer who has worked on products for Apple, Spotify, and Airbnb.",
        instructorImage: thumbnailUrl,
        category: "Design",
        subcategory: "UI/UX",
        level: CourseLevel.Beginner,
        language: Language.English,
        price: 44.99,
        currency: Currency.USD,
        thumbnail: thumbnailUrl,
        previewVideoUrl,
        learningObjectives: [
          "Master design thinking methodology",
          "Create wireframes and prototypes in Figma",
          "Conduct user research and testing",
          "Design accessible interfaces",
          "Build portfolio projects",
        ],
        requirements: [
          "No design experience needed",
          "Figma account (free tier available)",
          "Creative mindset and attention to detail",
        ],
        totalDuration: 28,
        status: CourseStatus.Published,
        studentsEnrolled: 2103,
        rating: 4.9,
        reviewCount: 567,
        featured: true,
      },
      {
        adminId,
        title: "Cloud Infrastructure with AWS",
        description:
          "Learn Amazon Web Services from basics to advanced. Deploy applications, manage databases, set up security, and optimize costs. Get hands-on with EC2, S3, Lambda, and RDS.",
        instructor: "James Patterson",
        instructorBio:
          "AWS Solutions Architect with 10+ years of cloud infrastructure experience. Certified AWS Solutions Architect.",
        instructorImage: thumbnailUrl,
        category: "Cloud Computing",
        subcategory: "AWS",
        level: CourseLevel.Intermediate,
        language: Language.English,
        price: 54.99,
        currency: Currency.USD,
        thumbnail: thumbnailUrl,
        previewVideoUrl,
        learningObjectives: [
          "Set up and manage AWS infrastructure",
          "Deploy scalable applications",
          "Implement security best practices",
          "Manage databases in the cloud",
          "Optimize costs and performance",
        ],
        requirements: [
          "Basic understanding of web applications",
          "Server and networking fundamentals",
          "AWS free tier account",
        ],
        totalDuration: 38,
        status: CourseStatus.Published,
        studentsEnrolled: 934,
        rating: 4.6,
        reviewCount: 287,
        featured: false,
      },
      {
        adminId,
        title: "Mobile App Development with React Native",
        description:
          "Build native iOS and Android apps using React Native. Learn JavaScript, component lifecycle, navigation, and state management. Deploy apps to app stores.",
        instructor: "Lisa Wong",
        instructorBio:
          "Mobile engineer who built apps for Fortune 500 companies. Experienced with React Native, Flutter, and native development.",
        instructorImage: thumbnailUrl,
        category: "Mobile Development",
        subcategory: "React Native",
        level: CourseLevel.Advanced,
        language: Language.English,
        price: 64.99,
        currency: Currency.USD,
        thumbnail: thumbnailUrl,
        previewVideoUrl,
        learningObjectives: [
          "Build cross-platform mobile apps",
          "Master React Native fundamentals",
          "Implement navigation and routing",
          "Access device APIs and sensors",
          "Publish apps to Apple and Google stores",
        ],
        requirements: [
          "Strong JavaScript knowledge",
          "React experience preferred",
          "Mac or Linux for iOS development",
        ],
        totalDuration: 48,
        status: CourseStatus.Published,
        studentsEnrolled: 675,
        rating: 4.5,
        reviewCount: 156,
        featured: false,
      },
    ];

    // Clear existing courses (optional)
    // await Course.deleteMany({});

    // Insert courses
    const createdCourses = await Course.insertMany(coursesData);

    Logging.info(`Successfully created ${createdCourses.length} courses:`);
    createdCourses.forEach((course) => {
      Logging.info(
        `  - ${course.title} (${course.level}, Rating: ${course.rating}, Enrolled: ${course.studentsEnrolled})`
      );
    });

    await mongoose.disconnect();
    Logging.info("Database connection closed");
  } catch (error: any) {
    Logging.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
}

seedCourses();
