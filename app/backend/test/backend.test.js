const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

// Utilities & constants
const ApiError = require("../src/utils/ApiError");
const { ROLES } = require("../src/utils/constants");
const { success, successPaginated, error } = require("../src/utils/respond");
const roleGuard = require("../src/middleware/roleGuard");
const { analyzeReport } = require("../src/services/aiService");

test("ROLES constants match ForeSite specifications", () => {
  assert.equal(ROLES.WORKER, "worker");
  assert.equal(ROLES.SAFETY_OFFICER, "safety_officer");
  assert.equal(ROLES.MAINTENANCE, "maintenance");
  assert.equal(ROLES.ADMIN, "admin");
});

test("ApiError creates operational error with correct HTTP status codes", () => {
  const badReq = ApiError.badRequest("Invalid input");
  assert.equal(badReq.statusCode, 400);
  assert.equal(badReq.message, "Invalid input");
  assert.equal(badReq.isOperational, true);

  const unauth = ApiError.unauthorized("Token missing");
  assert.equal(unauth.statusCode, 401);

  const forbidden = ApiError.forbidden("Access denied");
  assert.equal(forbidden.statusCode, 403);

  const notFound = ApiError.notFound("Report not found");
  assert.equal(notFound.statusCode, 404);

  const conflict = ApiError.conflict("Email taken");
  assert.equal(conflict.statusCode, 409);

  const badGateway = ApiError.badGateway("AI service unreachable");
  assert.equal(badGateway.statusCode, 502);
});

test("Response envelope helpers format data according to api-contract.md", () => {
  // Mock Express response object
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return res;
  };

  // Success envelope
  const res1 = createMockRes();
  success(res1, { id: "123", title: "Test Report" }, 201);
  assert.equal(res1.statusCode, 201);
  assert.deepEqual(res1.jsonData, {
    success: true,
    data: { id: "123", title: "Test Report" },
  });

  // Paginated envelope
  const res2 = createMockRes();
  const pagination = { total: 45, page: 1, limit: 20, totalPages: 3 };
  successPaginated(res2, [{ id: "1" }], pagination);
  assert.equal(res2.statusCode, 200);
  assert.equal(res2.jsonData.success, true);
  assert.deepEqual(res2.jsonData.pagination, pagination);

  // Error envelope
  const res3 = createMockRes();
  error(res3, "Something went wrong", 400);
  assert.equal(res3.statusCode, 400);
  assert.deepEqual(res3.jsonData, {
    success: false,
    message: "Something went wrong",
  });
});

test("roleGuard middleware permits allowed roles and blocks forbidden roles", () => {
  const guard = roleGuard(["safety_officer", "admin"]);

  // 1. Allowed role: safety_officer
  let nextCalled = false;
  const reqOfficer = { user: { role: "safety_officer", name: "Officer" } };
  guard(reqOfficer, {}, (err) => {
    assert.equal(err, undefined);
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  // 2. Allowed role: admin
  nextCalled = false;
  const reqAdmin = { user: { role: "admin", name: "Admin" } };
  guard(reqAdmin, {}, (err) => {
    assert.equal(err, undefined);
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  // 3. Disallowed role: worker
  const reqWorker = { user: { role: "worker", name: "Worker" } };
  guard(reqWorker, {}, (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 403);
  });

  // 4. Missing user (unauthenticated)
  guard({}, {}, (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.statusCode, 401);
  });
});

test("aiService returns contract-compliant risk assessment when AI service is offline", async () => {
  // Test fallback assessment with a critical-keyword report
  const sampleReport = {
    _id: "64b2c3d4e5f6a7b8c9d0e2f3",
    title: "Exposed electrical wiring near water pump",
    description: "Found bare copper wiring near water pump. High voltage live electric cable stripped.",
    location: "Sector 4",
    category: "unsafe_condition",
    severity: "critical",
  };

  const result = await analyzeReport(sampleReport);

  assert.ok(result);
  assert.equal(typeof result.riskScore, "number");
  assert.ok(result.riskScore >= 0 && result.riskScore <= 100);
  assert.ok(["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(result.riskLevel));
  assert.equal(typeof result.sifProbability, "number");
  assert.ok(result.sifProbability >= 0 && result.sifProbability <= 1);
  assert.ok(Array.isArray(result.precursors));
  assert.ok(Array.isArray(result.hazards));
  assert.ok(Array.isArray(result.recommendations));
  assert.ok(result.recommendations.length > 0);
  assert.equal(typeof result.explanation, "string");
  assert.equal(result.isFallback, true);
  assert.equal(result.extractionFallback, true);
});

test("JWT token signing and verification roundtrip works", () => {
  const secret = "test-secret-key-for-unit-tests-only";
  const user = { _id: "64a1b2c3d4e5f6a7b8c9d0e1", role: "worker" };

  const token = jwt.sign({ userId: user._id, role: user.role }, secret, {
    expiresIn: "1h",
  });
  assert.ok(token);

  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.userId, user._id);
  assert.equal(decoded.role, "worker");
});

test("Model re-exports MaintainanceTask and Roles are functional", () => {
  const typoModel = require("../src/models/MaintainanceTask");
  const canonicalModel = require("../src/models/MaintenanceTask");
  assert.equal(typoModel, canonicalModel);

  const rolesModel = require("../src/models/Roles");
  assert.equal(rolesModel.WORKER, "worker");
});

test("auth middleware blocks requests with missing or malformed Authorization header", async () => {
  const auth = require("../src/middleware/auth");

  // 1. Missing header
  const reqNoHeader = { headers: {} };
  await new Promise((resolve) => {
    auth(reqNoHeader, {}, (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, "No token provided");
      resolve();
    });
  });

  // 2. Non-Bearer header
  const reqBasic = { headers: { authorization: "Basic 12345" } };
  await new Promise((resolve) => {
    auth(reqBasic, {}, (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, "No token provided");
      resolve();
    });
  });

  // 3. Invalid token
  const reqInvalid = { headers: { authorization: "Bearer invalid.jwt.token" } };
  await new Promise((resolve) => {
    auth(reqInvalid, {}, (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, "Invalid or expired token");
      resolve();
    });
  });
});
