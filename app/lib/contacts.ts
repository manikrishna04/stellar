import { v4 as uuidv4 } from "uuid";

export interface Contact {
  id: string;
  name: string;
  address: string;
  addedAt: number;
}

export const getContacts = (): Contact[] => {
  const saved = localStorage.getItem("gb_contacts");
  return saved ? JSON.parse(saved) : [];
};

export const saveContact = (name: string, address: string): Contact[] => {
  const contacts = getContacts();
  const newContact: Contact = {
    id: uuidv4(),
    name,
    address,
    addedAt: Date.now()
  };
  const updated = [newContact, ...contacts];
  localStorage.setItem("gb_contacts", JSON.stringify(updated));
  return updated;
};

export const deleteContact = (id: string): Contact[] => {
  const contacts = getContacts();
  const updated = contacts.filter(c => c.id !== id);
  localStorage.setItem("gb_contacts", JSON.stringify(updated));
  return updated;
};