const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");
const contactsPath = path.join(__dirname, "contacts.json");
console.log(contactsPath);

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath);
  const parsedContacts = JSON.parse(contacts);
  return parsedContacts;
};

const getContactById = async contactId => {
  const contacts = await listContacts();
  const contact = contacts.find(contact => contact.id === contactId);
  return contact;
};

const removeContact = async contactId => {
  const contacts = await listContacts();
  const filteredContacts = contacts.filter(contact => contact.id !== contactId);
  if (contacts.length > filteredContacts.length) {
    fs.writeFile(contactsPath, JSON.stringify(filteredContacts, null, 1));
    return true;
  }
  return false;
};

const addContact = async body => {
  const id = nanoid();
  const newContact = { id, ...body };
  const contacts = await listContacts();
  contacts.push(newContact);
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 1));
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex(contact => contact.id === contactId);
  if (index === -1) return false;
  const updatedContact = { ...contacts[index], ...body };
  contacts[index] = updatedContact;
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 1));
  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
