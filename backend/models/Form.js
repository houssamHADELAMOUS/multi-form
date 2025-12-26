const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
    enum: ['form1', 'form2', 'form3', 'form4', 'form5']
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  fields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast searching
formSchema.index({ employeeId: 1, formType: 1 });

module.exports = mongoose.model('Form', formSchema);
