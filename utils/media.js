// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Define allowed file types with their valid extensions
// const ALLOWED_FILE_TYPES = {
//   'image/jpeg': ['jpg', 'jpeg'],
//   'image/jpg': ['jpg', 'jpeg'],
//   'image/png': ['png'],
//   'image/webp': ['webp'],
//   'application/pdf': ['pdf'],
// };

// // PDF Security Check Function
// async function checkPDFSecurity(buffer) {
//   try {
//     const fileContent = buffer.toString();

//     const securityChecks = {
//       hasJavaScript: false,
//       hasEncryption: false,
//       hasEmbeddedFiles: false,
//       hasAcroForms: false,
//       suspiciousPatterns: [],
//       headerCheck: false,
//     };

//     // Check PDF header
//     const pdfHeader = buffer.slice(0, 5).toString();
//     securityChecks.headerCheck = pdfHeader === '%PDF-';

//     if (!securityChecks.headerCheck) {
//       return {
//         success: false,
//         message: 'Invalid PDF format',
//       };
//     }

//     // Check for dangerous patterns
//     const patterns = {
//       javascript: ['/JS', '/JavaScript', '/AA', '/OpenAction'],
//       embedded: ['/EmbeddedFiles', '/EF'],
//       forms: ['/AcroForm'],
//       other: ['/Launch', '/SubmitForm', '/ImportData', '/RichMedia', '/XFA'],
//     };

//     Object.entries(patterns).forEach(([category, patternList]) => {
//       patternList.forEach((pattern) => {
//         if (fileContent.includes(pattern)) {
//           if (category === 'javascript') securityChecks.hasJavaScript = true;
//           if (category === 'embedded') securityChecks.hasEmbeddedFiles = true;
//           if (category === 'forms') securityChecks.hasAcroForms = true;
//           securityChecks.suspiciousPatterns.push(pattern);
//         }
//       });
//     });

//     if (fileContent.includes('/Encrypt')) {
//       securityChecks.hasEncryption = true;
//     }

//     const isHighRisk =
//       securityChecks.hasJavaScript ||
//       securityChecks.hasEmbeddedFiles ||
//       securityChecks.suspiciousPatterns.length > 0;
//     const isMediumRisk =
//       securityChecks.hasEncryption || securityChecks.hasAcroForms;

//     if (isHighRisk || isMediumRisk) {
//       return {
//         success: false,
//         message:
//           'PDF security check failed: Potentially unsafe content detected',
//       };
//     }

//     return { success: true };
//   } catch (error) {
//     return {
//       success: false,
//       message: 'Error checking PDF security: ' + error.message,
//     };
//   }
// }

// // Create uploads directory if it doesn't exist
// const uploadDir = './uploads';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const fileFilter = (req, file, cb) => {
//   // Get file extension from original filename
//   const extension = path.extname(file.originalname).toLowerCase().slice(1);

//   console.log(extension, 'extension');

//   // Check if mimetype is allowed
//   if (!ALLOWED_FILE_TYPES[file.mimetype]) {
//     return cb(
//       {
//         status: 400,
//         message: `File type not allowed.`,
//       },
//       false
//     );
//   }

//   // Check if extension matches the allowed extensions for the mimetype
//   const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype];
//   if (!allowedExtensions.includes(extension)) {
//     return cb(
//       {
//         status: 400,
//         message: `Invalid file extension.`,
//       },
//       false
//     );
//   }

//   // Accept the file - PDF security check will be done after upload
//   cb(null, true);
// };

// // Configure different upload destinations based on file type
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath = './uploads/';

//     // Create specific folders for different file types
//     if (file.mimetype.startsWith('image/')) {
//       uploadPath += 'images/';
//     } else if (file.mimetype === 'application/pdf') {
//       uploadPath += 'documents/';
//     }

//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Create unique filename while preserving original extension
//     const extension = path.extname(file.originalname).toLowerCase();
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + extension);
//   },
// });

// // Create multer upload instance
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
//   fileFilter: fileFilter,
// }).single('files');

// function getMulterErrorMessage(err) {
//   switch (err.code) {
//     case 'LIMIT_FILE_SIZE':
//       return 'File is too large. Maximum size allowed is 5MB';
//     case 'LIMIT_UNEXPECTED_FILE':
//       return 'Unexpected field name in upload. Please use "files" as the field name';
//     default:
//       return 'Error uploading file: ' + err.message;
//   }
// }

// // Wrapper middleware to handle multer errors
// const uploadMiddleware = async (req, res, next) => {
//   upload(req, res, async function (err) {
//     try {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({
//           success: false,
//           error: true,
//           message: getMulterErrorMessage(err),
//         });
//       } else if (err) {
//         return res.status(err.status || 400).json({
//           success: false,
//           error: true,
//           message: err.message,
//           details: err.error || null,
//         });
//       }

//       // If it's a PDF, perform security check after upload
//       if (req.file && req.file.mimetype === 'application/pdf') {
//         const buffer = fs.readFileSync(req.file.path);
//         const securityCheck = await checkPDFSecurity(buffer);

