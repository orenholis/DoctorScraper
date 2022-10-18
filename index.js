const puppeteer = require("puppeteer");
const fs = require('fs');

const URL = "https://www.dent.cz/zubni-lekari";

async function getData() {
	try {
		const browser = await puppeteer.launch({slowMo: 300});
		const page = await browser.newPage();
		await page.goto(URL);
		await page.waitForSelector('div.cross-cross-dentists-list', {timeout: 5000})

		const data = await page.evaluate(() => {
			const items = document.querySelectorAll(".cross-dentists-list__item");
			return [...items].map(item => {
				const text = item.querySelector('p').childNodes;
				let address = text.length > 5 ?
					(text[0].textContent || '') + ', ' + (text[5].textContent || '') + ', ' + (text[3].textContent || '') :
					'';
				const phone = text.length > 7 ? text[7].querySelector('a')?.textContent || '' : '';
				const email = text.length > 8 ? text[8].querySelector('a')?.textContent || '' : '';
				const title = item.querySelector('h3');
				const web = location.origin + title.querySelector('a').getAttribute('href');

				return {
					title: title.innerText,
					address: address,
					phone,
					email,
					web
				}
			});
		});

		const rows = [];

		for (const r of data) {
			rows.push(`${r.title};${r.address};${r.phone};${r.email};${r.web}\n`)
		}

		fs.writeFileSync('./doctors.csv', `title/name;address;email;phone;web\n${rows.join('')}`);

		await page.close();
		await browser.close();
	} catch (error) {
		console.error(error);
	}
}

getData();