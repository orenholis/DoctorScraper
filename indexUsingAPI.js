const axios = require('axios');
const fs = require("fs");
const URL = 'https://is-api.dent.cz';
const ENDPOINT = '/api/v1/web/workplaces';

async function loadDentists() {
	const reqPayload = {
		"deleted": false,
		"sort_fields":"name"
	}

	// Getting number of dentists
	const numberOfDentists = (await axios.post(URL + ENDPOINT, {
		...reqPayload,
		"per_page": 1,
	}))?.data.pagination.object_count || 0;

	const data = await axios.post(URL + ENDPOINT, {
		...reqPayload,
		"per_page": numberOfDentists,
	})

	const rows = [];

	for (const row of data.data.data) {
		const contact = row.contact;
		const phone = contact.phone1 + (contact.phone2 ? `, ${contact.phone2}` : '');
		const email = contact.email1 + (contact.email2 ? `, ${contact.email2}` : '');
		const web = URL + ENDPOINT + '/' + row.id;

		rows.push(`${row.name};${row.address.print};${phone};${email};${web}\n`)
	}

	fs.writeFileSync('./doctors.csv', `title/name;address;email;phone;web\n${rows.join('')}`);

}

loadDentists();