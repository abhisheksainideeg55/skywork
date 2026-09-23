import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all documents
 * @route   GET /api/documents
 */
export const getDocuments = async (req, res) => {
  try {
    const { employeeId, documentType, verificationStatus, search } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (documentType) filter.documentType = documentType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { documentName: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents,
      meta: {
        total: documents.length,
        verified: documents.filter((d) => d.verificationStatus === 'Verified').length,
        pending: documents.filter((d) => d.verificationStatus === 'Pending').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Upload / create document record
 * @route   POST /api/documents
 */
export const uploadDocument = async (req, res) => {
  try {
    let documentId = req.body.documentId;
    if (!documentId || (await Document.findOne({ documentId }))) {
      documentId = `DOC-${Date.now().toString().slice(-6)}`;
    }

    let fileUrl = req.body.fileUrl || '';
    let fileName = req.body.fileName || '';
    let fileSize = req.body.fileSize || '1.8 MB';
    let mimeType = req.body.mimeType || 'application/pdf';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = `${(req.file.size / 1024).toFixed(1)} KB`;
      mimeType = req.file.mimetype;
    }

    const document = new Document({
      ...req.body,
      documentId,
      fileUrl,
      fileName: fileName || req.body.documentName,
      fileSize,
      mimeType,
      uploadedBy: req.user?.name || req.body.uploadedBy || 'HR Admin',
    });

    await document.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'User',
      action: 'DOCUMENT_UPLOADED',
      resource: 'Document',
      resourceId: document.documentId,
      details: { documentName: document.documentName, employeeId: document.employeeId },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: document, message: 'Document uploaded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify / reject document
 * @route   PUT /api/documents/:id/verify
 */
export const verifyDocument = async (req, res) => {
  try {
    const { verificationStatus, remarks } = req.body;

    const document = await Document.findOne({
      $or: [{ _id: req.params.id }, { documentId: req.params.id }],
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.verificationStatus = verificationStatus;
    document.verifiedBy = req.user?.name || 'HR Admin';
    document.verifiedAt = new Date();
    if (remarks) document.remarks = remarks;

    await document.save();

    await AuditLog.create({
      userId: req.user?.id || 'SYSTEM',
      userRole: req.user?.role || 'Admin',
      userName: req.user?.name || 'HR Admin',
      action: `DOCUMENT_${verificationStatus.toUpperCase()}`,
      resource: 'Document',
      resourceId: document.documentId,
      details: { verificationStatus, remarks },
      status: 'SUCCESS',
    });

    res.json({ success: true, data: document, message: `Document marked as ${verificationStatus}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      $or: [{ _id: req.params.id }, { documentId: req.params.id }],
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
