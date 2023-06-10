const express = require("express");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");
const router = express.Router();
const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).required(),
});

router.get("/", async (req, res) => {
  const contacts = await listContacts();
  res.status(200).json(contacts);
});

router.get("/:id", async (req, res) => {
  const contact = await getContactById(req.params.id);
  if (!contact) res.status(404).json({ message: "Not found" });
  else res.status(200).json(contact);
});

router.post("/", async (req, res) => {
  try {
    const { value, error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json(error.message);
    } else {
      await addContact(value);
      res.status(201).json(value);
    }
  } catch (err) {
    res.status(490).json(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  const status = removeContact(req.params.id);
  if (status) res.status(200).json({ message: "contact deleted" });
  else res.status(404).json({ message: "Contact not found" });
});

const updatedContactSchema = Joi.object()
  .keys({
    name: Joi.string().min(3),
    email: Joi.string().email().min(3),
    phone: Joi.string().min(3),
  })
  .or("name", "email", "phone");

router.put("/:id", async (req, res) => {
  try {
    const { error } = updatedContactSchema.validate(req.body);
    if (error) res.status(400).json(error.message);
    else {
      const updatedContact = await updateContact(req.params.id, req.body);
      if (!updatedContact) res.status(404).json({ message: "contact not found" });
      else res.status(200).json(updatedContact);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
