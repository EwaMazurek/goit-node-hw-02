const express = require("express");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");
const router = express.Router();
const Joi = require("joi");
const verifyToken = require("../../token");

const contactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).required(),
});
router.use(verifyToken);
router.get("/", async (req, res) => {
  const favorite = req.query.favorite;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  let contacts;
  if (favorite) {
    contacts = await listContacts({ favorite: favorite === "true" }, skip, limit);
  } else {
    contacts = await listContacts({}, skip, limit);
  }

  res.status(200).json(contacts);
});

router.get("/:id", async (req, res) => {
  try {
    const contact = await getContactById(req.params.id);
    res.status(200).json(contact);
  } catch (error) {
    res.status(404).json({ message: "Contact not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { value, error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json(error.message);
    } else {
      await addContact(value);
      console.log(value);
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
      if (!updatedContact) {
        res.status(404).json({ message: "Contact not found" });
      } else {
        res.status(200).json(updatedContact);
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/favorite", async (req, res) => {
  if (typeof req.body.favorite !== "boolean" || !req.body.favorite)
    res.status(400).json({ message: "missing field favorite" });
  else
    try {
      const contactTofavs = await updateStatusContact(req.params.id, req.body);
      if (contactTofavs) res.status(200).json(contactTofavs);
      else res.status(404).json({ message: "not found" });
    } catch (error) {
      res.status(500).json(error.message);
    }
});

router.get("");

module.exports = router;