//         if (!securityCheck.success) {
//           // Remove the unsafe PDF file
//           fs.unlinkSync(req.file.path);
//           return res.status(400).json({
//             success: false,
//             error: true,
//             message: securityCheck.message,
//           });
//         }
//       }

//       next();
//     } catch (error) {
//       // Clean up on error
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(500).json({
//         success: false,
//         error: true,
//         message: 'Error processing file',
//         details: error.message,
//       });
//     }
//   });
// };

// module.exports = uploadMiddleware;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define allowed file types with their valid extensions
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/jpg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
};

// Updated PDF Security Check Function with more lenient rules
async function checkPDFSecurity(buffer) {
  try {
    const fileContent = buffer.toString();

    const securityChecks = {
      hasJavaScript: false,
      hasEncryption: false,
      hasEmbeddedFiles: false,
      hasAcroForms: false,
      suspiciousPatterns: [],
      headerCheck: false,
    };

    // Check PDF header
    const pdfHeader = buffer.slice(0, 5).toString();
    securityChecks.headerCheck = pdfHeader === '%PDF-';

    if (!securityChecks.headerCheck) {
      return {
        success: false,
        message: 'Invalid PDF format',
      };
    }

    // Check for dangerous patterns - Updated with less strict criteria
    const patterns = {
      // Only check for the most critical JavaScript-related patterns
      javascript: ['/OpenAction', '/AA'],

      // Reduced embedded file checks
      embedded: ['/EmbeddedFiles'],

      // Forms are now considered low risk
      forms: ['/AcroForm'],

      // Only check for the most dangerous actions
      other: ['/Launch'],
    };

    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach((pattern) => {
        if (fileContent.includes(pattern)) {
          if (category === 'javascript') securityChecks.hasJavaScript = true;
          if (category === 'embedded') securityChecks.hasEmbeddedFiles = true;
          if (category === 'forms') securityChecks.hasAcroForms = true;
          securityChecks.suspiciousPatterns.push(pattern);
        }
      });
    });

    // Check for encryption - now considered low risk
    if (fileContent.includes('/Encrypt')) {
      securityChecks.hasEncryption = true;
    }

    // Updated risk assessment - only most dangerous features are high risk
    const isHighRisk =
      securityChecks.hasJavaScript && fileContent.includes('/OpenAction'); // Only block if JavaScript has OpenAction

    const isMediumRisk =
      securityChecks.hasEmbeddedFiles ||
      (securityChecks.hasJavaScript && !fileContent.includes('/OpenAction')); // Other JavaScript is medium risk

    // Only fail for high-risk content
    if (isHighRisk) {
      return {
        success: false,
        message: 'PDF security check failed: High-risk content detected',
      };
    }

    // Medium risk content generates a warning but allows the file
    if (isMediumRisk) {
      return {
        success: true,
        warning: 'PDF contains potentially interactive content but is allowed',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'Error checking PDF security: ' + error.message,
    };
  }
}

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  // Get file extension from original filename
  const extension = path.extname(file.originalname).toLowerCase().slice(1);

  console.log(extension, 'extension');

  // Check if mimetype is allowed
  if (!ALLOWED_FILE_TYPES[file.mimetype]) {
    return cb(
      {
        status: 400,
        message: `File type not allowed.`,
      },
      false
    );
  }

  // Check if extension matches the allowed extensions for the mimetype
  const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype];
  if (!allowedExtensions.includes(extension)) {
    return cb(
      {
        status: 400,
        message: `Invalid file extension.`,
      },
      false
    );
  }

  // Accept the file - PDF security check will be done after upload
  cb(null, true);
};

// Configure different upload destinations based on file type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';

    // Create specific folders for different file types
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath += 'documents/';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename while preserving original extension
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extension);
  },
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
}).single('files');

function getMulterErrorMessage(err) {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return 'File is too large. Maximum size allowed is 5MB';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Unexpected field name in upload. Please use "files" as the field name';
    default:
      return 'Error uploading file: ' + err.message;
  }
}

// Wrapper middleware to handle multer errors
const uploadMiddleware = async (req, res, next) => {
  upload(req, res, async function (err) {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          error: true,
          message: getMulterErrorMessage(err),
        });
      } else if (err) {
        return res.status(err.status || 400).json({
          success: false,
          error: true,
          message: err.message,
          details: err.error || null,
        });
      }

      // If it's a PDF, perform security check after upload
      if (req.file && req.file.mimetype === 'application/pdf') {
        const buffer = fs.readFileSync(req.file.path);
        const securityCheck = await checkPDFSecurity(buffer);

        if (!securityCheck.success) {
          // Remove the unsafe PDF file
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            error: true,
            message: securityCheck.message,
          });
        }
      }

      next();
    } catch (error) {
      // Clean up on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        success: false,
        error: true,
        message: 'Error processing file',
        details: error.message,
      });
    }
  });
};
module.exports = uploadMiddleware;
