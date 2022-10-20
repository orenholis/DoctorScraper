import {AxiosResponse} from "axios";

const axios = require('axios');
const fs = require("fs");
const DENTISTS_URL: string = 'https://is-api.dent.cz';
const ENDPOINT: string = '/api/v1/web/workplaces';

interface Contact {
	email1: string;
	email2: string;
	full: string;
	phone1: string;
	phone2: string;
	web: string;
	deleted: boolean
}

interface Provider {
	id: string;
	name: string;
	is_also_member: boolean;
	registration_number: string;
	identification_number: string;
	type_cares: Array<any>;
}

interface Address {
	city: string;
	state: string;
	country_name: string;
	print: string;
	street: string;
	postcode: string;
	name: string;
}

interface RegionalChamber {
	id: string;
	name: string;
	checked: boolean;
	code: string;
	tooltip: string;
}

interface Dentist {
	id: string;
	name: string;
	regional_chamber: RegionalChamber;
	provider: Provider;
	accepts_new_patients: boolean;
	address: Address;
	contact: Contact;
	members: Array<any>;
	insurance_companies: Array<any>;
}

async function loadDentists(): Promise<void> {
	const reqPayload = {
		"deleted": false,
		"sort_fields":"name"
	}

	// Getting number of dentists
	const numberOfDentists: number = (await axios.post(DENTISTS_URL + ENDPOINT, {
		...reqPayload,
		"per_page": 1,
	}))?.data.pagination.object_count || 0;

	const resp: AxiosResponse = await axios.post(DENTISTS_URL + ENDPOINT, {
		...reqPayload,
		"per_page": numberOfDentists,
	})

	const rows: Array<string> = [];

	const dentists: Array<Dentist> = resp.data.data;

	for (const row of dentists) {
		const contact: Contact = row.contact;
		const phone: string = contact.phone1 + (contact.phone2 ? `, ${contact.phone2}` : '');
		const email: string = contact.email1 + (contact.email2 ? `, ${contact.email2}` : '');
		const web: string = contact.web || DENTISTS_URL + ENDPOINT + '/' + row.id;

		rows.push(`${row.name};${row.address.print};${phone};${email};${web}\n`)
	}

	fs.writeFileSync('./doctors.csv', `title/name;address;email;phone;web\n${rows.join('')}`);
}

loadDentists();