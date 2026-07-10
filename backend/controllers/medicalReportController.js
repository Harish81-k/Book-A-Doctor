import MedicalReport from '../models/MedicalReport.js';

export const getMyReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patient: req.user._id })
      .populate('doctor')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadReport = async (req, res) => {
  try {
    // Note: Assuming file upload is handled by a middleware (like multer) 
    // and file info is in req.file or req.body.file_url if using a third-party service.
    
    // For this migration, we'll support receiving the URL in the body since 
    // the frontend might have its own mechanism, or we can use the local static uploads.
    
    const { title, file_url, file_type } = req.body;
    
    const report = await MedicalReport.create({
      patient: req.user._id,
      title,
      file_url,
      file_type
    });
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (report) {
      if (report.patient.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this report' });
      }
      await report.deleteOne();
      res.json({ message: 'Report removed' });
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
