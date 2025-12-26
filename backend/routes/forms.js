const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const SharedField = require('../models/SharedField');

// Get all forms for an employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const forms = await Form.find({ employeeId: req.params.employeeId });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shared field values for auto-fill
router.post('/shared-values', async (req, res) => {
  try {
    const { fieldNames, employeeId } = req.body;

    const sharedValues = {};

    for (const fieldName of fieldNames) {
      const sharedField = await SharedField.findOne({ fieldName });

      if (sharedField && sharedField.values.length > 0) {
        // Filter by employee if needed, or return all values
        const employeeValues = sharedField.values.filter(v => v.employeeId === employeeId);

        if (employeeValues.length > 0) {
          sharedValues[fieldName] = employeeValues.map(v => ({
            value: v.value,
            lastUpdated: v.lastUpdated
          }));
        } else if (sharedField.values.length > 0) {
          // Return all values if no employee-specific values found
          sharedValues[fieldName] = sharedField.values.map(v => ({
            value: v.value,
            lastUpdated: v.lastUpdated,
            employeeId: v.employeeId
          }));
        }
      }
    }

    res.json(sharedValues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  try {
    const { formType, employeeId, employeeName, fields } = req.body;

    const form = new Form({
      formType,
      employeeId,
      employeeName,
      fields: new Map(Object.entries(fields))
    });

    const savedForm = await form.save();

    // Update shared fields
    for (const [fieldName, value] of Object.entries(fields)) {
      let sharedField = await SharedField.findOne({ fieldName });

      if (!sharedField) {
        sharedField = new SharedField({
          fieldName,
          values: []
        });
      }

      // Check if this value already exists for this employee
      const existingIndex = sharedField.values.findIndex(
        v => v.employeeId === employeeId && JSON.stringify(v.value) === JSON.stringify(value)
      );

      if (existingIndex === -1) {
        // Add new value
        sharedField.values.push({
          value,
          formId: savedForm._id,
          employeeId,
          lastUpdated: new Date()
        });
      } else {
        // Update existing value
        sharedField.values[existingIndex].lastUpdated = new Date();
        sharedField.values[existingIndex].formId = savedForm._id;
      }

      await sharedField.save();
    }

    res.status(201).json(savedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a form
router.put('/:id', async (req, res) => {
  try {
    const { fields } = req.body;

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      {
        fields: new Map(Object.entries(fields)),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Update shared fields
    for (const [fieldName, value] of Object.entries(fields)) {
      let sharedField = await SharedField.findOne({ fieldName });

      if (!sharedField) {
        sharedField = new SharedField({
          fieldName,
          values: []
        });
      }

      const existingIndex = sharedField.values.findIndex(
        v => v.formId.toString() === req.params.id
      );

      if (existingIndex !== -1) {
        sharedField.values[existingIndex].value = value;
        sharedField.values[existingIndex].lastUpdated = new Date();
      } else {
        sharedField.values.push({
          value,
          formId: form._id,
          employeeId: form.employeeId,
          lastUpdated: new Date()
        });
      }

      await sharedField.save();
    }

    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
