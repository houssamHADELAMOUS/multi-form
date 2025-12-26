const mongoose = require('mongoose');

const sharedFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    unique: true
  },
  values: [{
    value: mongoose.Schema.Types.Mixed,
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form'
    },
    employeeId: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('SharedField', sharedFieldSchema);
