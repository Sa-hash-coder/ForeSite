/**
 * ForeSite — Demo Seed Script
 * ===========================
 * Creates demo accounts and sample reports with pre-seeded risk assessments.
 *
 * Run: node src/scripts/seed.js
 *
 * Creates:
 *   - 4 demo users (worker, officer, maintenance, admin)
 *   - 8 sample reports at all risk levels
 *   - 8 risk assessments
 *   - 3 alerts (for HIGH/CRITICAL reports)
 *   - 2 maintenance tasks
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Report = require("../models/Report");
const RiskAssessment = require("../models/RiskAssessment");
const Alert = require("../models/Alert");
const MaintenanceTask = require("../models/MaintenanceTask");

const DEMO_USERS = [
  {
    name: "Rajan Mehta",
    email: "worker@demo.com",
    password: "demo1234",
    role: "worker",
    department: "Boiler Room B",
  },
  {
    name: "Dr. Ananya Sharma",
    email: "officer@demo.com",
    password: "demo1234",
    role: "safety_officer",
    department: "Safety & Compliance",
  },
  {
    name: "Vikram Singh",
    email: "maintenance@demo.com",
    password: "demo1234",
    role: "maintenance",
    department: "Electrical Maintenance",
  },
  {
    name: "Admin User",
    email: "admin@demo.com",
    password: "demo1234",
    role: "admin",
    department: "Management",
  },
];

const SAMPLE_REPORTS = [
  {
    title: "Exposed electrical wiring near water pump",
    description:
      "Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped. Risk of electrocution if water contacts the wire during routine maintenance.",
    location: "Sector 4, Water Treatment Plant",
    category: "unsafe_condition",
    severity: "critical",
    riskScore: 91,
    riskLevel: "CRITICAL",
    sifProbability: 0.89,
    precursors: [
      "Energized Equipment Exposure",
      "Inadequate Isolation/Lockout",
      "Proximity to Electrical Hazard",
    ],
    hazards: ["Electrocution", "Arc Flash", "Burns"],
    recommendations: [
      "Immediately de-energize and lock out (LOTO) electrical feed at source breaker.",
      "Install red perimeter barricade tape and 'DANGER - HIGH VOLTAGE' warning signage.",
      "Replace damaged cables with IP67-rated insulated industrial conduit before re-energizing.",
    ],
    explanation:
      "This report describes exposed energized wiring in proximity to water sources — a classic SIF precursor combination. Immediate circuit isolation and repair is critical.",
  },
  {
    title: "Worker observed climbing scaffolding without harness",
    description:
      "During morning inspection, worker on Block 3 scaffolding at approximately 8 meters height with no fall arrest harness. Harness was visible on the ground. Supervisor not present.",
    location: "Block 3 Construction Site",
    category: "unsafe_act",
    severity: "high",
    riskScore: 78,
    riskLevel: "HIGH",
    sifProbability: 0.76,
    precursors: [
      "Working at Height Without Protection",
      "Missing PPE",
    ],
    hazards: ["Fall from Height", "Fatal Injury"],
    recommendations: [
      "Stop work immediately — worker must descend and put on harness.",
      "Issue formal safety warning and document violation.",
      "Conduct toolbox talk on fall protection requirements.",
    ],
    explanation:
      "Worker at 8m height without fall arrest harness is a textbook SIF precursor for fatal fall-from-height incidents.",
  },
  {
    title: "Chemical leak detected in storage room B",
    description:
      "Strong chemical smell and visible liquid pooling under shelf unit 5 in Storage Room B. Label indicates sulfuric acid (H2SO4). No spill kit visible. Two workers were in the room without respirators.",
    location: "Storage Room B, Chemical Warehouse",
    category: "chemical_exposure",
    severity: "high",
    riskScore: 65,
    riskLevel: "HIGH",
    sifProbability: 0.62,
    precursors: [
      "Chemical Exposure Without PPE",
      "Uncontrolled Chemical Release",
    ],
    hazards: ["Chemical Burns", "Respiratory Damage", "Fire Risk"],
    recommendations: [
      "Evacuate immediate area and seal off storage room.",
      "Deploy spill containment kit with appropriate acid neutralizer.",
      "Ensure all workers in contact have medical assessment.",
    ],
    explanation:
      "Sulfuric acid exposure without respiratory protection represents a serious SIF precursor with potential for severe chemical burns and respiratory damage.",
  },
  {
    title: "Forklift operating in unmarked pedestrian zone",
    description:
      "Forklift truck FLK-07 observed operating at speed in the loading bay where pedestrian lane markings have faded. Three workers were walking in the area without awareness of the forklift.",
    location: "Loading Bay, Warehouse Unit 2",
    category: "unsafe_condition",
    severity: "high",
    riskScore: 72,
    riskLevel: "HIGH",
    sifProbability: 0.69,
    precursors: [
      "Struck-By Moving Equipment",
      "Inadequate Traffic Management",
    ],
    hazards: ["Struck-By Injury", "Crush Injury", "Fatal Collision"],
    recommendations: [
      "Immediately re-paint pedestrian lane demarcations.",
      "Install physical barriers or anti-collision proximity sensors on FLK-07.",
      "Assign spotter for forklift operations until barriers are in place.",
    ],
    explanation:
      "Forklift and pedestrian interaction without proper separation is a leading cause of struck-by fatalities in warehouse environments.",
  },
  {
    title: "Pressure gauge showing dangerously high reading",
    description:
      "Pressure gauge on Boiler Unit B-12 reading 18.4 bar — operating limit is 14 bar. Alarm indicator is lit but audible alarm appears to have been disabled.",
    location: "Boiler Room B, Unit B-12",
    category: "equipment_failure",
    severity: "critical",
    riskScore: 85,
    riskLevel: "CRITICAL",
    sifProbability: 0.83,
    precursors: [
      "Bypassed Safety Device",
      "Pressure System Overpressure",
      "Uncontrolled Energy Release",
    ],
    hazards: ["Explosion", "Pressure Wave Injury", "Burns"],
    recommendations: [
      "Shut down boiler B-12 and reduce pressure to safe operating range immediately.",
      "Investigate why audible alarm was disabled — disciplinary action if deliberate.",
      "Full inspection of pressure relief valve before restart.",
    ],
    explanation:
      "Overpressure condition with a disabled safety alarm meets the definition of a bypassed safety device — one of the highest-weight SIF precursors in industrial settings.",
  },
  {
    title: "Slippery floor near equipment entrance — no signage",
    description:
      "Water accumulation near entrance to Machine Room 3 after cleaning. Floor is visibly wet. No wet floor signage in place. Workers regularly pass through this area.",
    location: "Machine Room 3 Entrance",
    category: "unsafe_condition",
    severity: "medium",
    riskScore: 35,
    riskLevel: "MEDIUM",
    sifProbability: 0.28,
    precursors: [],
    hazards: ["Slip and Fall", "Sprain Injury"],
    recommendations: [
      "Place wet floor warning signs immediately.",
      "Schedule drainage review for entrance area.",
      "Add non-slip matting near Machine Room 3 entrance.",
    ],
    explanation:
      "Slippery floor without warning signage is a common cause of workplace slips. Risk is moderate — no major SIF precursors detected.",
  },
  {
    title: "Frayed extension cord used in workshop area",
    description:
      "Extension cord with visible fraying and exposed conductors found in use at Workshop 2 bench station. Cord is running under a metal workbench.",
    location: "Workshop 2, Bench Station 4",
    category: "unsafe_condition",
    severity: "medium",
    riskScore: 42,
    riskLevel: "MEDIUM",
    sifProbability: 0.38,
    precursors: ["Energized Equipment Exposure"],
    hazards: ["Electrical Shock", "Fire"],
    recommendations: [
      "Remove frayed extension cord from service immediately.",
      "Replace with properly rated industrial-grade cord.",
      "Schedule electrical audit of all extension cord use in workshop.",
    ],
    explanation:
      "Frayed wiring with exposed conductors is an electrical hazard. Risk scored MEDIUM given controlled indoor environment and lack of proximity to water.",
  },
  {
    title: "Near miss — tool dropped from elevated platform",
    description:
      "A wrench was dropped from the elevated maintenance platform on Level 3. It fell approximately 6 meters. No one was struck, but two workers were in the drop zone below at the time.",
    location: "Level 3 Maintenance Platform, Assembly Hall",
    category: "near_miss",
    severity: "low",
    riskScore: 18,
    riskLevel: "LOW",
    sifProbability: 0.12,
    precursors: [],
    hazards: ["Struck-By Object", "Head Injury"],
    recommendations: [
      "Implement tool tethering policy for all elevated work.",
      "Establish exclusion zone below elevated work areas.",
      "Conduct near-miss debrief with involved workers.",
    ],
    explanation:
      "Near miss with dropped tool — no injury occurred. Risk scored LOW. However, near-miss reporting culture is positive and should be encouraged.",
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/foresite";
    console.log(`🌱 Connecting to MongoDB at ${mongoUri.replace(/:[^:@]+@/, ":****@")}...`);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected");

    // ── Clear existing demo data ──────────────────────────────────────────────
    const demoEmails = DEMO_USERS.map((u) => u.email);
    const existingDemoUsers = await User.find({ email: { $in: demoEmails } });
    const existingDemoUserIds = existingDemoUsers.map((u) => u._id);

    if (existingDemoUserIds.length > 0) {
      await Report.deleteMany({ submittedBy: { $in: existingDemoUserIds } });
      const existingReports = await Report.find({
        submittedBy: { $in: existingDemoUserIds },
      });
      const existingReportIds = existingReports.map((r) => r._id);
      await RiskAssessment.deleteMany({
        reportId: { $in: existingReportIds },
      });
      await Alert.deleteMany({ reportId: { $in: existingReportIds } });
      await MaintenanceTask.deleteMany({
        reportId: { $in: existingReportIds },
      });
      await User.deleteMany({ email: { $in: demoEmails } });
      console.log("🗑️  Cleared existing demo data");
    }

    // ── Create demo users ─────────────────────────────────────────────────────
    console.log("👤 Creating demo users...");
    const createdUsers = {};

    for (const userData of DEMO_USERS) {
      const hashed = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashed });
      createdUsers[userData.role] = user;
      console.log(`   ✅ ${userData.role}: ${userData.email} / demo1234`);
    }

    const workerId = createdUsers["worker"]._id;
    const officerId = createdUsers["safety_officer"]._id;
    const maintenanceId = createdUsers["maintenance"]._id;

    // ── Create reports and risk assessments ───────────────────────────────────
    console.log("📝 Creating sample reports...");
    const createdReports = [];

    for (const reportData of SAMPLE_REPORTS) {
      const {
        riskScore, riskLevel, sifProbability, precursors,
        hazards, recommendations, explanation,
        ...reportFields
      } = reportData;

      const report = await Report.create({
        ...reportFields,
        submittedBy: workerId,
        status: "analysis_complete",
      });

      await RiskAssessment.create({
        reportId: report._id,
        riskScore,
        riskLevel,
        sifProbability,
        precursors,
        hazards,
        recommendations,
        explanation,
        modelVersion: "v1.1-seed",
        processingTimeMs: Math.floor(Math.random() * 800) + 200,
        isFallback: false,
        extractionFallback: false,
      });

      // Create alerts for HIGH and CRITICAL
      if (["HIGH", "CRITICAL"].includes(riskLevel)) {
        await Alert.create({
          reportId: report._id,
          riskLevel,
          riskScore,
          sifProbability,
          message: `${riskLevel}: ${reportFields.title} — SIF precursors detected. Immediate action required.`,
          isAcknowledged: false,
        });
      }

      createdReports.push({ report, riskLevel });
      console.log(`   ✅ [${riskLevel}] ${reportFields.title.substring(0, 50)}...`);
    }

    // ── Create sample maintenance tasks ───────────────────────────────────────
    console.log("🔧 Creating maintenance tasks...");

    const criticalReport = createdReports.find(
      (r) => r.riskLevel === "CRITICAL"
    );
    const highReport = createdReports.find((r) => r.riskLevel === "HIGH");

    if (criticalReport) {
      const task = await MaintenanceTask.create({
        reportId: criticalReport.report._id,
        title: "Replace exposed electrical wiring in Sector 4",
        description:
          "Immediately isolate the circuit. Replace stripped copper wiring with properly rated insulated cable. Apply lockout/tagout procedure during repair. Verify with electrical test equipment before re-energizing.",
        assignedTo: maintenanceId,
        assignedBy: officerId,
        priority: "critical",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: "in_progress",
      });
      await Report.findByIdAndUpdate(criticalReport.report._id, {
        status: "action_assigned",
      });
      console.log(
        `   ✅ Task created for CRITICAL report (status: in_progress)`
      );
    }

    if (highReport) {
      const task = await MaintenanceTask.create({
        reportId: highReport.report._id,
        title: "Address scaffolding fall protection violation at Block 3",
        description:
          "Inspect all harness attachment points on Block 3 scaffolding. Provide refresher fall protection training. Install additional anchor points as required. Document compliance.",
        assignedTo: maintenanceId,
        assignedBy: officerId,
        priority: "high",
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        status: "assigned",
      });
      await Report.findByIdAndUpdate(highReport.report._id, {
        status: "action_assigned",
      });
      console.log(`   ✅ Task created for HIGH report (status: assigned)`);
    }

    console.log("\n✅ Seed complete!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  DEMO ACCOUNTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    DEMO_USERS.forEach((u) => {
      console.log(`  ${u.role.padEnd(18)} ${u.email.padEnd(22)} demo1234`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Reports: ${SAMPLE_REPORTS.length} (2 CRITICAL, 3 HIGH, 2 MEDIUM, 1 LOW)`);
    console.log(`  Alerts:  5 (HIGH + CRITICAL reports)`);
    console.log(`  Tasks:   2 (in_progress + assigned)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

seed();
