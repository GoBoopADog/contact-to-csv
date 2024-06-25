import { json2csv } from 'json-2-csv';

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

                //#region Validation! :D
                if (typeof firstName !== 'string' || firstName.length < 1 || firstName.length > 100) {
                    return new Response('First name is malformed!!', {
                        status: 400,
                    });
                }

                if (typeof lastName !== 'string' || lastName.length < 1 || lastName.length > 100) {
                    return new Response('Last name is malformed!', {
                        status: 400,
                    });
                }

                const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (typeof email !== 'string' || email.length < 1 || email.length > 100 || !emailRegex.test(email)) {
                    return new Response('Email is malformed', {
                        status: 400,
                    });
                }
                // the sadness takes over
                //#endregion

                await env.DB.prepare("INSERT INTO submissions (first_name, last_name, email) VALUES (?, ?, ?)")
                    .bind(firstName.trim(), lastName.trim(), email.trim())
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