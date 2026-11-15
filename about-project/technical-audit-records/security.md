# Security Architecture, Controls & Vulnerability Audit

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  

---

## 1. Authentication & Password Security

### 1.1 Password Hashing
- **Library:** `bcryptjs` v2.4.3 ([server/package.json:13](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L13))
- **Salt Rounds:** **10 rounds**
- **Implementation:** Pre-save Mongoose hook in [server/src/models/User.js:40-46](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L40-L46):

```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

- **Password Verification Method:** [server/src/models/User.js:48-51](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L48-L51):

```javascript
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 1.2 JWT Token Generation & Expiry
- **Library:** `jsonwebtoken` v9.0.2 ([server/package.json:18](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L18))
- **Token Expiration:** **7 days (`'7d'`)**
- **Token Generation:** [server/src/controllers/authController.js:6-16](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js#L6-L16):

```javascript
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

- **Secret Key Resolution & Hardcoded Fallback:**  
  The secret is retrieved from `process.env.JWT_SECRET` in two locations:
  1. [server/src/controllers/authController.js:4](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js#L4):  
     `const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_green_agri_key_2026';`
  2. [server/src/middleware/auth.js:3](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/auth.js#L3):  
     `const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_green_agri_key_2026';`

---

## 2. Role-Based Access Control (RBAC) & Authorization

### 2.1 RBAC Middleware Implementation
- **Source File:** [server/src/middleware/role.js:7-21](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/role.js#L7-L21)

```javascript
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required. Access denied.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        message: `Forbidden: this action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
};
```

### 2.2 Ownership Verification Controls
- **Farmer Produce Ownership Guard:** [server/src/controllers/productController.js:79-84](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/productController.js#L79-L84):
  `if (product.farmerId.toString() !== req.user.id && req.user.role !== 'admin') { return res.status(403).json({ message: 'Not authorized to update this product.' }); }`
- **Payment Review Ownership Guard:** [server/src/controllers/paymentAndFulfilmentController.js:79-83](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/paymentAndFulfilmentController.js#L79-L83):
  `if (proof.farmerId.toString() !== req.user.id && req.user.role !== 'admin') { return res.status(403).json({ message: 'Not authorized to review this payment proof.' }); }`

---

## 3. Upload Controls, File Filters & Size Limits

### 3.1 Leaf Disease Image Upload
- **Source File:** [server/src/middleware/upload.js:23-36](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/upload.js#L23-L36)
- **Size Limit:** `10 * 1024 * 1024` bytes (**10 MB**)
- **File Filter:**
  ```javascript
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
    }
  };
  ```

### 3.2 Marketplace Produce & Payment Proof Uploads
- **Source File:** [server/src/middleware/marketplaceUpload.js:28-40](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/marketplaceUpload.js#L28-L40)
- **Size Limit:** `10 * 1024 * 1024` bytes (**10 MB**)
- **File Filter:** Checks `file.mimetype.startsWith('image/')`.

### 3.3 ML Microservice Payload Safety Check
- **Source File:** [ml-services/plant-pipeline/service/app.py:24, 40-50](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L24)
- **Size Limit:** `MAX_BYTES = int(float(os.getenv("MAX_IMAGE_MB", "12")) * 1024 * 1024)` (**12 MB**)
- **Pillow Image Verification:** `Image.open(io.BytesIO(data)); img.load()` catches `UnidentifiedImageError`, `OSError`, and `Image.DecompressionBombError`.

---

## 4. CORS & Network Boundaries

### 4.1 Node.js Backend CORS
- **Source File:** [server/src/app.js:17](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js#L17)
- **Configuration:** `app.use(cors());`
- **Assessment:** Unrestricted wildcard CORS. Allows cross-origin requests from any domain origin without whitelist restrictions.

### 4.2 Python FastAPI CORS
- **Source File:** [ml-services/plant-pipeline/service/app.py:36-37](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L36-L37)
- **Configuration:** `app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","), allow_methods=["*"], allow_headers=["*"])`
- **Assessment:** Defaults to `*` (wildcard) if `CORS_ORIGINS` is not defined in the environment.

---

## 5. Security Gaps & Vulnerability Analysis

| Vulnerability / Security Gap | Severity | Code Location | Factual Evidence & Risk Description |
|---|:---:|---|---|
| **Hardcoded JWT Secret Fallback** | Medium | [server/src/controllers/authController.js:4](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js#L4), [server/src/middleware/auth.js:3](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/auth.js#L3) | `const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_green_agri_key_2026';`. If the environment variable is missing, production deployments fall back to a public repository string. |
| **No Rate Limiting** | High | [server/package.json](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json), [server/src/app.js](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js) | No rate-limiting package (`express-rate-limit`) is installed. Endpoints `/api/auth/login`, `/api/auth/register`, and `/api/disease-detection/detect` are vulnerable to brute-force attacks and denial-of-service. |
| **Token In LocalStorage (XSS Exposure)** | Medium | [client/src/context/AuthContext.jsx:19](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/context/AuthContext.jsx#L19) | `localStorage.setItem('token', token);`. Tokens stored in browser localStorage are accessible to malicious client-side JavaScript in the event of an XSS injection, unlike `HttpOnly` cookies. |
| **No Token Revocation / Blacklisting** | Low | [server/src/controllers/authController.js](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js) | Tokens remain valid for the full 7-day duration even after the user logs out from the client. |
| **Unrestricted Wildcard CORS** | Low | [server/src/app.js:17](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js#L17) | `app.use(cors())` permits arbitrary third-party websites to make credential-bearing or API calls against the server. |
| **Missing Magic-Byte File Validation** | Medium | [server/src/middleware/upload.js:24-28](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/upload.js#L24-L28) | Multer filters rely exclusively on client-provided `file.mimetype` headers (`file.mimetype.startsWith('image/')`), which can be spoofed to upload arbitrary files to disk before the ML service inspects them. |
| **Ad-Hoc Input Validation** | Medium | [server/src/controllers/cropController.js:9-19](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/cropController.js#L9-L19) | No formal schema validation library (`joi`, `zod`, or `express-validator`). Crop parameter endpoint checks `=== undefined` but does not bound numerical ranges (e.g. soil pH outside 0-14, negative rainfall, or `NaN`). |
| **Weak Password Complexity Policy** | Low | [server/src/models/User.js:20-22](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L20-L22) | Only enforces `minlength: 6`. Does not require numbers, uppercase letters, or special characters. |

