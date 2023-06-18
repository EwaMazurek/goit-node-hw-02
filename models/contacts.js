const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");
const contactsPath = path.join(__dirname, "contacts.json");
console.log(contactsPath);

const Contact = require("./contactModel");

const listContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};

const getContactById = async contactId => {
  const contact = await Contact.findById(contactId);
  return contact;
};

const removeContact = async contactId => {
  const contactToDelete = Contact.findByIdAndDelete(contactId);
  return contactToDelete;
};

const addContact = async body => {
  const newContact = await Contact.create(body);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, body, { new: true }).exec();
  return updatedContact;
};

const updateStatusContact = async (contactId, body) => {
  const contactToUpdate = Contact.findByIdAndUpdate(contactId, body, { new: true }).exec();
  return contactToUpdate;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
