import { json2csv } from 'json-2-csv';
import MailChecker from 'mailchecker';
import Validator from 'validator';

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const { searchParams, pathname } = new URL(request.url);

        switch (pathname) {
            case "/submit": {
                if (request.headers.get('Content-Type') !== 'application/x-www-form-urlencoded') {
                    return new Response('Invalid content type', {
                        status: 400,
                    });
                }

                const formData = await request.formData();
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const email = formData.get('email');
                const phoneNumber = formData.get('phone');
                const dateOfBirth = formData.get('dob');
                const cardCount = formData.get('cardCount');

                //#region Validation! :D
                if (typeof firstName !== 'string' || firstName.length < 1 || firstName.length > 100) {
                    return new Response('First name is malformed!', {
                        status: 400,
                    });
                }

                if (typeof lastName !== 'string' || lastName.length < 1 || lastName.length > 100) {
                    return new Response('Last name is malformed!', {
                        status: 400,
                    });
                }

                // MailChecker includes a regex and type checker, however TS gets mad if the type checking isn't there
                if (typeof email !== 'string' || !MailChecker.isValid(email)) {
                    return new Response('Email is malformed!', {
                        status: 400,
                    });
                }

                // Phone number validation is insane
                if (typeof phoneNumber !== 'string' || !Validator.isMobilePhone(phoneNumber)) {
                    return new Response('Phone number is malformed!', {
                        status: 400,
                    });
                }

                const dobRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
                if (typeof dateOfBirth !== 'string' || !dobRegex.test(dateOfBirth)) {
                    return new Response('Date of birth is malformed!', {
                        status: 400,
                    });
                }

                if (typeof cardCount !== 'string') {
                    return new Response('Card count is malformed!', {
                        status: 400,
                    });
                }
                // the sadness takes over
                //#endregion

                await env.DB.prepare("INSERT INTO submissions (first_name, last_name, email, phoneNumber, dateOfBirth, cardCount) VALUES (?, ?, ?, ?, ?, ?)")
                    .bind(firstName.trim(), lastName.trim(), email.trim(), phoneNumber.trim(), dateOfBirth.trim(), Number.parseInt(cardCount.trim()))
                    .all();

                return Response.redirect(`${env.REDIRECT_URL}?registered=true`);
            }
            case "/csv": {
                if (searchParams.get('password') !== env.PASSWORD) {
                    return new Response('Invalid Password', {
                        status: 401,
                    });
                }
                const results = await env.DB.prepare("SELECT * FROM submissions")
                    .all();

                const csv = json2csv(results.results);
                return new Response(csv);
            }

            default: {
                return Response.redirect(env.REDIRECT_URL);
            }
        }
    },
} satisfies ExportedHandler<Env>;